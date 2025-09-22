using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using AiLootGenerator.RestApi.Controllers;
using AiLootGenerator.RestApi.Services;

namespace AiLootGenerator.RestApi.Tests.Unit;

/// <summary>
/// Unit tests for HealthController
/// </summary>
public class HealthControllerTests
{
    private readonly Mock<IOpenAIService> _mockOpenAIService;
    private readonly Mock<IQdrantService> _mockQdrantService;
    private readonly Mock<ILogger<HealthController>> _mockLogger;
    private readonly HealthController _controller;

    public HealthControllerTests()
    {
        _mockOpenAIService = new Mock<IOpenAIService>();
        _mockQdrantService = new Mock<IQdrantService>();
        _mockLogger = new Mock<ILogger<HealthController>>();

        _controller = new HealthController(
            _mockOpenAIService.Object,
            _mockQdrantService.Object,
            _mockLogger.Object);
    }

    [Fact]
    public void Constructor_WithNullOpenAIService_ThrowsArgumentNullException()
    {
        // Arrange, Act & Assert
        Assert.Throws<ArgumentNullException>(() => new HealthController(
            null!,
            _mockQdrantService.Object,
            _mockLogger.Object));
    }

    [Fact]
    public void Constructor_WithNullQdrantService_ThrowsArgumentNullException()
    {
        // Arrange, Act & Assert
        Assert.Throws<ArgumentNullException>(() => new HealthController(
            _mockOpenAIService.Object,
            null!,
            _mockLogger.Object));
    }

    [Fact]
    public void Constructor_WithNullLogger_ThrowsArgumentNullException()
    {
        // Arrange, Act & Assert
        Assert.Throws<ArgumentNullException>(() => new HealthController(
            _mockOpenAIService.Object,
            _mockQdrantService.Object,
            null!));
    }

    [Fact]
    public async Task GetHealth_WhenAllServicesHealthy_ReturnsOkWithHealthyStatus()
    {
        // Arrange
        _mockOpenAIService.Setup(x => x.IsHealthyAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _mockQdrantService.Setup(x => x.IsHealthyAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.GetHealth();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var healthResponse = Assert.IsType<HealthResponse>(okResult.Value);

        Assert.Equal("Healthy", healthResponse.Status);
        Assert.Equal("Healthy", healthResponse.Services.OpenAI);
        Assert.Equal("Healthy", healthResponse.Services.Qdrant);
    }

    [Fact]
    public async Task GetHealth_WhenOpenAIUnhealthy_ReturnsServiceUnavailableWithUnhealthyStatus()
    {
        // Arrange
        _mockOpenAIService.Setup(x => x.IsHealthyAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _mockQdrantService.Setup(x => x.IsHealthyAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.GetHealth();

        // Assert
        var statusCodeResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(503, statusCodeResult.StatusCode);
        
        var healthResponse = Assert.IsType<HealthResponse>(statusCodeResult.Value);
        Assert.Equal("Unhealthy", healthResponse.Status);
        Assert.Equal("Unhealthy", healthResponse.Services.OpenAI);
        Assert.Equal("Healthy", healthResponse.Services.Qdrant);
    }

    [Fact]
    public async Task GetHealth_WhenQdrantUnhealthy_ReturnsServiceUnavailableWithUnhealthyStatus()
    {
        // Arrange
        _mockOpenAIService.Setup(x => x.IsHealthyAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _mockQdrantService.Setup(x => x.IsHealthyAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        // Act
        var result = await _controller.GetHealth();

        // Assert
        var statusCodeResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(503, statusCodeResult.StatusCode);
        
        var healthResponse = Assert.IsType<HealthResponse>(statusCodeResult.Value);
        Assert.Equal("Unhealthy", healthResponse.Status);
        Assert.Equal("Healthy", healthResponse.Services.OpenAI);
        Assert.Equal("Unhealthy", healthResponse.Services.Qdrant);
    }

    [Fact]
    public async Task GetHealth_WhenAllServicesUnhealthy_ReturnsServiceUnavailableWithUnhealthyStatus()
    {
        // Arrange
        _mockOpenAIService.Setup(x => x.IsHealthyAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _mockQdrantService.Setup(x => x.IsHealthyAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        // Act
        var result = await _controller.GetHealth();

        // Assert
        var statusCodeResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(503, statusCodeResult.StatusCode);
        
        var healthResponse = Assert.IsType<HealthResponse>(statusCodeResult.Value);
        Assert.Equal("Unhealthy", healthResponse.Status);
        Assert.Equal("Unhealthy", healthResponse.Services.OpenAI);
        Assert.Equal("Unhealthy", healthResponse.Services.Qdrant);
    }

    [Fact]
    public async Task GetHealth_SetsTimestampWithinReasonableRange()
    {
        // Arrange
        var before = DateTime.UtcNow;
        _mockOpenAIService.Setup(x => x.IsHealthyAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _mockQdrantService.Setup(x => x.IsHealthyAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.GetHealth();

        // Assert
        var after = DateTime.UtcNow;
        var okResult = Assert.IsType<OkObjectResult>(result);
        var healthResponse = Assert.IsType<HealthResponse>(okResult.Value);

        Assert.True(healthResponse.Timestamp >= before);
        Assert.True(healthResponse.Timestamp <= after);
    }

    [Fact]
    public async Task GetHealth_CallsAllHealthCheckMethods()
    {
        // Arrange
        _mockOpenAIService.Setup(x => x.IsHealthyAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _mockQdrantService.Setup(x => x.IsHealthyAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        await _controller.GetHealth();

        // Assert
        _mockOpenAIService.Verify(x => x.IsHealthyAsync(It.IsAny<CancellationToken>()), Times.Once);
        _mockQdrantService.Verify(x => x.IsHealthyAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public void HealthResponse_ShouldHaveParameterlessConstructor()
    {
        // Act
        var response = new HealthResponse();

        // Assert
        Assert.NotNull(response);
        Assert.Equal(string.Empty, response.Status);
        Assert.NotNull(response.Services);
    }

    [Fact]
    public void HealthServiceStatus_ShouldHaveParameterlessConstructor()
    {
        // Act
        var status = new HealthServiceStatus();

        // Assert
        Assert.NotNull(status);
        Assert.Equal(string.Empty, status.OpenAI);
        Assert.Equal(string.Empty, status.Qdrant);
    }
}