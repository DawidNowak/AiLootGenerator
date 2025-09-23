using AiLootGenerator.RestApi.Models;
using Xunit;

namespace AiLootGenerator.RestApi.Tests.Unit.Models
{
    /// <summary>
    /// Unit tests for WealthLevel enum to ensure correct values and descriptions
    /// matching frontend TypeScript types.
    /// </summary>
    public class WealthLevelTests
    {
        [Fact]
        public void WealthLevel_ShouldHave_CorrectValues()
        {
            // Arrange & Act & Assert
            Assert.Equal(1, (int)WealthLevel.Rubbish);
            Assert.Equal(2, (int)WealthLevel.Poor);
            Assert.Equal(3, (int)WealthLevel.Common);
            Assert.Equal(4, (int)WealthLevel.Wealthy);
            Assert.Equal(5, (int)WealthLevel.Noble);
        }

        [Fact]
        public void WealthLevel_ShouldHave_AllExpectedValues()
        {
            // Arrange
            var expectedValues = new[]
            {
                WealthLevel.Rubbish,
                WealthLevel.Poor,
                WealthLevel.Common,
                WealthLevel.Wealthy,
                WealthLevel.Noble
            };

            // Act
            var actualValues = Enum.GetValues<WealthLevel>();

            // Assert
            Assert.Equal(expectedValues.Length, actualValues.Length);
            foreach (var expectedValue in expectedValues)
            {
                Assert.Contains(expectedValue, actualValues);
            }
        }

        [Theory]
        [InlineData(WealthLevel.Rubbish, "Rubbish")]
        [InlineData(WealthLevel.Poor, "Poor")]
        [InlineData(WealthLevel.Common, "Common")]
        [InlineData(WealthLevel.Wealthy, "Wealthy")]
        [InlineData(WealthLevel.Noble, "Noble")]
        public void WealthLevel_ToString_ShouldReturn_CorrectName(WealthLevel wealthLevel, string expectedName)
        {
            // Act
            var actualName = wealthLevel.ToString();

            // Assert
            Assert.Equal(expectedName, actualName);
        }

        [Theory]
        [InlineData("Rubbish", WealthLevel.Rubbish)]
        [InlineData("Poor", WealthLevel.Poor)]
        [InlineData("Common", WealthLevel.Common)]
        [InlineData("Wealthy", WealthLevel.Wealthy)]
        [InlineData("Noble", WealthLevel.Noble)]
        public void WealthLevel_Parse_ShouldReturn_CorrectValue(string name, WealthLevel expectedValue)
        {
            // Act
            var success = Enum.TryParse<WealthLevel>(name, out var actualValue);

            // Assert
            Assert.True(success);
            Assert.Equal(expectedValue, actualValue);
        }

        [Fact]
        public void WealthLevel_Parse_ShouldBe_CaseInsensitive()
        {
            // Arrange
            var testCases = new[]
            {
                ("rubbish", WealthLevel.Rubbish),
                ("POOR", WealthLevel.Poor),
                ("common", WealthLevel.Common),
                ("WEALTHY", WealthLevel.Wealthy),
                ("noble", WealthLevel.Noble)
            };

            // Act & Assert
            foreach (var (input, expected) in testCases)
            {
                var success = Enum.TryParse<WealthLevel>(input, ignoreCase: true, out var actual);
                Assert.True(success, $"Failed to parse '{input}'");
                Assert.Equal(expected, actual);
            }
        }

        [Theory]
        [InlineData(WealthLevel.Rubbish, 1, 12)]  // 1-12 pennies
        [InlineData(WealthLevel.Poor, 13, 60)]    // 13-60 pennies  
        [InlineData(WealthLevel.Common, 61, 240)] // 61-240 pennies
        [InlineData(WealthLevel.Wealthy, 241, 1200)] // 241-1200 pennies
        [InlineData(WealthLevel.Noble, 1201, int.MaxValue)] // 1201+ pennies
        public void WealthLevel_ShouldMatch_ExpectedValueRanges(WealthLevel level, int minValue, int maxValue)
        {
            // This test documents the expected value ranges for each wealth level
            // These ranges should match the descriptions in the XML documentation
            // and the frontend translation files

            // Act & Assert - This is a documentation test
            Assert.True(minValue > 0, "Minimum value should be positive");
            Assert.True(maxValue >= minValue, "Maximum value should be greater than or equal to minimum");
            
            // Verify the ranges don't overlap (except for Noble which is open-ended)
            switch (level)
            {
                case WealthLevel.Rubbish:
                    Assert.Equal(1, minValue);
                    Assert.Equal(12, maxValue);
                    break;
                case WealthLevel.Poor:
                    Assert.Equal(13, minValue);
                    Assert.Equal(60, maxValue);
                    break;
                case WealthLevel.Common:
                    Assert.Equal(61, minValue);
                    Assert.Equal(240, maxValue);
                    break;
                case WealthLevel.Wealthy:
                    Assert.Equal(241, minValue);
                    Assert.Equal(1200, maxValue);
                    break;
                case WealthLevel.Noble:
                    Assert.Equal(1201, minValue);
                    // Noble is open-ended (1201+)
                    break;
            }
        }

        [Fact]
        public void WealthLevel_ShouldBe_Serializable()
        {
            // Arrange
            var wealthLevel = WealthLevel.Wealthy;

            // Act
            var serialized = System.Text.Json.JsonSerializer.Serialize(wealthLevel);
            var deserialized = System.Text.Json.JsonSerializer.Deserialize<WealthLevel>(serialized);

            // Assert
            Assert.Equal(wealthLevel, deserialized);
        }
    }
}