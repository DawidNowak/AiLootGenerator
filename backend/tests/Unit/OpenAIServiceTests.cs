using Microsoft.Extensions.Logging;
using OpenAI.Chat;
using OpenAI.Embeddings;
using AiLootGenerator.RestApi.Models;
using AiLootGenerator.RestApi.Services;
using System.ComponentModel.DataAnnotations;

namespace AiLootGenerator.RestApi.Tests.Unit
{
    /// <summary>
    /// Unit tests for OpenAIService covering core logic and validation.
    /// Note: Due to the complexity of mocking OpenAI SDK types, these tests focus on
    /// validation logic and error handling. Integration tests should cover the full OpenAI interaction.
    /// </summary>
    public class OpenAIServiceTests
    {
        private static OpenAIService CreateService()
        {
            var chatClient = new ChatClient("test", "test-key");
            var embeddingClient = new EmbeddingClient("test", "test-key");
            var logger = new LoggerFactory().CreateLogger<OpenAIService>();
            return new OpenAIService(chatClient, embeddingClient, logger);
        }

        [Fact]
        public void Constructor_WithNullChatClient_ThrowsArgumentNullException()
        {
            // Arrange
            var embeddingClient = new EmbeddingClient("test", "test-key");
            var logger = new LoggerFactory().CreateLogger<OpenAIService>();

            // Act & Assert
            Assert.Throws<ArgumentNullException>(() => new OpenAIService(null!, embeddingClient, logger));
        }

        [Fact]
        public void Constructor_WithNullEmbeddingClient_ThrowsArgumentNullException()
        {
            // Arrange
            var chatClient = new ChatClient("test", "test-key");
            var logger = new LoggerFactory().CreateLogger<OpenAIService>();

            // Act & Assert
            Assert.Throws<ArgumentNullException>(() => new OpenAIService(chatClient, null!, logger));
        }

        [Fact]
        public void Constructor_WithNullLogger_ThrowsArgumentNullException()
        {
            // Arrange
            var chatClient = new ChatClient("test", "test-key");
            var embeddingClient = new EmbeddingClient("test", "test-key");

            // Act & Assert
            Assert.Throws<ArgumentNullException>(() => new OpenAIService(chatClient, embeddingClient, null!));
        }

        [Fact]
        public async Task GenerateLootAsync_WithNullRequest_ThrowsArgumentNullException()
        {
            // Arrange
            var chatClient = new ChatClient("test", "test-key");
            var embeddingClient = new EmbeddingClient("test", "test-key");
            var logger = new LoggerFactory().CreateLogger<OpenAIService>();
            var service = new OpenAIService(chatClient, embeddingClient, logger);

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentNullException>(
                () => service.GenerateLootAsync(null!));
        }

        [Fact]
        public async Task GenerateLootAsync_WithEmptyLocation_ThrowsArgumentException()
        {
            // Arrange
            var service = CreateService();

            var request = new GenerationRequest
            {
                Location = "", // Empty location
                WealthLevel = WealthLevel.Common,
                Language = "en",
                SessionId = Guid.NewGuid()
            };

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(
                () => service.GenerateLootAsync(request));
        }

        [Fact]
        public async Task GenerateLootAsync_WithLocationTooLong_ThrowsArgumentException()
        {
            // Arrange
            var service = CreateService();

            var request = new GenerationRequest
            {
                Location = new string('A', 201), // Location too long
                WealthLevel = WealthLevel.Common,
                Language = "en",
                SessionId = Guid.NewGuid()
            };

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(
                () => service.GenerateLootAsync(request));
        }

        [Fact]
        public async Task GenerateLootAsync_WithInvalidLanguage_ThrowsArgumentException()
        {
            // Arrange
            var chatClient = new ChatClient("test", "test-key");
            var logger = new LoggerFactory().CreateLogger<OpenAIService>();
            var service = CreateService();

            var request = new GenerationRequest
            {
                Location = "Valid Location",
                WealthLevel = WealthLevel.Common,
                Language = "invalid", // Invalid language
                SessionId = Guid.NewGuid()
            };

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(
                () => service.GenerateLootAsync(request));
        }

        /// <summary>
        /// Tests for wealth level determination logic
        /// </summary>
        [Theory]
        [InlineData(5, WealthLevel.Rubbish)]
        [InlineData(30, WealthLevel.Poor)]
        [InlineData(150, WealthLevel.Common)]
        [InlineData(500, WealthLevel.Wealthy)]
        [InlineData(2000, WealthLevel.Noble)]
        [InlineData(0, null)] // Invalid value
        [InlineData(-5, null)] // Negative value
        public void DetermineWealthLevel_ReturnsCorrectWealthLevel(int valueInPennies, WealthLevel? expected)
        {
            // Arrange
            var chatClient = new ChatClient("test", "test-key");
            var logger = new LoggerFactory().CreateLogger<OpenAIService>();
            var service = CreateService();

            // Act
            var actual = service.DetermineWealthLevel(valueInPennies);

            // Assert
            Assert.Equal(expected, actual);
        }

        /// <summary>
        /// Tests boundary values for wealth level determination
        /// </summary>
        [Theory]
        [InlineData(1, WealthLevel.Rubbish)]   // Lower bound Rubbish
        [InlineData(12, WealthLevel.Rubbish)]  // Upper bound Rubbish
        [InlineData(13, WealthLevel.Poor)]     // Lower bound Poor
        [InlineData(60, WealthLevel.Poor)]     // Upper bound Poor
        [InlineData(61, WealthLevel.Common)]   // Lower bound Common
        [InlineData(240, WealthLevel.Common)]  // Upper bound Common
        [InlineData(241, WealthLevel.Wealthy)] // Lower bound Wealthy
        [InlineData(1200, WealthLevel.Wealthy)] // Upper bound Wealthy
        [InlineData(1201, WealthLevel.Noble)]  // Lower bound Noble
        public void DetermineWealthLevel_BoundaryValues_ReturnsCorrectWealthLevel(int valueInPennies, WealthLevel expected)
        {
            // Arrange
            var chatClient = new ChatClient("test", "test-key");
            var logger = new LoggerFactory().CreateLogger<OpenAIService>();
            var service = CreateService();

            // Act
            var actual = service.DetermineWealthLevel(valueInPennies);

            // Assert
            Assert.Equal(expected, actual);
        }

        /// <summary>
        /// Tests for wealth description generation
        /// </summary>
        [Theory]
        [InlineData(WealthLevel.Rubbish, "junk items, lowest tier (1-12 pennies)")]
        [InlineData(WealthLevel.Poor, "peasant scraps, basic items (13-60 pennies)")]
        [InlineData(WealthLevel.Common, "everyday goods, standard quality (61-240 pennies)")]
        [InlineData(WealthLevel.Wealthy, "merchant spoils, valuable items (241-1200 pennies)")]
        [InlineData(WealthLevel.Noble, "opulent treasures, rare items (1201+ pennies)")]
        public void GetWealthDescription_ReturnsCorrectDescription(WealthLevel wealthLevel, string expected)
        {
            // Arrange
            var chatClient = new ChatClient("test", "test-key");
            var logger = new LoggerFactory().CreateLogger<OpenAIService>();
            var service = CreateService();

            // Act
            var actual = service.GetWealthDescription(wealthLevel);

            // Assert
            Assert.Equal(expected, actual);
        }

        #region Response Parsing Tests

        [Fact]
        public void ParseLootItemsFromResponse_WithValidJson_ReturnsCorrectItems()
        {
            // Arrange
            var chatClient = new ChatClient("test", "test-key");
            var logger = new LoggerFactory().CreateLogger<OpenAIService>();
            var service = CreateService();
            var validJsonResponse = CreateValidJsonResponse();

            // Act
            var result = service.ParseLootItemsFromResponse(validJsonResponse, WealthLevel.Common);

            // Assert
            Assert.Equal(2, result.Count);
            Assert.Equal("Iron Training Sword", result[0].Name);
            Assert.Equal(120, result[0].ValueInPennies);
            Assert.Equal(WealthLevel.Common, result[0].WealthLevel);
        }

        [Fact]
        public void ParseLootItemsFromResponse_WithExtraText_ExtractsJsonCorrectly()
        {
            // Arrange
            var chatClient = new ChatClient("test", "test-key");
            var logger = new LoggerFactory().CreateLogger<OpenAIService>();
            var service = CreateService();
            var responseWithExtraText = @"Here are some items:

[
  {
    ""name"": ""Rusty Dagger"",
    ""description"": ""A corroded blade"",
    ""valueInPennies"": 8
  }
]

Hope this helps!";

            // Act
            var result = service.ParseLootItemsFromResponse(responseWithExtraText, WealthLevel.Common);

            // Assert
            Assert.Single(result);
            Assert.Equal("Rusty Dagger", result[0].Name);
            Assert.Equal(WealthLevel.Rubbish, result[0].WealthLevel); // Calculated from value
        }

        [Fact]
        public void ParseLootItemsFromResponse_WithInvalidItems_FiltersOutInvalid()
        {
            // Arrange
            var chatClient = new ChatClient("test", "test-key");
            var logger = new LoggerFactory().CreateLogger<OpenAIService>();
            var service = CreateService();
            var responseWithInvalidItems = @"[
  {
    ""name"": ""Valid Item"",
    ""description"": ""Good description"",
    ""valueInPennies"": 100
  },
  {
    ""name"": """",
    ""description"": ""Empty name"",
    ""valueInPennies"": 50
  },
  {
    ""name"": ""Negative Value"",
    ""description"": ""Invalid value"",
    ""valueInPennies"": -10
  }
]";

            // Act
            var result = service.ParseLootItemsFromResponse(responseWithInvalidItems, WealthLevel.Common);

            // Assert
            Assert.Single(result); // Only the valid item
            Assert.Equal("Valid Item", result[0].Name);
        }

        [Theory]
        [InlineData(5, WealthLevel.Rubbish)]
        [InlineData(30, WealthLevel.Poor)]
        [InlineData(150, WealthLevel.Common)]
        [InlineData(500, WealthLevel.Wealthy)]
        [InlineData(2000, WealthLevel.Noble)]
        public void ParseLootItemsFromResponse_WithDifferentValues_AssignsCorrectWealthLevel(
            int valueInPennies, WealthLevel expectedWealthLevel)
        {
            // Arrange
            var chatClient = new ChatClient("test", "test-key");
            var logger = new LoggerFactory().CreateLogger<OpenAIService>();
            var service = CreateService();
            var response = $@"[
  {{
    ""name"": ""Test Item"",
    ""description"": ""Test description"",
    ""valueInPennies"": {valueInPennies}
  }}
]";

            // Act
            var result = service.ParseLootItemsFromResponse(response, WealthLevel.Common);

            // Assert
            Assert.Single(result);
            Assert.Equal(expectedWealthLevel, result[0].WealthLevel);
        }

        [Fact]
        public void ParseLootItemsFromResponse_WithInvalidJson_ThrowsException()
        {
            // Arrange
            var chatClient = new ChatClient("test", "test-key");
            var logger = new LoggerFactory().CreateLogger<OpenAIService>();
            var service = CreateService();
            var invalidJson = "This is not JSON";

            // Act & Assert
            var exception = Assert.Throws<InvalidOperationException>(
                () => service.ParseLootItemsFromResponse(invalidJson, WealthLevel.Common));
            Assert.Contains("No valid JSON array found", exception.Message);
        }

        [Fact]
        public void ParseLootItemsFromResponse_WithEmptyArray_ThrowsException()
        {
            // Arrange
            var chatClient = new ChatClient("test", "test-key");
            var logger = new LoggerFactory().CreateLogger<OpenAIService>();
            var service = CreateService();
            var emptyArray = "[]";

            // Act & Assert
            var exception = Assert.Throws<InvalidOperationException>(
                () => service.ParseLootItemsFromResponse(emptyArray, WealthLevel.Common));
            Assert.Contains("Failed to parse loot items", exception.Message);
        }

        #endregion

        #region Prompt Building Tests

        [Fact]
        public void BuildPrompt_WithLoreContext_IncludesContext()
        {
            // Arrange
            var chatClient = new ChatClient("test", "test-key");
            var logger = new LoggerFactory().CreateLogger<OpenAIService>();
            var service = CreateService();
            var validRequest = new GenerationRequest
            {
                Location = "Ubersreik barracks",
                WealthLevel = WealthLevel.Common,
                Language = "en",
                SessionId = Guid.NewGuid()
            };
            var loreContext = "Ubersreik is a military town";

            // Act
            var prompt = service.BuildPrompt(validRequest, loreContext);

            // Assert
            Assert.Contains(loreContext, prompt);
            Assert.Contains("Relevant Lore Context:", prompt);
        }

        [Fact]
        public void BuildPrompt_WithoutLoreContext_DoesNotIncludeContextSection()
        {
            // Arrange
            var chatClient = new ChatClient("test", "test-key");
            var logger = new LoggerFactory().CreateLogger<OpenAIService>();
            var service = CreateService();
            var validRequest = new GenerationRequest
            {
                Location = "Ubersreik barracks",
                WealthLevel = WealthLevel.Common,
                Language = "en",
                SessionId = Guid.NewGuid()
            };

            // Act
            var prompt = service.BuildPrompt(validRequest, null);

            // Assert
            Assert.DoesNotContain("Relevant Lore Context:", prompt);
        }

        [Theory]
        [InlineData("en", "Respond in English")]
        [InlineData("pl", "Respond in Polish")]
        public void BuildPrompt_WithDifferentLanguages_IncludesCorrectInstruction(
            string language, string expectedInstruction)
        {
            // Arrange
            var chatClient = new ChatClient("test", "test-key");
            var logger = new LoggerFactory().CreateLogger<OpenAIService>();
            var service = CreateService();
            var request = new GenerationRequest
            {
                Location = "Test Location",
                WealthLevel = WealthLevel.Common,
                Language = language,
                SessionId = Guid.NewGuid()
            };

            // Act
            var prompt = service.BuildPrompt(request, null);

            // Assert
            Assert.Contains(expectedInstruction, prompt);
        }

        [Theory]
        [InlineData("en", "Generate all item names and descriptions in English")]
        [InlineData("pl", "Generate all item names and descriptions in Polish")]
        public void GetSystemPrompt_WithDifferentLanguages_ReturnsCorrectPrompt(
            string language, string expectedText)
        {
            // Arrange
            var chatClient = new ChatClient("test", "test-key");
            var logger = new LoggerFactory().CreateLogger<OpenAIService>();
            var service = CreateService();

            // Act
            var systemPrompt = service.GetSystemPrompt(language);

            // Assert
            Assert.Contains(expectedText, systemPrompt);
            Assert.Contains("Warhammer Fantasy Roleplay Game Master assistant", systemPrompt);
        }

        #endregion

        #region Helper Methods

        private string CreateValidJsonResponse()
        {
            return @"[
  {
    ""name"": ""Iron Training Sword"",
    ""description"": ""A well-used practice blade with nicks from countless drills"",
    ""valueInPennies"": 120
  },
  {
    ""name"": ""Leather Bracers"",
    ""description"": ""Sturdy leather arm guards worn by soldiers"",
    ""valueInPennies"": 80
  }
]";
        }

        #endregion
    }
}
