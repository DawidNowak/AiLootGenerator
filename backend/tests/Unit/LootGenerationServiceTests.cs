using Microsoft.Extensions.Logging;
using Moq;
using AiLootGenerator.RestApi.Models;
using AiLootGenerator.RestApi.Services;
using System.ComponentModel.DataAnnotations;

namespace AiLootGenerator.RestApi.Tests.Unit
{
    /// <summary>
    /// Unit tests for LootGenerationService covering orchestration logic, validation, and error handling.
    /// Uses mocks for all dependencies to isolate the service's coordination behavior.
    /// </summary>
    public class LootGenerationServiceTests
    {
        private readonly Mock<ICooldownService> _mockCooldownService;
        private readonly Mock<IQdrantService> _mockQdrantService;
        private readonly Mock<IOpenAIService> _mockOpenAIService;
        private readonly Mock<ILogger<LootGenerationService>> _mockLogger;
        private readonly LootGenerationService _service;

        public LootGenerationServiceTests()
        {
            _mockCooldownService = new Mock<ICooldownService>();
            _mockQdrantService = new Mock<IQdrantService>();
            _mockOpenAIService = new Mock<IOpenAIService>();
            _mockLogger = new Mock<ILogger<LootGenerationService>>();

            _service = new LootGenerationService(
                _mockCooldownService.Object,
                _mockQdrantService.Object,
                _mockOpenAIService.Object,
                _mockLogger.Object);
        }

        #region Constructor Tests

        [Fact]
        public void Constructor_WithNullCooldownService_ThrowsArgumentNullException()
        {
            // Act & Assert
            Assert.Throws<ArgumentNullException>(() => new LootGenerationService(
                null!,
                _mockQdrantService.Object,
                _mockOpenAIService.Object,
                _mockLogger.Object));
        }

        [Fact]
        public void Constructor_WithNullQdrantService_ThrowsArgumentNullException()
        {
            // Act & Assert
            Assert.Throws<ArgumentNullException>(() => new LootGenerationService(
                _mockCooldownService.Object,
                null!,
                _mockOpenAIService.Object,
                _mockLogger.Object));
        }

        [Fact]
        public void Constructor_WithNullOpenAIService_ThrowsArgumentNullException()
        {
            // Act & Assert
            Assert.Throws<ArgumentNullException>(() => new LootGenerationService(
                _mockCooldownService.Object,
                _mockQdrantService.Object,
                null!,
                _mockLogger.Object));
        }

        [Fact]
        public void Constructor_WithNullLogger_ThrowsArgumentNullException()
        {
            // Act & Assert
            Assert.Throws<ArgumentNullException>(() => new LootGenerationService(
                _mockCooldownService.Object,
                _mockQdrantService.Object,
                _mockOpenAIService.Object,
                null!));
        }

        #endregion

        #region GenerateLootAsync Tests

        [Fact]
        public async Task GenerateLootAsync_WithNullRequest_ThrowsArgumentNullException()
        {
            // Act & Assert
            await Assert.ThrowsAsync<ArgumentNullException>(() => _service.GenerateLootAsync(null!));
        }

        [Fact]
        public async Task GenerateLootAsync_WithEmptyGuidSessionId_ThrowsValidationException()
        {
            // Arrange
            var request = new GenerationRequest
            {
                Location = "Ubersreik",
                WealthLevel = WealthLevel.Common,
                Language = "en",
                SessionId = Guid.Empty
            };

            // Act & Assert
            var exception = await Assert.ThrowsAsync<ValidationException>(() => _service.GenerateLootAsync(request));
            Assert.Contains("SessionId must be a valid non-empty GUID", exception.Message);
        }

        [Fact]
        public async Task GenerateLootAsync_WithUnsupportedLanguage_ThrowsValidationException()
        {
            // Arrange
            var request = new GenerationRequest
            {
                Location = "Ubersreik",
                WealthLevel = WealthLevel.Common,
                Language = "fr", // Unsupported language
                SessionId = Guid.NewGuid()
            };

            // Act & Assert
            var exception = await Assert.ThrowsAsync<ValidationException>(() => _service.GenerateLootAsync(request));
            Assert.Contains("Language must be 'en' or 'pl'", exception.Message);
        }

        [Theory]
        [InlineData("en")]
        [InlineData("pl")]
        public async Task GenerateLootAsync_WithSupportedLanguages_DoesNotThrowValidationException(string language)
        {
            // Arrange
            var sessionId = Guid.NewGuid();
            var request = new GenerationRequest
            {
                Location = "Ubersreik",
                WealthLevel = WealthLevel.Common,
                Language = language,
                SessionId = sessionId
            };

            var expectedLoot = new List<LootItem>
            {
                new LootItem { Name = "Test Item", Description = "Test Description", ValueInPennies = 100, WealthLevel = WealthLevel.Common }
            };

            _mockQdrantService.Setup(x => x.SearchRelevantLoreAsync(It.IsAny<string>(), It.IsAny<WealthLevel>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync("test lore");
            _mockOpenAIService.Setup(x => x.GenerateLootAsync(It.IsAny<GenerationRequest>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(expectedLoot);

            // Act
            var result = await _service.GenerateLootAsync(request);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(expectedLoot, result);
        }

        [Theory]
        [InlineData("EN")]
        [InlineData("PL")]
        public async Task GenerateLootAsync_WithUppercaseLanguages_ThrowsValidationException(string language)
        {
            // Arrange
            var request = new GenerationRequest
            {
                Location = "Ubersreik",
                WealthLevel = WealthLevel.Common,
                Language = language, // Uppercase language codes are not accepted by model validation
                SessionId = Guid.NewGuid()
            };

            // Act & Assert
            var exception = await Assert.ThrowsAsync<ValidationException>(() => _service.GenerateLootAsync(request));
            Assert.Contains("Language must be 'en' or 'pl'", exception.Message);
        }

        [Fact]
        public async Task GenerateLootAsync_WhenCooldownActive_ThrowsCooldownActiveException()
        {
            // Arrange
            var sessionId = Guid.NewGuid();
            var request = new GenerationRequest
            {
                Location = "Ubersreik",
                WealthLevel = WealthLevel.Common,
                Language = "en",
                SessionId = sessionId
            };

            var cooldownException = new CooldownActiveException(15);
            _mockCooldownService.Setup(x => x.ValidateSessionNotOnCooldown(sessionId))
                .Throws(cooldownException);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<CooldownActiveException>(() => _service.GenerateLootAsync(request));
            Assert.Equal(15, exception.RemainingSeconds);
        }

        [Fact]
        public async Task GenerateLootAsync_SuccessfulFlow_CallsAllServicesInCorrectOrder()
        {
            // Arrange
            var sessionId = Guid.NewGuid();
            var request = new GenerationRequest
            {
                Location = "Ubersreik",
                WealthLevel = WealthLevel.Common,
                Language = "en",
                SessionId = sessionId
            };

            var loreContext = "Ancient lore about Ubersreik";
            var expectedLoot = new List<LootItem>
            {
                new LootItem { Name = "Test Item", Description = "Test Description", ValueInPennies = 100, WealthLevel = WealthLevel.Common }
            };

            _mockQdrantService.Setup(x => x.SearchRelevantLoreAsync("Ubersreik", WealthLevel.Common, It.IsAny<CancellationToken>()))
                .ReturnsAsync(loreContext);
            _mockOpenAIService.Setup(x => x.GenerateLootAsync(request, loreContext, It.IsAny<CancellationToken>()))
                .ReturnsAsync(expectedLoot);

            // Act
            var result = await _service.GenerateLootAsync(request);

            // Assert
            Assert.Equal(expectedLoot, result);

            // Verify call order and parameters
            _mockCooldownService.Verify(x => x.ValidateSessionNotOnCooldown(sessionId), Times.Once);
            _mockQdrantService.Verify(x => x.SearchRelevantLoreAsync("Ubersreik", WealthLevel.Common, It.IsAny<CancellationToken>()), Times.Once);
            _mockOpenAIService.Verify(x => x.GenerateLootAsync(request, loreContext, It.IsAny<CancellationToken>()), Times.Once);
            _mockCooldownService.Verify(x => x.RecordGeneration(sessionId), Times.Once);
        }

        [Fact]
        public async Task GenerateLootAsync_WhenQdrantServiceFails_ContinuesWithoutLoreContext()
        {
            // Arrange
            var sessionId = Guid.NewGuid();
            var request = new GenerationRequest
            {
                Location = "Ubersreik",
                WealthLevel = WealthLevel.Common,
                Language = "en",
                SessionId = sessionId
            };

            var expectedLoot = new List<LootItem>
            {
                new LootItem { Name = "Test Item", Description = "Test Description", ValueInPennies = 100, WealthLevel = WealthLevel.Common }
            };

            _mockQdrantService.Setup(x => x.SearchRelevantLoreAsync(It.IsAny<string>(), It.IsAny<WealthLevel>(), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new Exception("Qdrant service error"));
            _mockOpenAIService.Setup(x => x.GenerateLootAsync(request, null, It.IsAny<CancellationToken>()))
                .ReturnsAsync(expectedLoot);

            // Act
            var result = await _service.GenerateLootAsync(request);

            // Assert
            Assert.Equal(expectedLoot, result);
            _mockOpenAIService.Verify(x => x.GenerateLootAsync(request, null, It.IsAny<CancellationToken>()), Times.Once);
            _mockCooldownService.Verify(x => x.RecordGeneration(sessionId), Times.Once);
        }

        [Fact]
        public async Task GenerateLootAsync_WhenQdrantReturnsNull_ContinuesWithNullLoreContext()
        {
            // Arrange
            var sessionId = Guid.NewGuid();
            var request = new GenerationRequest
            {
                Location = "Unknown Location",
                WealthLevel = WealthLevel.Common,
                Language = "en",
                SessionId = sessionId
            };

            var expectedLoot = new List<LootItem>
            {
                new LootItem { Name = "Test Item", Description = "Test Description", ValueInPennies = 100, WealthLevel = WealthLevel.Common }
            };

            _mockQdrantService.Setup(x => x.SearchRelevantLoreAsync(It.IsAny<string>(), It.IsAny<WealthLevel>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((string?)null);
            _mockOpenAIService.Setup(x => x.GenerateLootAsync(request, null, It.IsAny<CancellationToken>()))
                .ReturnsAsync(expectedLoot);

            // Act
            var result = await _service.GenerateLootAsync(request);

            // Assert
            Assert.Equal(expectedLoot, result);
            _mockOpenAIService.Verify(x => x.GenerateLootAsync(request, null, It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task GenerateLootAsync_WhenOpenAIServiceFails_ThrowsLootGenerationException()
        {
            // Arrange
            var sessionId = Guid.NewGuid();
            var request = new GenerationRequest
            {
                Location = "Ubersreik",
                WealthLevel = WealthLevel.Common,
                Language = "en",
                SessionId = sessionId
            };

            _mockQdrantService.Setup(x => x.SearchRelevantLoreAsync(It.IsAny<string>(), It.IsAny<WealthLevel>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync("test lore");
            _mockOpenAIService.Setup(x => x.GenerateLootAsync(It.IsAny<GenerationRequest>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new Exception("OpenAI service error"));

            // Act & Assert
            var exception = await Assert.ThrowsAsync<LootGenerationException>(() => _service.GenerateLootAsync(request));
            Assert.Contains("Failed to generate loot items using AI service", exception.Message);
            Assert.NotNull(exception.InnerException);

            // Verify cooldown was not recorded due to failure
            _mockCooldownService.Verify(x => x.RecordGeneration(It.IsAny<Guid>()), Times.Never);
        }

        [Fact]
        public async Task GenerateLootAsync_WithEmptyLocation_ThrowsValidationException()
        {
            // Arrange
            var request = new GenerationRequest
            {
                Location = "", // Invalid empty location
                WealthLevel = WealthLevel.Common,
                Language = "en",
                SessionId = Guid.NewGuid()
            };

            // Act & Assert
            await Assert.ThrowsAsync<ValidationException>(() => _service.GenerateLootAsync(request));
        }

        [Fact]
        public async Task GenerateLootAsync_WithTooLongLocation_ThrowsValidationException()
        {
            // Arrange
            var request = new GenerationRequest
            {
                Location = new string('x', 201), // Exceeds 200 character limit
                WealthLevel = WealthLevel.Common,
                Language = "en",
                SessionId = Guid.NewGuid()
            };

            // Act & Assert
            await Assert.ThrowsAsync<ValidationException>(() => _service.GenerateLootAsync(request));
        }

        [Fact]
        public async Task GenerateLootAsync_WithCancellationToken_PassesTokenToAllServices()
        {
            // Arrange
            var sessionId = Guid.NewGuid();
            var request = new GenerationRequest
            {
                Location = "Ubersreik",
                WealthLevel = WealthLevel.Common,
                Language = "en",
                SessionId = sessionId
            };

            var cancellationToken = new CancellationToken();
            var expectedLoot = new List<LootItem>
            {
                new LootItem { Name = "Test Item", Description = "Test Description", ValueInPennies = 100, WealthLevel = WealthLevel.Common }
            };

            _mockQdrantService.Setup(x => x.SearchRelevantLoreAsync(It.IsAny<string>(), It.IsAny<WealthLevel>(), cancellationToken))
                .ReturnsAsync("test lore");
            _mockOpenAIService.Setup(x => x.GenerateLootAsync(It.IsAny<GenerationRequest>(), It.IsAny<string>(), cancellationToken))
                .ReturnsAsync(expectedLoot);

            // Act
            await _service.GenerateLootAsync(request, cancellationToken);

            // Assert
            _mockQdrantService.Verify(x => x.SearchRelevantLoreAsync(It.IsAny<string>(), It.IsAny<WealthLevel>(), cancellationToken), Times.Once);
            _mockOpenAIService.Verify(x => x.GenerateLootAsync(It.IsAny<GenerationRequest>(), It.IsAny<string>(), cancellationToken), Times.Once);
        }

        [Fact]
        public async Task GenerateLootAsync_WhenUnexpectedExceptionOccurs_ThrowsLootGenerationException()
        {
            // Arrange
            var sessionId = Guid.NewGuid();
            var request = new GenerationRequest
            {
                Location = "Ubersreik",
                WealthLevel = WealthLevel.Common,
                Language = "en",
                SessionId = sessionId
            };

            // Setup an unexpected exception during cooldown validation
            _mockCooldownService.Setup(x => x.ValidateSessionNotOnCooldown(sessionId))
                .Throws(new InvalidOperationException("Unexpected error"));

            // Act & Assert
            var exception = await Assert.ThrowsAsync<LootGenerationException>(() => _service.GenerateLootAsync(request));
            Assert.Contains("An unexpected error occurred during loot generation", exception.Message);
            Assert.IsType<InvalidOperationException>(exception.InnerException);
        }

        #endregion

        #region Integration Workflow Tests

        [Fact]
        public async Task GenerateLootAsync_CompleteSuccessfulWorkflow_PerformsAllStepsInOrder()
        {
            // Arrange
            var sessionId = Guid.NewGuid();
            var request = new GenerationRequest
            {
                Location = "Ubersreik Tavern",
                WealthLevel = WealthLevel.Wealthy,
                Language = "pl",
                SessionId = sessionId
            };

            var loreContext = "Rich history of Ubersreik taverns and their treasures";
            var expectedLoot = new List<LootItem>
            {
                new LootItem { Name = "Złoty Puchar", Description = "Ozdobny puchar", ValueInPennies = 500, WealthLevel = WealthLevel.Wealthy },
                new LootItem { Name = "Stary Miecz", Description = "Zardzewiale ostrze", ValueInPennies = 200, WealthLevel = WealthLevel.Common }
            };

            var callOrder = new List<string>();

            _mockCooldownService.Setup(x => x.ValidateSessionNotOnCooldown(sessionId))
                .Callback(() => callOrder.Add("ValidateCooldown"));

            _mockQdrantService.Setup(x => x.SearchRelevantLoreAsync("Ubersreik Tavern", WealthLevel.Wealthy, It.IsAny<CancellationToken>()))
                .ReturnsAsync(loreContext)
                .Callback(() => callOrder.Add("SearchLore"));

            _mockOpenAIService.Setup(x => x.GenerateLootAsync(request, loreContext, It.IsAny<CancellationToken>()))
                .ReturnsAsync(expectedLoot)
                .Callback(() => callOrder.Add("GenerateLoot"));

            _mockCooldownService.Setup(x => x.RecordGeneration(sessionId))
                .Callback(() => callOrder.Add("RecordGeneration"));

            // Act
            var result = await _service.GenerateLootAsync(request);

            // Assert
            Assert.Equal(expectedLoot, result);
            Assert.Equal(new[] { "ValidateCooldown", "SearchLore", "GenerateLoot", "RecordGeneration" }, callOrder);
        }

        #endregion
    }
}