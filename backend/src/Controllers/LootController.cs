using AiLootGenerator.RestApi.Models;
using AiLootGenerator.RestApi.Services;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace AiLootGenerator.RestApi.Controllers
{
    /// <summary>
    /// API controller for loot generation functionality.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class LootController : ControllerBase
    {
        private readonly ILootGenerationService _lootGenerationService;
        private readonly ILogger<LootController> _logger;

        /// <summary>
        /// Initializes a new instance of the LootController.
        /// </summary>
        /// <param name="lootGenerationService">Service for generating loot items.</param>
        /// <param name="logger">Logger for the controller.</param>
        public LootController(ILootGenerationService lootGenerationService, ILogger<LootController> logger)
        {
            _lootGenerationService = lootGenerationService ?? throw new ArgumentNullException(nameof(lootGenerationService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Generates loot items for a specific location and wealth level.
        /// Creates 4-6 thematic loot items based on location context, wealth level, and user language preference.
        /// </summary>
        /// <param name="request">The generation request containing location, wealth level, language, and session ID.</param>
        /// <param name="cancellationToken">Cancellation token for the operation.</param>
        /// <returns>A response containing generated loot items and metadata.</returns>
        [HttpPost("generate")]
        [ProducesResponseType(typeof(GenerationResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(CooldownErrorResponse), StatusCodes.Status429TooManyRequests)]
        [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GenerateLoot([FromBody] GenerationRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Received loot generation request for location '{Location}', wealth level '{WealthLevel}', language '{Language}', session '{SessionId}'",
                    request.Location, request.WealthLevel, request.Language, request.SessionId);

                // Validate the request model
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid request model for session '{SessionId}': {Errors}",
                        request.SessionId, string.Join(", ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)));

                    var firstError = ModelState.Values.SelectMany(v => v.Errors).First();
                    var firstKey = ModelState.Keys.First(k => ModelState[k]?.Errors.Count > 0);

                    return BadRequest(new ErrorResponse
                    {
                        Error = "ValidationError",
                        Message = firstError.ErrorMessage,
                        Details = new Dictionary<string, object>
                        {
                            ["field"] = firstKey.ToLowerInvariant(),
                            ["value"] = ModelState[firstKey]?.AttemptedValue ?? ""
                        }
                    });
                }

                // Generate loot items
                var items = await _lootGenerationService.GenerateLootAsync(request, cancellationToken);

                var response = new GenerationResponse
                {
                    Items = items,
                    GeneratedAt = DateTime.UtcNow,
                    CooldownExpiresAt = DateTime.UtcNow.AddSeconds(30) // 30-second cooldown
                };

                _logger.LogInformation("Successfully generated {ItemCount} loot items for session '{SessionId}'",
                    items.Count, request.SessionId);

                return Ok(response);
            }
            catch (OperationCanceledException)
            {
                // Re-throw cancellation exceptions without logging as errors
                throw;
            }
            catch (CooldownActiveException ex)
            {
                _logger.LogWarning("Cooldown active for session '{SessionId}': {Message}",
                    request.SessionId, ex.Message);

                return StatusCode(StatusCodes.Status429TooManyRequests, new CooldownErrorResponse
                {
                    Error = "CooldownActive",
                    Message = "Please wait before generating more loot",
                    RemainingSeconds = ex.RemainingSeconds,
                    RetryAfter = ex.RetryAfter,
                    Details = new Dictionary<string, object>
                    {
                        ["sessionId"] = request.SessionId.ToString()
                    }
                });
            }
            catch (ValidationException ex)
            {
                _logger.LogWarning("Validation error for session '{SessionId}': {Message}",
                    request.SessionId, ex.Message);

                return BadRequest(new ErrorResponse
                {
                    Error = "ValidationError",
                    Message = ex.Message,
                    Details = new Dictionary<string, object>
                    {
                        ["sessionId"] = request.SessionId.ToString()
                    }
                });
            }
            catch (LootGenerationException ex)
            {
                _logger.LogError(ex, "Loot generation failed for session '{SessionId}': {Message}",
                    request.SessionId, ex.Message);

                return StatusCode(StatusCodes.Status500InternalServerError, new ErrorResponse
                {
                    Error = "GenerationFailed",
                    Message = "Failed to generate loot items. Please try again later.",
                    Details = new Dictionary<string, object>
                    {
                        ["sessionId"] = request.SessionId.ToString()
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during loot generation for session '{SessionId}'",
                    request.SessionId);

                return StatusCode(StatusCodes.Status500InternalServerError, new ErrorResponse
                {
                    Error = "InternalError",
                    Message = "An unexpected error occurred. Please try again later.",
                    Details = new Dictionary<string, object>
                    {
                        ["sessionId"] = request.SessionId.ToString()
                    }
                });
            }
        }

        /// <summary>
        /// Gets all available wealth levels with their ranges and descriptions.
        /// </summary>
        /// <returns>A response containing all wealth levels with their penny ranges.</returns>
        [HttpGet("wealth-levels")]
        [ProducesResponseType(typeof(WealthLevelsResponse), StatusCodes.Status200OK)]
        public IActionResult GetWealthLevels()
        {
            _logger.LogInformation("Retrieving wealth levels information");

            var wealthLevels = new List<WealthLevelInfo>
            {
                new WealthLevelInfo { Value = 1, Name = "Rubbish", Range = "1-12 pennies" },
                new WealthLevelInfo { Value = 2, Name = "Poor", Range = "13-60 pennies" },
                new WealthLevelInfo { Value = 3, Name = "Common", Range = "61-240 pennies" },
                new WealthLevelInfo { Value = 4, Name = "Wealthy", Range = "241-1200 pennies" },
                new WealthLevelInfo { Value = 5, Name = "Noble", Range = "1201-3600 pennies" },
                new WealthLevelInfo { Value = 6, Name = "Treasure", Range = "3601+ pennies" }
            };

            return Ok(new WealthLevelsResponse { WealthLevels = wealthLevels });
        }
    }

    /// <summary>
    /// Response model for successful loot generation.
    /// </summary>
    public class GenerationResponse
    {
        /// <summary>
        /// Generated loot items (4-6 items).
        /// </summary>
        public List<LootItem> Items { get; set; } = new();

        /// <summary>
        /// Timestamp when items were generated.
        /// </summary>
        public DateTime GeneratedAt { get; set; }

        /// <summary>
        /// When the user can generate loot again.
        /// </summary>
        public DateTime CooldownExpiresAt { get; set; }
    }

    /// <summary>
    /// Error response model for validation and general errors.
    /// </summary>
    public class ErrorResponse
    {
        /// <summary>
        /// Error type identifier.
        /// </summary>
        public string Error { get; set; } = string.Empty;

        /// <summary>
        /// Human-readable error message.
        /// </summary>
        public string Message { get; set; } = string.Empty;

        /// <summary>
        /// Additional error context.
        /// </summary>
        public Dictionary<string, object> Details { get; set; } = new();
    }

    /// <summary>
    /// Error response model specifically for cooldown errors.
    /// </summary>
    public class CooldownErrorResponse : ErrorResponse
    {
        /// <summary>
        /// Seconds remaining in cooldown period.
        /// </summary>
        public int RemainingSeconds { get; set; }

        /// <summary>
        /// When user can retry the request.
        /// </summary>
        public DateTime RetryAfter { get; set; }
    }

    /// <summary>
    /// Response model for wealth levels endpoint.
    /// </summary>
    public class WealthLevelsResponse
    {
        /// <summary>
        /// Available wealth levels with their information.
        /// </summary>
        public List<WealthLevelInfo> WealthLevels { get; set; } = new();
    }

    /// <summary>
    /// Information about a specific wealth level.
    /// </summary>
    public class WealthLevelInfo
    {
        /// <summary>
        /// Numeric value of the wealth level.
        /// </summary>
        public int Value { get; set; }

        /// <summary>
        /// Display name of the wealth level.
        /// </summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Penny range for this wealth level.
        /// </summary>
        public string Range { get; set; } = string.Empty;
    }
}