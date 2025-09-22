using AiLootGenerator.RestApi.Models;
using System.ComponentModel.DataAnnotations;

namespace AiLootGenerator.RestApi.Services
{
    /// <summary>
    /// Exception thrown when loot generation fails due to external service issues.
    /// </summary>
    public class LootGenerationException : Exception
    {
        /// <summary>
        /// Initializes a new instance of the LootGenerationException class.
        /// </summary>
        /// <param name="message">The exception message.</param>
        /// <param name="innerException">The inner exception that caused this exception.</param>
        public LootGenerationException(string message, Exception? innerException = null) 
            : base(message, innerException)
        {
        }
    }

    /// <summary>
    /// Main orchestration service for Warhammer Fantasy loot generation.
    /// Coordinates cooldown validation, lore retrieval, and AI generation.
    /// </summary>
    public interface ILootGenerationService
    {
        /// <summary>
        /// Generates a collection of loot items for the given request.
        /// Validates cooldown, searches for relevant lore, and uses AI to generate themed items.
        /// </summary>
        /// <param name="request">The generation request containing location, wealth level, language, and session ID.</param>
        /// <param name="cancellationToken">Cancellation token for the operation.</param>
        /// <returns>A list of 4-6 generated loot items appropriate for the context.</returns>
        /// <exception cref="CooldownActiveException">Thrown when the session is on cooldown.</exception>
        /// <exception cref="LootGenerationException">Thrown when generation fails due to service issues.</exception>
        /// <exception cref="ValidationException">Thrown when the request is invalid.</exception>
        Task<List<LootItem>> GenerateLootAsync(GenerationRequest request, CancellationToken cancellationToken = default);
    }

    /// <summary>
    /// Implementation of loot generation orchestration service.
    /// </summary>
    public class LootGenerationService : ILootGenerationService
    {
        private readonly ICooldownService _cooldownService;
        private readonly IQdrantService _qdrantService;
        private readonly IOpenAIService _openAIService;
        private readonly ILogger<LootGenerationService> _logger;

        public LootGenerationService(
            ICooldownService cooldownService,
            IQdrantService qdrantService,
            IOpenAIService openAIService,
            ILogger<LootGenerationService> logger)
        {
            _cooldownService = cooldownService ?? throw new ArgumentNullException(nameof(cooldownService));
            _qdrantService = qdrantService ?? throw new ArgumentNullException(nameof(qdrantService));
            _openAIService = openAIService ?? throw new ArgumentNullException(nameof(openAIService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <inheritdoc/>
        public async Task<List<LootItem>> GenerateLootAsync(GenerationRequest request, CancellationToken cancellationToken = default)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            // Validate the request
            ValidateRequest(request);

            var sessionId = request.SessionId;
            
            _logger.LogInformation("Starting loot generation for session {SessionId}, location: {Location}, wealth: {WealthLevel}, language: {Language}",
                sessionId, request.Location, request.WealthLevel, request.Language);

            try
            {
                // Step 1: Validate cooldown - throws CooldownActiveException if on cooldown
                _cooldownService.ValidateSessionNotOnCooldown(sessionId);
                _logger.LogDebug("Cooldown validation passed for session {SessionId}", sessionId);

                // Step 2: Search for relevant lore context
                string? loreContext = null;
                try
                {
                    loreContext = await _qdrantService.SearchRelevantLoreAsync(
                        request.Location, 
                        request.WealthLevel, 
                        cancellationToken);
                    
                    if (!string.IsNullOrEmpty(loreContext))
                    {
                        _logger.LogDebug("Retrieved lore context for session {SessionId}: {LoreContextLength} characters",
                            sessionId, loreContext.Length);
                    }
                    else
                    {
                        _logger.LogDebug("No relevant lore context found for session {SessionId}", sessionId);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to retrieve lore context for session {SessionId}, continuing without lore enrichment", sessionId);
                    // Continue without lore context - not critical for generation
                }

                // Step 3: Generate loot using OpenAI
                List<LootItem> generatedLoot;
                try
                {
                    generatedLoot = await _openAIService.GenerateLootAsync(request, loreContext, cancellationToken);
                    _logger.LogDebug("Successfully generated {ItemCount} loot items for session {SessionId}", 
                        generatedLoot.Count, sessionId);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to generate loot using OpenAI for session {SessionId}", sessionId);
                    throw new LootGenerationException("Failed to generate loot items using AI service", ex);
                }

                // Step 4: Record generation timestamp to start cooldown
                _cooldownService.RecordGeneration(sessionId);
                _logger.LogDebug("Recorded generation timestamp for session {SessionId}, cooldown started", sessionId);

                _logger.LogInformation("Successfully completed loot generation for session {SessionId}, generated {ItemCount} items",
                    sessionId, generatedLoot.Count);

                return generatedLoot;
            }
            catch (CooldownActiveException)
            {
                _logger.LogDebug("Cooldown validation failed for session {SessionId}", sessionId);
                throw; // Re-throw cooldown exceptions as-is
            }
            catch (LootGenerationException)
            {
                throw; // Re-throw loot generation exceptions as-is
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during loot generation for session {SessionId}", sessionId);
                throw new LootGenerationException("An unexpected error occurred during loot generation", ex);
            }
        }

        /// <summary>
        /// Validates the generation request parameters.
        /// </summary>
        /// <param name="request">The request to validate.</param>
        /// <exception cref="ValidationException">Thrown when validation fails.</exception>
        private void ValidateRequest(GenerationRequest request)
        {
            var validationResults = new List<ValidationResult>();
            var validationContext = new ValidationContext(request);

            if (!Validator.TryValidateObject(request, validationContext, validationResults, true))
            {
                var errors = string.Join("; ", validationResults.Select(vr => vr.ErrorMessage));
                throw new ValidationException($"Request validation failed: {errors}");
            }

            // Additional custom validation
            if (request.SessionId == Guid.Empty)
            {
                throw new ValidationException("SessionId must be a valid non-empty GUID");
            }
        }
    }
}