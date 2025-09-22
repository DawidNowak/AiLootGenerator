using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using AiLootGenerator.RestApi.Controllers;
using AiLootGenerator.RestApi.Models;
using AiLootGenerator.RestApi.Services;
using System.ComponentModel.DataAnnotations;

namespace AiLootGenerator.RestApi.Tests.Unit;

/// <summary>
/// Unit tests for LootController
/// </summary>
public class LootControllerTests
{
    private readonly Mock<ILootGenerationService> _mockLootGenerationService;
    private readonly Mock<ILogger<LootController>> _mockLogger;
    private readonly LootController _controller;

    public LootControllerTests()
    {
        _mockLootGenerationService = new Mock<ILootGenerationService>();
        _mockLogger = new Mock<ILogger<LootController>>();

        _controller = new LootController(
            _mockLootGenerationService.Object,
            _mockLogger.Object);
    }

    [Fact]
    public void Constructor_WithNullLootGenerationService_ThrowsArgumentNullException()
    {
        // Arrange, Act & Assert
        Assert.Throws<ArgumentNullException>(() => new LootController(
            null!,
            _mockLogger.Object));
    }

    [Fact]
    public void Constructor_WithNullLogger_ThrowsArgumentNullException()
    {
        // Arrange, Act & Assert
        Assert.Throws<ArgumentNullException>(() => new LootController(
            _mockLootGenerationService.Object,
            null!));
    }

    [Fact]
    public async Task GenerateLoot_ValidRequest_ReturnsOkResult()
    {
        // Arrange
        var request = new GenerationRequest
        {
            Location = "Ubersreik barracks",
            WealthLevel = WealthLevel.Common,
            Language = "en",
            SessionId = Guid.NewGuid()
        };

        var expectedItems = new List<LootItem>
        {
            new LootItem
            {
                Name = "Jungfreud Tabard",
                Description = "A well-maintained cloth tabard",
                ValueInPennies = 60,
                WealthLevel = WealthLevel.Poor
            },
            new LootItem
            {
                Name = "Iron-bound Shield",
                Description = "A practice shield showing wear",
                ValueInPennies = 36,
                WealthLevel = WealthLevel.Poor
            },
            new LootItem
            {
                Name = "Leather Boots",
                Description = "Sturdy marching boots",
                ValueInPennies = 24,
                WealthLevel = WealthLevel.Poor
            },
            new LootItem
            {
                Name = "Belt Pouch",
                Description = "A simple leather pouch",
                ValueInPennies = 12,
                WealthLevel = WealthLevel.Rubbish
            }
        };

        _mockLootGenerationService
            .Setup(s => s.GenerateLootAsync(request, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedItems);

        // Act
        var result = await _controller.GenerateLoot(request);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<GenerationResponse>(okResult.Value);
        
        Assert.Equal(expectedItems.Count, response.Items.Count);
        Assert.True(response.GeneratedAt <= DateTime.UtcNow);
        Assert.True(response.CooldownExpiresAt > DateTime.UtcNow);
    }

    [Fact]
    public async Task GenerateLoot_CooldownActive_Returns429WithCooldownError()
    {
        // Arrange
        var request = new GenerationRequest
        {
            Location = "Ubersreik barracks",
            WealthLevel = WealthLevel.Common,
            Language = "en",
            SessionId = Guid.NewGuid()
        };

        var cooldownException = new CooldownActiveException(15);

        _mockLootGenerationService
            .Setup(s => s.GenerateLootAsync(request, It.IsAny<CancellationToken>()))
            .ThrowsAsync(cooldownException);

        // Act
        var result = await _controller.GenerateLoot(request);

        // Assert
        var statusCodeResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(429, statusCodeResult.StatusCode);
        
        var response = Assert.IsType<CooldownErrorResponse>(statusCodeResult.Value);
        Assert.Equal("CooldownActive", response.Error);
        Assert.Equal("Please wait before generating more loot", response.Message);
        Assert.Equal(15, response.RemainingSeconds);
        Assert.True(response.RetryAfter > DateTime.UtcNow);
        Assert.Contains("sessionId", response.Details);
    }

    [Fact]
    public async Task GenerateLoot_ValidationException_Returns400WithValidationError()
    {
        // Arrange
        var request = new GenerationRequest
        {
            Location = "Ubersreik barracks",
            WealthLevel = WealthLevel.Common,
            Language = "en",
            SessionId = Guid.NewGuid()
        };

        var validationException = new ValidationException("Location must be between 1 and 200 characters");

        _mockLootGenerationService
            .Setup(s => s.GenerateLootAsync(request, It.IsAny<CancellationToken>()))
            .ThrowsAsync(validationException);

        // Act
        var result = await _controller.GenerateLoot(request);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        var response = Assert.IsType<ErrorResponse>(badRequestResult.Value);
        
        Assert.Equal("ValidationError", response.Error);
        Assert.Equal("Location must be between 1 and 200 characters", response.Message);
        Assert.Contains("sessionId", response.Details);
    }

    [Fact]
    public async Task GenerateLoot_LootGenerationException_Returns500WithGenerationError()
    {
        // Arrange
        var request = new GenerationRequest
        {
            Location = "Ubersreik barracks",
            WealthLevel = WealthLevel.Common,
            Language = "en",
            SessionId = Guid.NewGuid()
        };

        var generationException = new LootGenerationException("OpenAI service unavailable");

        _mockLootGenerationService
            .Setup(s => s.GenerateLootAsync(request, It.IsAny<CancellationToken>()))
            .ThrowsAsync(generationException);

        // Act
        var result = await _controller.GenerateLoot(request);

        // Assert
        var statusCodeResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(500, statusCodeResult.StatusCode);
        
        var response = Assert.IsType<ErrorResponse>(statusCodeResult.Value);
        Assert.Equal("GenerationFailed", response.Error);
        Assert.Equal("Failed to generate loot items. Please try again later.", response.Message);
        Assert.Contains("sessionId", response.Details);
    }

    [Fact]
    public async Task GenerateLoot_UnexpectedException_Returns500WithInternalError()
    {
        // Arrange
        var request = new GenerationRequest
        {
            Location = "Ubersreik barracks",
            WealthLevel = WealthLevel.Common,
            Language = "en",
            SessionId = Guid.NewGuid()
        };

        var unexpectedException = new InvalidOperationException("Unexpected error");

        _mockLootGenerationService
            .Setup(s => s.GenerateLootAsync(request, It.IsAny<CancellationToken>()))
            .ThrowsAsync(unexpectedException);

        // Act
        var result = await _controller.GenerateLoot(request);

        // Assert
        var statusCodeResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(500, statusCodeResult.StatusCode);
        
        var response = Assert.IsType<ErrorResponse>(statusCodeResult.Value);
        Assert.Equal("InternalError", response.Error);
        Assert.Equal("An unexpected error occurred. Please try again later.", response.Message);
        Assert.Contains("sessionId", response.Details);
    }

    [Fact]
    public async Task GenerateLoot_InvalidModelState_Returns400WithValidationError()
    {
        // Arrange
        var request = new GenerationRequest
        {
            Location = "", // Invalid - empty location
            WealthLevel = WealthLevel.Common,
            Language = "en",
            SessionId = Guid.NewGuid()
        };

        // Simulate model validation failure
        _controller.ModelState.AddModelError("Location", "Location must be between 1 and 200 characters");

        // Act
        var result = await _controller.GenerateLoot(request);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        var response = Assert.IsType<ErrorResponse>(badRequestResult.Value);
        
        Assert.Equal("ValidationError", response.Error);
        Assert.Equal("Location must be between 1 and 200 characters", response.Message);
        Assert.Contains("field", response.Details);
        Assert.Equal("location", response.Details["field"]);
    }

    [Fact]
    public async Task GenerateLoot_CancellationRequested_PropagatesCancellation()
    {
        // Arrange
        var request = new GenerationRequest
        {
            Location = "Ubersreik barracks",
            WealthLevel = WealthLevel.Common,
            Language = "en",
            SessionId = Guid.NewGuid()
        };

        var cancellationTokenSource = new CancellationTokenSource();
        cancellationTokenSource.Cancel();

        _mockLootGenerationService
            .Setup(s => s.GenerateLootAsync(request, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new OperationCanceledException());

        // Act & Assert
        await Assert.ThrowsAsync<OperationCanceledException>(() => 
            _controller.GenerateLoot(request, cancellationTokenSource.Token));
    }

    [Theory]
    [InlineData("", WealthLevel.Common, "en")] // Empty location
    [InlineData("Valid location", WealthLevel.Common, "fr")] // Invalid language
    public async Task GenerateLoot_InvalidRequestData_DoesNotCallService(string location, WealthLevel wealthLevel, string language)
    {
        // Arrange
        var request = new GenerationRequest
        {
            Location = location,
            WealthLevel = wealthLevel,
            Language = language,
            SessionId = Guid.NewGuid()
        };

        // Simulate model validation based on data annotations
        var validationResults = new List<ValidationResult>();
        var validationContext = new ValidationContext(request);
        Validator.TryValidateObject(request, validationContext, validationResults, true);

        foreach (var validationResult in validationResults)
        {
            foreach (var memberName in validationResult.MemberNames)
            {
                _controller.ModelState.AddModelError(memberName, validationResult.ErrorMessage ?? "Validation error");
            }
        }

        // Act
        var result = await _controller.GenerateLoot(request);

        // Assert
        Assert.IsType<BadRequestObjectResult>(result);
        
        // Verify service was never called
        _mockLootGenerationService.Verify(
            s => s.GenerateLootAsync(It.IsAny<GenerationRequest>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task GenerateLoot_LocationTooLong_DoesNotCallService()
    {
        // Arrange
        var longLocation = new string('A', 201); // 201 characters
        var request = new GenerationRequest
        {
            Location = longLocation,
            WealthLevel = WealthLevel.Common,
            Language = "en",
            SessionId = Guid.NewGuid()
        };

        // Simulate model validation based on data annotations
        var validationResults = new List<ValidationResult>();
        var validationContext = new ValidationContext(request);
        Validator.TryValidateObject(request, validationContext, validationResults, true);

        foreach (var validationResult in validationResults)
        {
            foreach (var memberName in validationResult.MemberNames)
            {
                _controller.ModelState.AddModelError(memberName, validationResult.ErrorMessage ?? "Validation error");
            }
        }

        // Act
        var result = await _controller.GenerateLoot(request);

        // Assert
        Assert.IsType<BadRequestObjectResult>(result);
        
        // Verify service was never called
        _mockLootGenerationService.Verify(
            s => s.GenerateLootAsync(It.IsAny<GenerationRequest>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task GenerateLoot_SuccessfulGeneration_LogsInformation()
    {
        // Arrange
        var request = new GenerationRequest
        {
            Location = "Ubersreik barracks",
            WealthLevel = WealthLevel.Common,
            Language = "en",
            SessionId = Guid.NewGuid()
        };

        var expectedItems = new List<LootItem>
        {
            new LootItem
            {
                Name = "Test Item",
                Description = "Test Description",
                ValueInPennies = 100,
                WealthLevel = WealthLevel.Common
            }
        };

        _mockLootGenerationService
            .Setup(s => s.GenerateLootAsync(request, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedItems);

        // Act
        await _controller.GenerateLoot(request);

        // Assert
        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Received loot generation request")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);

        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Successfully generated")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }
}