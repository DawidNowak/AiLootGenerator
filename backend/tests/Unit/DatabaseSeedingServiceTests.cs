using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using AiLootGenerator.RestApi.Services;
using AiLootGenerator.RestApi.Models;
using AiLootGenerator.RestApi.Configuration;
using System.Text.Json;
using System.Reflection;

namespace AiLootGenerator.RestApi.Tests.Unit
{
    /// <summary>
    /// Unit tests for DatabaseSeedingService covering all public and critical private methods.
    /// Note: These tests focus on business logic and use a minimal QdrantClient setup to avoid mocking issues.
    /// </summary>
    public class DatabaseSeedingServiceTests : IDisposable
    {
        private readonly Mock<IQdrantService> _mockQdrantService;
        private readonly Mock<ILogger<DatabaseSeedingService>> _mockLogger;
        private readonly Mock<IOptions<DatabaseSeedingSettings>> _mockSeedingSettings;
        private readonly string _tempDirectory;
        private readonly DatabaseSeedingSettings _seedingSettings;

        public DatabaseSeedingServiceTests()
        {
            _mockQdrantService = new Mock<IQdrantService>();
            _mockLogger = new Mock<ILogger<DatabaseSeedingService>>();
            _mockSeedingSettings = new Mock<IOptions<DatabaseSeedingSettings>>();

            _seedingSettings = new DatabaseSeedingSettings
            {
                EnableSeeding = true,
                DataDirectory = "data",
                StopOnError = true
            };

            _mockSeedingSettings.Setup(x => x.Value).Returns(_seedingSettings);

            _tempDirectory = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
            Directory.CreateDirectory(_tempDirectory);
        }

        public void Dispose()
        {
            if (Directory.Exists(_tempDirectory))
            {
                Directory.Delete(_tempDirectory, recursive: true);
            }
        }

        #region Constructor Tests

        [Fact]
        public void Constructor_WithNullQdrantService_ThrowsArgumentNullException()
        {
            // Arrange & Act & Assert
            Assert.Throws<ArgumentNullException>(() => new DatabaseSeedingService(
                null!,
                _mockLogger.Object,
                _mockSeedingSettings.Object));
        }

        [Fact]
        public void Constructor_WithNullLogger_ThrowsArgumentNullException()
        {
            // Act & Assert
            Assert.Throws<ArgumentNullException>(() => new DatabaseSeedingService(
                _mockQdrantService.Object,
                null!,
                _mockSeedingSettings.Object));
        }

        [Fact]
        public void Constructor_WithNullSeedingSettings_ThrowsArgumentNullException()
        {
            // Act & Assert
            Assert.Throws<ArgumentNullException>(() => new DatabaseSeedingService(
                _mockQdrantService.Object,
                _mockLogger.Object,
                null!));
        }

        [Fact]
        public void Constructor_WithValidParameters_DoesNotThrow()
        {
            // Act & Assert
            var exception = Record.Exception(() => new DatabaseSeedingService(
                _mockQdrantService.Object,
                _mockLogger.Object,
                _mockSeedingSettings.Object));

            Assert.Null(exception);
        }

        #endregion

        #region SeedDatabaseIfEmptyAsync Tests

        [Fact]
        public async Task SeedDatabaseIfEmptyAsync_WhenSeedingDisabled_ReturnsFalseAndDoesNotSeed()
        {
            // Arrange
            _seedingSettings.EnableSeeding = false;
            var service = CreateService();

            // Act
            var result = await service.SeedDatabaseIfEmptyAsync();

            // Assert
            Assert.False(result);
            // Note: Since we use real QdrantClient, we can't easily verify that certain methods weren't called
            // This test focuses on the business logic of checking the EnableSeeding flag
        }

        [Fact]
        public async Task SeedDatabaseIfEmptyAsync_WithCancellation_ThrowsOperationCanceledException()
        {
            // Arrange
            using var cts = new CancellationTokenSource();
            cts.Cancel();
            
            // Setup the mock to throw OperationCanceledException when any method is called with cancellation token
            _mockQdrantService.Setup(x => x.IsHealthyAsync(It.IsAny<CancellationToken>()))
                             .Callback<CancellationToken>(token => token.ThrowIfCancellationRequested())
                             .ThrowsAsync(new OperationCanceledException());
            
            var service = CreateService();

            // Act & Assert
            await Assert.ThrowsAsync<OperationCanceledException>(() => service.SeedDatabaseIfEmptyAsync(cts.Token));
        }

        #endregion

        #region LoadLoreItemsFromFileAsync Tests (Private Method via Reflection)

        [Fact]
        public async Task LoadLoreItemsFromFileAsync_ValidJsonFile_ReturnsLoreItems()
        {
            // Arrange
            var service = CreateService();
            var loreItems = new List<LoreItem>
            {
                new() 
                {
                    Id = Guid.NewGuid(),
                    Name = "Test Item 1",
                    Description = "Test content 1",
                    ValueInPennies = 100,
                    Tags = new List<string> { "sword", "magic" }
                },
                new() 
                {
                    Id = Guid.NewGuid(),
                    Name = "Test Item 2",
                    Description = "Test content 2",
                    ValueInPennies = 200,
                    Tags = new List<string> { "shield", "protection" }
                }
            };

            var jsonContent = JsonSerializer.Serialize(loreItems, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

            var filePath = Path.Combine(_tempDirectory, "test.json");
            await File.WriteAllTextAsync(filePath, jsonContent);

            // Act
            var result = await InvokeLoadLoreItemsFromFileAsync(service, filePath);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count);
            Assert.Equal(loreItems[0].Id, result[0].Id);
            Assert.Equal("Test Item 1", result[0].Name);
            Assert.Equal(loreItems[1].Id, result[1].Id);
            Assert.Equal("Test Item 2", result[1].Name);
        }

        [Fact]
        public async Task LoadLoreItemsFromFileAsync_EmptyJsonArray_ReturnsEmptyList()
        {
            // Arrange
            var service = CreateService();
            var jsonContent = "[]";
            var filePath = Path.Combine(_tempDirectory, "empty.json");
            await File.WriteAllTextAsync(filePath, jsonContent);

            // Act
            var result = await InvokeLoadLoreItemsFromFileAsync(service, filePath);

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result);
        }

        [Fact]
        public async Task LoadLoreItemsFromFileAsync_EmptyFile_ReturnsEmptyListAndLogsWarning()
        {
            // Arrange
            var service = CreateService();
            var filePath = Path.Combine(_tempDirectory, "empty.json");
            await File.WriteAllTextAsync(filePath, "");

            // Act
            var result = await InvokeLoadLoreItemsFromFileAsync(service, filePath);

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result);
            
            VerifyLogMessage(LogLevel.Warning, "File is empty or contains only whitespace");
        }

        [Fact]
        public async Task LoadLoreItemsFromFileAsync_WhitespaceOnlyFile_ReturnsEmptyListAndLogsWarning()
        {
            // Arrange
            var service = CreateService();
            var filePath = Path.Combine(_tempDirectory, "whitespace.json");
            await File.WriteAllTextAsync(filePath, "   \n\t  ");

            // Act
            var result = await InvokeLoadLoreItemsFromFileAsync(service, filePath);

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result);
            
            VerifyLogMessage(LogLevel.Warning, "File is empty or contains only whitespace");
        }

        [Fact]
        public async Task LoadLoreItemsFromFileAsync_InvalidJson_ThrowsInvalidOperationException()
        {
            // Arrange
            var service = CreateService();
            var invalidJson = "{ invalid json content }";
            var filePath = Path.Combine(_tempDirectory, "invalid.json");
            await File.WriteAllTextAsync(filePath, invalidJson);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<InvalidOperationException>(
                () => InvokeLoadLoreItemsFromFileAsync(service, filePath));

            Assert.Contains("Failed to parse JSON file", exception.Message);
            Assert.IsType<JsonException>(exception.InnerException);
        }

        [Fact]
        public async Task LoadLoreItemsFromFileAsync_NullDeserialization_ReturnsEmptyListAndLogsWarning()
        {
            // Arrange
            var service = CreateService();
            var jsonContent = "null";
            var filePath = Path.Combine(_tempDirectory, "null.json");
            await File.WriteAllTextAsync(filePath, jsonContent);

            // Act
            var result = await InvokeLoadLoreItemsFromFileAsync(service, filePath);

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result);
            
            VerifyLogMessage(LogLevel.Warning, "Failed to deserialize lore items from file");
        }

        [Fact]
        public async Task LoadLoreItemsFromFileAsync_CaseInsensitiveDeserialization_ReturnsCorrectItems()
        {
            // Arrange
            var service = CreateService();
            var testGuid = Guid.NewGuid();
            var jsonContent = $@"[
                {{
                    ""id"": ""{testGuid}"",
                    ""name"": ""Test Item"",
                    ""description"": ""Test content"",
                    ""valueInPennies"": 100,
                    ""tags"": [""sword""]
                }}
            ]";

            var filePath = Path.Combine(_tempDirectory, "casetest.json");
            await File.WriteAllTextAsync(filePath, jsonContent);

            // Act
            var result = await InvokeLoadLoreItemsFromFileAsync(service, filePath);

            // Assert
            Assert.NotNull(result);
            Assert.Single(result);
            Assert.Equal("Test Item", result[0].Name);
            Assert.Equal("Test content", result[0].Description);
            Assert.Equal(100, result[0].ValueInPennies);
            Assert.Single(result[0].Tags);
            Assert.Equal("sword", result[0].Tags[0]);
        }

        [Fact]
        public async Task LoadLoreItemsFromFileAsync_FileNotFound_ThrowsFileNotFoundException()
        {
            // Arrange
            var service = CreateService();
            var nonExistentFilePath = Path.Combine(_tempDirectory, "nonexistent.json");

            // Act & Assert
            await Assert.ThrowsAsync<FileNotFoundException>(
                () => InvokeLoadLoreItemsFromFileAsync(service, nonExistentFilePath));
        }

        [Fact]
        public async Task LoadLoreItemsFromFileAsync_LargeFile_ProcessesSuccessfully()
        {
            // Arrange
            var service = CreateService();
            var loreItems = new List<LoreItem>();
            for (int i = 0; i < 100; i++) // Reduced from 1000 to 100 for faster test execution
            {
                loreItems.Add(new LoreItem
                {
                    Id = Guid.NewGuid(),
                    Name = $"Test Item {i}",
                    Description = $"Test content {i}",
                    ValueInPennies = 100 + i,
                    Tags = new List<string> { $"tag{i}" }
                });
            }

            var jsonContent = JsonSerializer.Serialize(loreItems, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

            var filePath = Path.Combine(_tempDirectory, "large.json");
            await File.WriteAllTextAsync(filePath, jsonContent);

            // Act
            var result = await InvokeLoadLoreItemsFromFileAsync(service, filePath);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(100, result.Count);
            Assert.Equal("Test Item 0", result[0].Name);
            Assert.Equal("Test Item 99", result[99].Name);
        }

        [Fact]
        public async Task LoadLoreItemsFromFileAsync_CancellationRequested_ThrowsOperationCanceledException()
        {
            // Arrange
            var service = CreateService();
            var loreItems = new List<LoreItem>
            {
                new() { Id = Guid.NewGuid(), Name = "Test", Description = "Content", ValueInPennies = 100, Tags = new List<string> { "tag" } }
            };

            var jsonContent = JsonSerializer.Serialize(loreItems, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

            var filePath = Path.Combine(_tempDirectory, "cancellation.json");
            await File.WriteAllTextAsync(filePath, jsonContent);

            using var cts = new CancellationTokenSource();
            cts.Cancel();

            // Act & Assert
            // Note: TaskCanceledException is a derived type of OperationCanceledException
            await Assert.ThrowsAnyAsync<OperationCanceledException>(
                () => InvokeLoadLoreItemsFromFileAsync(service, filePath, cts.Token));
        }

        #endregion

        #region Helper Methods

        /// <summary>
        /// Creates a DatabaseSeedingService instance with optional parameter overrides for testing.
        /// </summary>
        private DatabaseSeedingService CreateService(
            IQdrantService? qdrantService = null,
            ILogger<DatabaseSeedingService>? logger = null,
            IOptions<DatabaseSeedingSettings>? seedingSettings = null)
        {
            return new DatabaseSeedingService(
                qdrantService ?? _mockQdrantService.Object,
                logger ?? _mockLogger.Object,
                seedingSettings ?? _mockSeedingSettings.Object);
        }

        /// <summary>
        /// Helper method to access the private LoadLoreItemsFromFileAsync method using reflection.
        /// </summary>
        private async Task<List<LoreItem>> InvokeLoadLoreItemsFromFileAsync(DatabaseSeedingService service, string filePath, CancellationToken cancellationToken = default)
        {
            var method = typeof(DatabaseSeedingService).GetMethod("LoadLoreItemsFromFileAsync", 
                BindingFlags.NonPublic | BindingFlags.Instance);
            
            Assert.NotNull(method);
            
            var task = (Task<List<LoreItem>>)method.Invoke(service, new object[] { filePath, cancellationToken })!;
            return await task;
        }

        /// <summary>
        /// Helper method to verify that a log message was written with specific level and content.
        /// </summary>
        private void VerifyLogMessage(LogLevel level, string messageContains)
        {
            _mockLogger.Verify(
                x => x.Log(
                    level,
                    It.IsAny<EventId>(),
                    It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains(messageContains)),
                    It.IsAny<Exception>(),
                    It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
                Times.AtLeastOnce);
        }

        #endregion
    }
}