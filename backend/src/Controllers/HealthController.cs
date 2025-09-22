using Microsoft.AspNetCore.Mvc;
using AiLootGenerator.RestApi.Services;

namespace AiLootGenerator.RestApi.Controllers;

/// <summary>
/// Health check controller for monitoring service status
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly IOpenAIService _openAIService;
    private readonly IQdrantService _qdrantService;
    private readonly ILogger<HealthController> _logger;

    public HealthController(
        IOpenAIService openAIService,
        IQdrantService qdrantService,
        ILogger<HealthController> logger)
    {
        _openAIService = openAIService ?? throw new ArgumentNullException(nameof(openAIService));
        _qdrantService = qdrantService ?? throw new ArgumentNullException(nameof(qdrantService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// Returns the health status of the API and its dependencies
    /// </summary>
    /// <returns>Health status response</returns>
    [HttpGet]
    [ProducesResponseType(typeof(HealthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(HealthResponse), StatusCodes.Status503ServiceUnavailable)]
    public async Task<IActionResult> GetHealth()
    {
        _logger.LogInformation("Health check requested");

        var openAIHealthy = await _openAIService.IsHealthyAsync();
        var qdrantHealthy = await _qdrantService.IsHealthyAsync();

        var allHealthy = openAIHealthy && qdrantHealthy;
        var overallStatus = allHealthy ? "Healthy" : "Unhealthy";

        var response = new HealthResponse
        {
            Status = overallStatus,
            Timestamp = DateTime.UtcNow,
            Services = new HealthServiceStatus
            {
                OpenAI = openAIHealthy ? "Healthy" : "Unhealthy",
                Qdrant = qdrantHealthy ? "Healthy" : "Unhealthy",
            }
        };

        _logger.LogInformation(
            "Health check completed: Overall={OverallStatus}, OpenAI={OpenAIStatus}, Qdrant={QdrantStatus}",
            overallStatus, response.Services.OpenAI, response.Services.Qdrant);

        return allHealthy ? Ok(response) : StatusCode(503, response);
    }
}

/// <summary>
/// Health response model matching OpenAPI specification
/// </summary>
public class HealthResponse
{
    /// <summary>
    /// Overall service health status
    /// </summary>
    public string Status { get; set; } = string.Empty;

    /// <summary>
    /// Health check timestamp
    /// </summary>
    public DateTime Timestamp { get; set; }

    /// <summary>
    /// Health status of individual services
    /// </summary>
    public HealthServiceStatus Services { get; set; } = new();
}

/// <summary>
/// Individual service health status
/// </summary>
public class HealthServiceStatus
{
    /// <summary>
    /// OpenAI service health status
    /// </summary>
    public string OpenAI { get; set; } = string.Empty;

    /// <summary>
    /// Qdrant service health status
    /// </summary>
    public string Qdrant { get; set; } = string.Empty;
}