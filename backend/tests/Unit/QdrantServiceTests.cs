using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;
using Moq;
using Qdrant.Client;
using AiLootGenerator.RestApi.Models;
using AiLootGenerator.RestApi.Services;
using AiLootGenerator.RestApi.Configuration;
using System.ComponentModel.DataAnnotations;

namespace AiLootGenerator.RestApi.Tests.Unit
{
    /// <summary>
    /// Unit tests for QdrantService focusing on input validation and constructor validation.
    /// Since QdrantClient is a concrete class that's difficult to mock, these tests focus on
    /// business logic validation rather than full integration testing.
    /// </summary>
    public class QdrantServiceTests
    {
        private readonly Mock<IOpenAIService> _mockOpenAIService;
        private readonly Mock<ILogger<QdrantService>> _mockLogger;
        private readonly Mock<IOptions<QdrantSettings>> _mockSettings;
        private readonly QdrantSettings _testSettings;

        public QdrantServiceTests()
        {
            _mockOpenAIService = new Mock<IOpenAIService>();
            _mockLogger = new Mock<ILogger<QdrantService>>();
            _mockSettings = new Mock<IOptions<QdrantSettings>>();

            // Setup default settings
            _testSettings = new QdrantSettings
            {
                CollectionName = "warhammer_lore",
                MaxSearchResults = 5,
                SimilarityThreshold = 0.7f
            };
            _mockSettings.Setup(s => s.Value).Returns(_testSettings);
        }

        [Fact]
        public void Constructor_WithNullQdrantClient_ThrowsArgumentNullException()
        {
            // Arrange, Act & Assert
            Assert.Throws<ArgumentNullException>(() => new QdrantService(
                null!,
                _mockOpenAIService.Object,
                _mockLogger.Object,
                _mockSettings.Object));
        }

        [Fact]
        public void Constructor_WithNullOpenAIService_ThrowsArgumentNullException()
        {
            // Arrange
            var qdrantClient = new QdrantClient("localhost", 6334);

            // Act & Assert
            Assert.Throws<ArgumentNullException>(() => new QdrantService(
                qdrantClient,
                null!,
                _mockLogger.Object,
                _mockSettings.Object));
        }

        [Fact]
        public void Constructor_WithNullLogger_ThrowsArgumentNullException()
        {
            // Arrange
            var qdrantClient = new QdrantClient("localhost", 6334);

            // Act & Assert
            Assert.Throws<ArgumentNullException>(() => new QdrantService(
                qdrantClient,
                _mockOpenAIService.Object,
                null!,
                _mockSettings.Object));
        }

        [Fact]
        public void Constructor_WithNullSettings_ThrowsArgumentNullException()
        {
            // Arrange
            var qdrantClient = new QdrantClient("localhost", 6334);

            // Act & Assert
            Assert.Throws<ArgumentNullException>(() => new QdrantService(
                qdrantClient,
                _mockOpenAIService.Object,
                _mockLogger.Object,
                null!));
        }

        [Theory]
        [InlineData(null)]
        [InlineData("")]
        [InlineData(" ")]
        public async Task SearchRelevantLoreAsync_WithInvalidLocation_ThrowsArgumentException(string? location)
        {
            // Arrange
            var qdrantClient = new QdrantClient("localhost", 6334);
            var service = new QdrantService(
                qdrantClient,
                _mockOpenAIService.Object,
                _mockLogger.Object,
                _mockSettings.Object);

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() =>
                service.SearchRelevantLoreAsync(location!, WealthLevel.Common));
        }

        [Fact]
        public async Task AddLoreItemsBatchAsync_WithNullLoreItems_ThrowsArgumentNullException()
        {
            // Arrange
            var qdrantClient = new QdrantClient("localhost", 6334);
            var service = new QdrantService(
                qdrantClient,
                _mockOpenAIService.Object,
                _mockLogger.Object,
                _mockSettings.Object);

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentNullException>(() =>
                service.AddLoreItemsBatchAsync(null!));
        }

        [Fact]
        public async Task AddLoreItemsBatchAsync_WithEmptyLoreItems_ReturnsZero()
        {
            // Arrange
            var qdrantClient = new QdrantClient("localhost", 6334);
            var service = new QdrantService(
                qdrantClient,
                _mockOpenAIService.Object,
                _mockLogger.Object,
                _mockSettings.Object);

            var emptyLoreItems = new List<LoreItem>();

            // Act
            var result = await service.AddLoreItemsBatchAsync(emptyLoreItems);

            // Assert
            Assert.Equal(0, result);
        }

        [Fact]
        public async Task AddLoreItemsBatchAsync_WithInvalidLoreItem_ThrowsArgumentException()
        {
            // Arrange
            var qdrantClient = new QdrantClient("localhost", 6334);
            var service = new QdrantService(
                qdrantClient,
                _mockOpenAIService.Object,
                _mockLogger.Object,
                _mockSettings.Object);

            var invalidLoreItems = new List<LoreItem>
            {
                new LoreItem
                {
                    Id = Guid.Empty, // Invalid: empty ID
                    Name = "", // Invalid: empty name
                    Description = "", // Invalid: empty description
                    ValueInPennies = 0, // Invalid: zero value
                    Tags = new List<string>() // Invalid: empty tags
                }
            };

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() =>
                service.AddLoreItemsBatchAsync(invalidLoreItems));
        }

        [Fact]
        public void QdrantSettings_DefaultValues_AreValid()
        {
            // Test that QdrantSettings has reasonable defaults
            var settings = new QdrantSettings();

            Assert.Null(settings.CollectionName); // No default value set, should be null
            Assert.Equal(5, settings.MaxSearchResults);
            Assert.Equal(0.7f, settings.SimilarityThreshold);
        }
    }
}