using Qdrant.Client;
using Qdrant.Client.Grpc;
using AiLootGenerator.RestApi.Models;
using AiLootGenerator.RestApi.Configuration;
using System.ComponentModel.DataAnnotations;
using Microsoft.Extensions.Options;

namespace AiLootGenerator.RestApi.Services
{
    /// <summary>
    /// Service for semantic search of Warhammer Fantasy lore using Qdrant vector database.
    /// Provides contextual lore to enrich OpenAI prompt generation.
    /// </summary>
    public interface IQdrantService
    {
        /// <summary>
        /// Searches for relevant lore content based on location and context.
        /// </summary>
        /// <param name="location">The location description to search for relevant lore.</param>
        /// <param name="wealthLevel">The wealth level to help focus the search context.</param>
        /// <param name="cancellationToken">Cancellation token for the operation.</param>
        /// <returns>Relevant lore context string or null if no relevant content found.</returns>
        Task<string?> SearchRelevantLoreAsync(string location, WealthLevel wealthLevel, CancellationToken cancellationToken = default);

        /// <summary>
        /// Adds multiple lore items to the vector database in a batch operation.
        /// </summary>
        /// <param name="loreItems">The collection of lore items to add to the database.</param>
        /// <param name="cancellationToken">Cancellation token for the operation.</param>
        /// <returns>The number of successfully added lore items.</returns>
        Task<int> AddLoreItemsBatchAsync(IEnumerable<LoreItem> loreItems, CancellationToken cancellationToken = default);

        /// <summary>
        /// Checks if the Qdrant service is healthy and accessible.
        /// </summary>
        /// <param name="cancellationToken">Cancellation token for the operation.</param>
        /// <returns>True if the service is healthy, false otherwise.</returns>
        Task<bool> IsHealthyAsync(CancellationToken cancellationToken = default);
    }

    /// <summary>
    /// Implementation of Qdrant service for Warhammer Fantasy lore semantic search.
    /// </summary>
    public class QdrantService : IQdrantService
    {
        private readonly QdrantClient _qdrantClient;
        private readonly IOpenAIService _openAIService;
        private readonly ILogger<QdrantService> _logger;
        private readonly QdrantSettings _settings;

        public QdrantService(
            QdrantClient qdrantClient, 
            IOpenAIService openAIService,
            ILogger<QdrantService> logger,
            IOptions<QdrantSettings> settings)
        {
            _qdrantClient = qdrantClient ?? throw new ArgumentNullException(nameof(qdrantClient));
            _openAIService = openAIService ?? throw new ArgumentNullException(nameof(openAIService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _settings = settings?.Value ?? throw new ArgumentNullException(nameof(settings));
        }

        /// <inheritdoc/>
        public async Task<string?> SearchRelevantLoreAsync(string location, WealthLevel wealthLevel, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(location))
                throw new ArgumentException("Location cannot be null or empty", nameof(location));

            _logger.LogInformation("Searching for lore relevant to location: {Location}, WealthLevel: {WealthLevel}", 
                location, wealthLevel);

            try
            {
                // Create search query combining location and wealth context
                var searchQuery = $"{location} {wealthLevel.ToString().ToLower()} treasure items loot";
                
                // Get embedding for the search query
                var queryEmbedding = await GetEmbeddingAsync(searchQuery, cancellationToken);
                
                if (queryEmbedding == null || queryEmbedding.Length == 0)
                {
                    _logger.LogWarning("Failed to generate embedding for search query: {Query}", searchQuery);
                    return null;
                }

                // Perform semantic search
                var searchResults = await _qdrantClient.SearchAsync(
                    collectionName: _settings.CollectionName,
                    vector: queryEmbedding,
                    limit: (ulong)_settings.MaxSearchResults,
                    scoreThreshold: _settings.SimilarityThreshold,
                    payloadSelector: new WithPayloadSelector { Enable = true },
                    cancellationToken: cancellationToken
                );

                if (searchResults == null || !searchResults.Any())
                {
                    _logger.LogInformation("No relevant lore found for location: {Location}", location);
                    return null;
                }

                // Combine relevant lore results
                var loreContexts = searchResults
                    .Where(result => result.Score >= _settings.SimilarityThreshold)
                    .Select(result => ExtractContentFromPayload(result.Payload))
                    .Where(content => !string.IsNullOrWhiteSpace(content))
                    .Take(_settings.MaxSearchResults)
                    .ToList();

                if (!loreContexts.Any())
                {
                    _logger.LogInformation("No lore content above similarity threshold for location: {Location}", location);
                    return null;
                }

                var combinedLore = string.Join("\n\n", loreContexts);
                _logger.LogInformation("Found {Count} relevant lore entries for location: {Location}", loreContexts.Count, location);
                
                return combinedLore;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching for lore content for location: {Location}", location);
                throw new InvalidOperationException($"Failed to search lore content: {ex.Message}", ex);
            }
        }

        /// <inheritdoc/>
        public async Task<int> AddLoreItemsBatchAsync(IEnumerable<LoreItem> loreItems, CancellationToken cancellationToken = default)
        {
            if (loreItems == null)
                throw new ArgumentNullException(nameof(loreItems));

            var loreItemsList = loreItems.ToList();
            if (!loreItemsList.Any())
            {
                _logger.LogWarning("No lore items provided for batch insert");
                return 0;
            }

            // Validate all lore items
            foreach (var loreItem in loreItemsList)
            {
                var validationResults = new List<ValidationResult>();
                var validationContext = new ValidationContext(loreItem);
                if (!Validator.TryValidateObject(loreItem, validationContext, validationResults, true))
                {
                    var errorMessage = string.Join("; ", validationResults.Select(r => r.ErrorMessage));
                    throw new ArgumentException($"Invalid lore item '{loreItem.Name}': {errorMessage}", nameof(loreItems));
                }
            }

            _logger.LogInformation("Adding {Count} lore items in batch", loreItemsList.Count);

            try
            {
                var points = new List<PointStruct>();

                foreach (var loreItem in loreItemsList)
                {
                    // Generate embedding for the lore content
                    var embeddingText = $"{loreItem.Name} {loreItem.Description} {string.Join(" ", loreItem.Tags)}";
                    var embedding = await GetEmbeddingAsync(embeddingText, cancellationToken);

                    if (embedding == null || embedding.Length == 0)
                    {
                        _logger.LogWarning("Failed to generate embedding for lore item: {Name}", loreItem.Name);
                        continue;
                    }

                    // Create point ID
                    var pointId = loreItem.Id.ToString();

                    // Create payload
                    var payload = new Dictionary<string, Value>
                    {
                        ["name"] = loreItem.Name,
                        ["description"] = loreItem.Description,
                        ["valueInPennies"] = loreItem.ValueInPennies,
                        ["tags"] = string.Join(",", loreItem.Tags),
                        ["created_at"] = DateTime.UtcNow.ToString("O")
                    };

                    // Create point
                    var point = new PointStruct
                    {
                        Id = new PointId { Uuid = pointId },
                        Vectors = embedding,
                        Payload = { payload }
                    };

                    points.Add(point);
                }

                if (!points.Any())
                {
                    _logger.LogWarning("No valid points created for batch insert");
                    return 0;
                }

                // Batch upsert points
                var response = await _qdrantClient.UpsertAsync(
                    collectionName: _settings.CollectionName,
                    points: points,
                    cancellationToken: cancellationToken
                );

                if (response?.Status != UpdateStatus.Completed)
                {
                    throw new InvalidOperationException($"Failed to add lore items to vector database. Status: {response?.Status}");
                }

                _logger.LogInformation("Successfully added {Count} lore items to vector database", points.Count);
                return points.Count;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding lore items batch");
                throw;
            }
        }

        /// <inheritdoc/>
        public async Task<bool> IsHealthyAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogDebug("Checking Qdrant service health");
                
                // Check if we can connect to Qdrant and the collection exists
                var collections = await _qdrantClient.ListCollectionsAsync(cancellationToken);
                
                var collectionExists = collections?.Any(c => c == _settings.CollectionName) == true;
                
                if (!collectionExists)
                {
                    _logger.LogWarning("Qdrant collection {CollectionName} does not exist", _settings.CollectionName);
                    return false;
                }

                _logger.LogDebug("Qdrant service health check passed");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Qdrant service health check failed");
                return false;
            }
        }

        /// <summary>
        /// Generates an embedding for the given text using OpenAI's embedding model.
        /// </summary>
        private async Task<float[]?> GetEmbeddingAsync(string text, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(text))
                return null;

            try
            {
                _logger.LogDebug("Generating embedding for text: {TextPreview}...", text.Length > 50 ? text[..50] : text);
                
                return await _openAIService.GetEmbeddingAsync(text, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating embedding for text");
                return null;
            }
        }

        /// <summary>
        /// Extracts content from the Qdrant search result payload.
        /// Returns formatted string with name, description, and value in pennies.
        /// </summary>
        private static string? ExtractContentFromPayload(IReadOnlyDictionary<string, Value>? payload)
        {
            if (payload == null)
                return null;

            var name = GetStringValue(payload, "name");
            var description = GetStringValue(payload, "description");
            var valueInPennies = GetIntegerValue(payload, "valueInPennies");

            // Return formatted content if we have at least name and description
            if (!string.IsNullOrWhiteSpace(name) && !string.IsNullOrWhiteSpace(description))
            {
                return $"{name}: {description} (Value: {valueInPennies} pennies)";
            }

            // Fallback to just description if name is missing
            return !string.IsNullOrWhiteSpace(description) ? description : null;
        }

        /// <summary>
        /// Extracts a string value from the payload dictionary.
        /// </summary>
        private static string? GetStringValue(IReadOnlyDictionary<string, Value> payload, string key)
        {
            return payload.TryGetValue(key, out var value) && !string.IsNullOrWhiteSpace(value.StringValue) 
                ? value.StringValue 
                : null;
        }

        /// <summary>
        /// Extracts an integer value from the payload dictionary.
        /// </summary>
        private static int GetIntegerValue(IReadOnlyDictionary<string, Value> payload, string key)
        {
            if (!payload.TryGetValue(key, out var value))
                return 0;

            return value.IntegerValue != 0 ? (int)value.IntegerValue : (int)value.DoubleValue;
        }
    }
}