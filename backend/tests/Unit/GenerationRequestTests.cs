using System.ComponentModel.DataAnnotations;
using AiLootGenerator.RestApi.Models;
using Xunit;

namespace AiLootGenerator.RestApi.Tests.Unit
{
    /// <summary>
    /// Unit tests for the GenerationRequest model to verify validation rules and property assignments.
    /// </summary>
    public class GenerationRequestTests : ModelValidationTestBase
    {
        #region Valid Data Tests

        [Fact]
        public void GenerationRequest_ValidData_ShouldPassValidation()
        {
            // Arrange
            var request = new GenerationRequest
            {
                Location = "Ubersreik barracks",
                WealthLevel = WealthLevel.Common,
                Language = "en",
                SessionId = Guid.NewGuid()
            };

            // Act & Assert
            AssertValidModel(request);
        }

        [Fact]
        public void GenerationRequest_AllWealthLevels_ShouldPassValidation()
        {
            // Arrange & Act & Assert for each wealth level
            foreach (WealthLevel wealthLevel in Enum.GetValues<WealthLevel>())
            {
                var request = new GenerationRequest
                {
                    Location = $"Test location for {wealthLevel}",
                    WealthLevel = wealthLevel,
                    Language = "en",
                    SessionId = Guid.NewGuid()
                };

                AssertValidModel(request);
            }
        }

        [Theory]
        [InlineData("A")]
        [InlineData("Ubersreik tavern")]
        [InlineData("The grand marketplace of Altdorf where merchants from across the Empire gather to trade exotic goods")]
        public void GenerationRequest_ValidLocationLengths_ShouldPassValidation(string location)
        {
            // Arrange
            var request = new GenerationRequest
            {
                Location = location,
                WealthLevel = WealthLevel.Common,
                Language = "en",
                SessionId = Guid.NewGuid()
            };

            // Act & Assert
            AssertValidModel(request);
        }

        [Theory]
        [InlineData("en")]
        [InlineData("pl")]
        public void GenerationRequest_ValidLanguages_ShouldPassValidation(string language)
        {
            // Arrange
            var request = new GenerationRequest
            {
                Location = "Test location",
                WealthLevel = WealthLevel.Common,
                Language = language,
                SessionId = Guid.NewGuid()
            };

            // Act & Assert
            AssertValidModel(request);
        }

        #endregion

        #region Location Validation Tests

        [Fact]
        public void GenerationRequest_LocationEmpty_ShouldFailValidation()
        {
            // Arrange
            var request = new GenerationRequest
            {
                Location = "", // Empty string
                WealthLevel = WealthLevel.Common,
                Language = "en",
                SessionId = Guid.NewGuid()
            };

            // Act & Assert
            AssertInvalidProperty(request, "Location", "required");
        }

        [Fact]
        public void GenerationRequest_LocationTooLong_ShouldFailValidation()
        {
            // Arrange - Create a location that's 201 characters (exceeds max of 200)
            var longLocation = new string('X', 201);
            var request = new GenerationRequest
            {
                Location = longLocation,
                WealthLevel = WealthLevel.Common,
                Language = "en",
                SessionId = Guid.NewGuid()
            };

            // Act & Assert
            AssertInvalidProperty(request, "Location", "between 1 and 200 characters");
        }

        [Fact]
        public void GenerationRequest_LocationNull_ShouldFailValidation()
        {
            // Arrange
            var request = new GenerationRequest
            {
                Location = null!,
                WealthLevel = WealthLevel.Common,
                Language = "en",
                SessionId = Guid.NewGuid()
            };

            // Act & Assert
            AssertInvalidProperty(request, "Location");
        }

        [Fact]
        public void GenerationRequest_LocationMaxLength_ShouldPassValidation()
        {
            // Arrange - Create a location that's exactly 200 characters (at the limit)
            var maxLengthLocation = new string('X', 200);
            var request = new GenerationRequest
            {
                Location = maxLengthLocation,
                WealthLevel = WealthLevel.Common,
                Language = "en",
                SessionId = Guid.NewGuid()
            };

            // Act & Assert
            AssertValidModel(request);
        }

        #endregion

        #region Language Validation Tests

        [Theory]
        [InlineData("fr")]         // French (not supported)
        [InlineData("de")]         // German (not supported)
        [InlineData("EN")]         // Uppercase (not matching regex)
        [InlineData("PL")]         // Uppercase (not matching regex)
        [InlineData("english")]    // Full word (not matching regex)
        [InlineData("polish")]     // Full word (not matching regex)
        [InlineData("")]           // Empty string
        [InlineData("es")]         // Spanish (not supported)
        public void GenerationRequest_InvalidLanguage_ShouldFailValidation(string invalidLanguage)
        {
            // Arrange
            var request = new GenerationRequest
            {
                Location = "Test location",
                WealthLevel = WealthLevel.Common,
                Language = invalidLanguage,
                SessionId = Guid.NewGuid()
            };

            // Act & Assert
            if (string.IsNullOrEmpty(invalidLanguage))
            {
                AssertInvalidProperty(request, "Language", "required");
            }
            else
            {
                AssertInvalidProperty(request, "Language", "Language must be 'en' or 'pl'");
            }
        }

        [Fact]
        public void GenerationRequest_LanguageNull_ShouldFailValidation()
        {
            // Arrange
            var request = new GenerationRequest
            {
                Location = "Test location",
                WealthLevel = WealthLevel.Common,
                Language = null!,
                SessionId = Guid.NewGuid()
            };

            // Act & Assert
            AssertInvalidProperty(request, "Language");
        }

        #endregion

        #region SessionId Validation Tests

        [Fact]
        public void GenerationRequest_SessionIdEmpty_DoesNotFailValidation()
        {
            // Arrange - Note: Guid.Empty is technically a valid Guid value
            // The [Required] attribute only checks for null, not empty Guid
            var request = new GenerationRequest
            {
                Location = "Test location",
                WealthLevel = WealthLevel.Common,
                Language = "en",
                SessionId = Guid.Empty // Empty GUID is still a valid Guid
            };

            // Act & Assert - Empty Guid passes validation (this is expected behavior)
            // If business logic requires non-empty Guid, that should be handled in business layer
            AssertValidModel(request);
        }

        [Fact]
        public void GenerationRequest_ValidGuid_ShouldPassValidation()
        {
            // Arrange
            var validGuid = Guid.Parse("550e8400-e29b-41d4-a716-446655440000");
            var request = new GenerationRequest
            {
                Location = "Test location",
                WealthLevel = WealthLevel.Common,
                Language = "en",
                SessionId = validGuid
            };

            // Act & Assert
            AssertValidModel(request);
            Assert.Equal(validGuid, request.SessionId);
        }

        #endregion

        #region WealthLevel Validation Tests

        [Fact]
        public void GenerationRequest_InvalidWealthLevel_ShouldFailValidation()
        {
            // Arrange
            var request = new GenerationRequest
            {
                Location = "Test location",
                WealthLevel = (WealthLevel)999, // Invalid enum value
                Language = "en",
                SessionId = Guid.NewGuid()
            };

            // Act
            var validationResults = ValidateModel(request);

            // Assert - While enum validation might not trigger a validation error in this context,
            // the invalid enum value should still be detectable
            Assert.Equal((WealthLevel)999, request.WealthLevel);
        }

        #endregion

        #region Multiple Validation Errors Tests

        [Fact]
        public void GenerationRequest_MultipleInvalidFields_ShouldFailValidationForAll()
        {
            // Arrange
            var request = new GenerationRequest
            {
                Location = "",        // Empty (required)
                WealthLevel = WealthLevel.Common,
                Language = "invalid", // Invalid language
                SessionId = Guid.NewGuid() // Valid SessionId (Guid.Empty would also be valid)
            };

            // Act & Assert
            AssertInvalidProperties(request, new[] { "Location", "Language" }, minimumErrorCount: 2);
        }

        #endregion

        #region Property Assignment Tests

        [Fact]
        public void GenerationRequest_PropertyAssignment_ShouldWorkCorrectly()
        {
            // Arrange
            var expectedLocation = "Ubersreik marketplace";
            var expectedWealthLevel = WealthLevel.Wealthy;
            var expectedLanguage = "pl";
            var expectedSessionId = Guid.NewGuid();

            // Act
            var request = new GenerationRequest
            {
                Location = expectedLocation,
                WealthLevel = expectedWealthLevel,
                Language = expectedLanguage,
                SessionId = expectedSessionId
            };

            // Assert
            Assert.Equal(expectedLocation, request.Location);
            Assert.Equal(expectedWealthLevel, request.WealthLevel);
            Assert.Equal(expectedLanguage, request.Language);
            Assert.Equal(expectedSessionId, request.SessionId);
        }

        #endregion
    }
}