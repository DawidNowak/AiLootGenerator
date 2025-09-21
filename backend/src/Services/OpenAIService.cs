using OpenAI.Chat;
using AiLootGenerator.RestApi.Models;
using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace AiLootGenerator.RestApi.Services
{
    /// <summary>
    /// Service for generating loot items using OpenAI's chat completion API.
    /// Handles prompt construction, API communication, and response parsing.
    /// </summary>
    public interface IOpenAIService
    {
        /// <summary>
        /// Generates 4-6 loot items based on the provided request context.
        /// </summary>
        /// <param name="request">The generation request containing location, wealth level, and language.</param>
        /// <param name="loreContext">Optional lore context from vector search to enrich the prompt.</param>
        /// <param name="cancellationToken">Cancellation token for the operation.</param>
        /// <returns>A list of generated loot items.</returns>
        Task<List<LootItem>> GenerateLootAsync(GenerationRequest request, string? loreContext = null, CancellationToken cancellationToken = default);
    }

    /// <summary>
    /// Implementation of OpenAI service for Warhammer Fantasy loot generation.
    /// </summary>
    public class OpenAIService : IOpenAIService
    {
        private readonly ChatClient _chatClient;
        private readonly ILogger<OpenAIService> _logger;

        public OpenAIService(ChatClient chatClient, ILogger<OpenAIService> logger)
        {
            _chatClient = chatClient ?? throw new ArgumentNullException(nameof(chatClient));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <inheritdoc/>
        public async Task<List<LootItem>> GenerateLootAsync(GenerationRequest request, string? loreContext = null, CancellationToken cancellationToken = default)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            // Validate the request
            var validationResults = new List<ValidationResult>();
            var validationContext = new ValidationContext(request);
            if (!Validator.TryValidateObject(request, validationContext, validationResults, true))
            {
                var errorMessage = string.Join("; ", validationResults.Select(r => r.ErrorMessage));
                throw new ArgumentException($"Invalid generation request: {errorMessage}", nameof(request));
            }

            _logger.LogInformation("Generating loot for location: {Location}, WealthLevel: {WealthLevel}, Language: {Language}", 
                request.Location, request.WealthLevel, request.Language);

            try
            {
                var prompt = BuildPrompt(request, loreContext);
                var messages = new List<ChatMessage>
                {
                    new SystemChatMessage(GetSystemPrompt(request.Language)),
                    new UserChatMessage(prompt)
                };

                var chatCompletionOptions = new ChatCompletionOptions
                {
                    MaxOutputTokenCount = 1000,
                    Temperature = 0.8f, // Higher temperature for more creative variation
                    FrequencyPenalty = 0.3f, // Reduce repetition
                    PresencePenalty = 0.1f
                };

                var response = await _chatClient.CompleteChatAsync(messages, chatCompletionOptions, cancellationToken);
                
                if (response?.Value?.Content == null || response.Value.Content.Count == 0)
                {
                    _logger.LogError("Received null or empty response from OpenAI");
                    throw new InvalidOperationException("Failed to generate loot: Empty response from OpenAI");
                }

                var content = response.Value.Content[0].Text;
                _logger.LogDebug("OpenAI Response: {Content}", content);

                var lootItems = ParseLootItemsFromResponse(content, request.WealthLevel);
                
                _logger.LogInformation("Successfully generated {Count} loot items", lootItems.Count);
                return lootItems;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating loot items for location: {Location}", request.Location);
                throw;
            }
        }

        /// <summary>
        /// Builds the user prompt for loot generation based on the request context.
        /// </summary>
        internal string BuildPrompt(GenerationRequest request, string? loreContext)
        {
            var wealthDescription = GetWealthDescription(request.WealthLevel);
            var languageInstruction = request.Language == "pl" ? "Respond in Polish" : "Respond in English";
            
            var prompt = $@"Generate 4-6 loot items for the following location in Warhammer Fantasy Roleplay:

Location: {request.Location}
Wealth Level: {wealthDescription}
Language: {languageInstruction}

{(string.IsNullOrEmpty(loreContext) ? "" : $"Relevant Lore Context:\n{loreContext}\n")}

Please generate items that are:
1. Thematically appropriate for the location
2. Fitting for the {request.WealthLevel} wealth level ({wealthDescription})
3. Authentic to Warhammer Fantasy lore and atmosphere
4. Varied in type (weapons, armor, clothing, tools, trinkets, etc.)

Return the response as a JSON array with the following structure:
[
  {{
    ""name"": ""Item Name"",
    ""description"": ""Detailed description for immersion"",
    ""valueInPennies"": number
  }}
]

Value ranges for each wealth level (in pennies):
- Rubbish: 1-12 pennies
- Poor: 13-60 pennies  
- Common: 61-240 pennies
- Wealthy: 241-1200 pennies
- Noble: 1201+ pennies";

            return prompt;
        }

        /// <summary>
        /// Gets the system prompt that defines the AI's role and behavior.
        /// </summary>
        internal string GetSystemPrompt(string language)
        {
            var basePrompt = @"You are a Warhammer Fantasy Roleplay Game Master assistant specializing in creating authentic, thematic loot items. 

Your expertise includes:
- Deep knowledge of Warhammer Fantasy lore, locations, and cultures
- Understanding of medieval technology levels and craftsmanship
- Ability to create items that feel authentic to the grimdark fantasy setting
- Knowledge of appropriate naming conventions for different regions

Guidelines:
- Focus on immersion and thematic consistency
- Consider the practical needs of adventurers
- Include regional variations in craftsmanship and style
- Balance mundane items with occasional unique pieces
- Ensure descriptions are evocative but concise
- Always respond with valid JSON format";

            if (language == "pl")
            {
                return basePrompt + "\n\nIMPORTANT: Generate all item names and descriptions in Polish. Use appropriate Polish terminology for Warhammer Fantasy elements.";
            }

            return basePrompt + "\n\nIMPORTANT: Generate all item names and descriptions in English.";
        }

        /// <summary>
        /// Gets a human-readable description of the wealth level.
        /// </summary>
        internal string GetWealthDescription(WealthLevel wealthLevel)
        {
            return wealthLevel switch
            {
                WealthLevel.Rubbish => "junk items, lowest tier (1-12 pennies)",
                WealthLevel.Poor => "peasant scraps, basic items (13-60 pennies)",
                WealthLevel.Common => "everyday goods, standard quality (61-240 pennies)",
                WealthLevel.Wealthy => "merchant spoils, valuable items (241-1200 pennies)",
                WealthLevel.Noble => "opulent treasures, rare items (1201+ pennies)",
                _ => "unknown wealth level"
            };
        }

        /// <summary>
        /// Parses the OpenAI response to extract LootItem objects.
        /// </summary>
        internal List<LootItem> ParseLootItemsFromResponse(string response, WealthLevel requestedWealthLevel)
        {
            try
            {
                // Try to extract JSON from the response (OpenAI sometimes includes extra text)
                var jsonStart = response.IndexOf('[');
                var jsonEnd = response.LastIndexOf(']');
                
                if (jsonStart == -1 || jsonEnd == -1 || jsonStart >= jsonEnd)
                {
                    throw new InvalidOperationException("No valid JSON array found in OpenAI response");
                }

                var jsonContent = response.Substring(jsonStart, jsonEnd - jsonStart + 1);
                
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true,
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                };

                var rawItems = JsonSerializer.Deserialize<List<RawLootItem>>(jsonContent, options);
                
                if (rawItems == null || rawItems.Count == 0)
                {
                    throw new InvalidOperationException("Failed to parse loot items from OpenAI response");
                }

                var lootItems = new List<LootItem>();
                
                foreach (var rawItem in rawItems)
                {
                    if (string.IsNullOrWhiteSpace(rawItem.Name) || 
                        string.IsNullOrWhiteSpace(rawItem.Description) || 
                        rawItem.ValueInPennies <= 0)
                    {
                        _logger.LogWarning("Skipping invalid item: {Item}", JsonSerializer.Serialize(rawItem));
                        continue;
                    }

                    var lootItem = new LootItem
                    {
                        Name = rawItem.Name.Trim(),
                        Description = rawItem.Description.Trim(),
                        ValueInPennies = rawItem.ValueInPennies,
                        WealthLevel = DetermineWealthLevel(rawItem.ValueInPennies) ?? requestedWealthLevel
                    };

                    // Validate the constructed loot item
                    var validationResults = new List<ValidationResult>();
                    var validationContext = new ValidationContext(lootItem);
                    if (Validator.TryValidateObject(lootItem, validationContext, validationResults, true))
                    {
                        lootItems.Add(lootItem);
                    }
                    else
                    {
                        _logger.LogWarning("Skipping invalid loot item: {ValidationErrors}", 
                            string.Join("; ", validationResults.Select(r => r.ErrorMessage)));
                    }
                }

                if (lootItems.Count == 0)
                {
                    throw new InvalidOperationException("No valid loot items could be parsed from OpenAI response");
                }

                return lootItems;
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Failed to parse JSON from OpenAI response: {Response}", response);
                throw new InvalidOperationException("Failed to parse loot items: Invalid JSON format", ex);
            }
        }

        /// <summary>
        /// Determines the wealth level based on the item's value in pennies.
        /// </summary>
        internal WealthLevel? DetermineWealthLevel(int valueInPennies)
        {
            return valueInPennies switch
            {
                >= 1 and <= 12 => WealthLevel.Rubbish,
                >= 13 and <= 60 => WealthLevel.Poor,
                >= 61 and <= 240 => WealthLevel.Common,
                >= 241 and <= 1200 => WealthLevel.Wealthy,
                >= 1201 => WealthLevel.Noble,
                _ => null
            };
        }

        /// <summary>
        /// Helper class for deserializing raw loot items from OpenAI response.
        /// </summary>
        private class RawLootItem
        {
            [JsonPropertyName("name")]
            public string Name { get; set; } = string.Empty;

            [JsonPropertyName("description")]
            public string Description { get; set; } = string.Empty;

            [JsonPropertyName("valueInPennies")]
            public int ValueInPennies { get; set; }
        }
    }
}