using System.ComponentModel.DataAnnotations;
using AiLootGenerator.RestApi.Models;
using Xunit;

namespace AiLootGenerator.RestApi.Tests.Unit
{
    /// <summary>
    /// Unit tests for the LootItem model to verify validation rules and property assignments.
    /// </summary>
    public class LootItemTests
    {
        #region Valid Data Tests

        [Fact]
        public void LootItem_ValidData_ShouldPassValidation()
        {
            // Arrange
            var item = new LootItem
            {
                Name = "Dwarf Ale Mug",
                Description = "A sturdy ceramic mug with dwarven runes",
                ValueInPennies = 25,
                WealthLevel = WealthLevel.Common
            };

            // Act
            var validationResults = ValidateModel(item);

            // Assert
            Assert.Empty(validationResults);
        }

        [Fact]
        public void LootItem_AllWealthLevels_ShouldPassValidation()
        {
            // Arrange & Act & Assert for each wealth level
            foreach (WealthLevel wealthLevel in Enum.GetValues<WealthLevel>())
            {
                var item = new LootItem
                {
                    Name = $"Test Item {wealthLevel}",
                    Description = $"A test item for {wealthLevel} wealth level",
                    ValueInPennies = GetValidValueForWealthLevel(wealthLevel),
                    WealthLevel = wealthLevel
                };

                var validationResults = ValidateModel(item);
                Assert.Empty(validationResults);
            }
        }

        [Theory]
        [InlineData("ABC", "Short but valid name")]
        [InlineData("Perfect Length Name", "A normal length description")]
        [InlineData("This is a very long name that is exactly one hundred characters long to test the maximum", "Max length name test")]
        public void LootItem_ValidNameLengths_ShouldPassValidation(string name, string description)
        {
            // Arrange
            var item = new LootItem
            {
                Name = name,
                Description = description,
                ValueInPennies = 100,
                WealthLevel = WealthLevel.Common
            };

            // Act
            var validationResults = ValidateModel(item);

            // Assert
            Assert.Empty(validationResults);
        }

        #endregion

        #region Name Validation Tests

        [Theory]
        [InlineData("AB")]         // Too short (< 3 chars)
        [InlineData("A")]          // Way too short
        [InlineData("12")]         // Numbers but still too short
        public void LootItem_InvalidNameTooShort_ShouldFailValidation(string invalidName)
        {
            // Arrange
            var item = new LootItem
            {
                Name = invalidName,
                Description = "Valid description",
                ValueInPennies = 25,
                WealthLevel = WealthLevel.Common
            };

            // Act
            var validationResults = ValidateModel(item);

            // Assert
            Assert.Contains(validationResults, v => v.MemberNames.Contains("Name"));
            Assert.Contains(validationResults, v => v.ErrorMessage!.Contains("between 3 and 100 characters"));
        }

        [Fact]
        public void LootItem_NameEmpty_ShouldFailValidation()
        {
            // Arrange
            var item = new LootItem
            {
                Name = "", // Empty string
                Description = "Valid description",
                ValueInPennies = 25,
                WealthLevel = WealthLevel.Common
            };

            // Act
            var validationResults = ValidateModel(item);

            // Assert
            Assert.Contains(validationResults, v => v.MemberNames.Contains("Name"));
            // Empty string triggers Required validation, not StringLength validation
            Assert.Contains(validationResults, v => v.ErrorMessage!.Contains("required"));
        }

        [Fact]
        public void LootItem_NameTooLong_ShouldFailValidation()
        {
            // Arrange - Create a name that's 101 characters (exceeds max of 100)
            var longName = new string('X', 101);
            var item = new LootItem
            {
                Name = longName,
                Description = "Valid description",
                ValueInPennies = 25,
                WealthLevel = WealthLevel.Common
            };

            // Act
            var validationResults = ValidateModel(item);

            // Assert
            Assert.Contains(validationResults, v => v.MemberNames.Contains("Name"));
            Assert.Contains(validationResults, v => v.ErrorMessage!.Contains("between 3 and 100 characters"));
        }

        [Fact]
        public void LootItem_NameNull_ShouldFailValidation()
        {
            // Arrange
            var item = new LootItem
            {
                Name = null!,
                Description = "Valid description",
                ValueInPennies = 25,
                WealthLevel = WealthLevel.Common
            };

            // Act
            var validationResults = ValidateModel(item);

            // Assert
            Assert.Contains(validationResults, v => v.MemberNames.Contains("Name"));
        }

        #endregion

        #region Description Validation Tests

        [Fact]
        public void LootItem_DescriptionNull_ShouldFailValidation()
        {
            // Arrange
            var item = new LootItem
            {
                Name = "Valid Name",
                Description = null!,
                ValueInPennies = 25,
                WealthLevel = WealthLevel.Common
            };

            // Act
            var validationResults = ValidateModel(item);

            // Assert
            Assert.Contains(validationResults, v => v.MemberNames.Contains("Description"));
        }

        [Fact]
        public void LootItem_DescriptionEmpty_ShouldFailValidation()
        {
            // Arrange
            var item = new LootItem
            {
                Name = "Valid Name",
                Description = "",
                ValueInPennies = 25,
                WealthLevel = WealthLevel.Common
            };

            // Act
            var validationResults = ValidateModel(item);

            // Assert
            Assert.Contains(validationResults, v => v.MemberNames.Contains("Description"));
        }

        #endregion

        #region ValueInPennies Validation Tests

        [Theory]
        [InlineData(0)]
        [InlineData(-1)]
        [InlineData(-100)]
        [InlineData(-999999)]
        public void LootItem_InvalidValueInPennies_ShouldFailValidation(int invalidValue)
        {
            // Arrange
            var item = new LootItem
            {
                Name = "Valid Name",
                Description = "Valid description",
                ValueInPennies = invalidValue,
                WealthLevel = WealthLevel.Common
            };

            // Act
            var validationResults = ValidateModel(item);

            // Assert
            Assert.Contains(validationResults, v => v.MemberNames.Contains("ValueInPennies"));
            Assert.Contains(validationResults, v => v.ErrorMessage!.Contains("must be a positive integer"));
        }

        [Theory]
        [InlineData(1)]           // Minimum valid value
        [InlineData(12)]          // Rubbish tier max
        [InlineData(60)]          // Poor tier max
        [InlineData(240)]         // Common tier max
        [InlineData(1200)]        // Wealthy tier max
        [InlineData(5000)]        // Noble tier
        [InlineData(int.MaxValue)] // Maximum possible value
        public void LootItem_ValidValueInPennies_ShouldPassValidation(int validValue)
        {
            // Arrange
            var item = new LootItem
            {
                Name = "Valid Name",
                Description = "Valid description",
                ValueInPennies = validValue,
                WealthLevel = WealthLevel.Noble // Use highest tier to allow any value
            };

            // Act
            var validationResults = ValidateModel(item);

            // Assert
            Assert.Empty(validationResults);
        }

        #endregion

        #region Property Assignment Tests

        [Fact]
        public void LootItem_PropertyAssignment_ShouldWorkCorrectly()
        {
            // Arrange
            var expectedName = "Jungfreud Tabard in Ubersreik colors";
            var expectedDescription = "A well-maintained cloth tabard bearing the heraldry of House Jungfreud";
            var expectedValue = 60;
            var expectedWealthLevel = WealthLevel.Poor;

            // Act
            var item = new LootItem
            {
                Name = expectedName,
                Description = expectedDescription,
                ValueInPennies = expectedValue,
                WealthLevel = expectedWealthLevel
            };

            // Assert
            Assert.Equal(expectedName, item.Name);
            Assert.Equal(expectedDescription, item.Description);
            Assert.Equal(expectedValue, item.ValueInPennies);
            Assert.Equal(expectedWealthLevel, item.WealthLevel);
        }

        [Fact]
        public void LootItem_DefaultValues_ShouldBeCorrect()
        {
            // Arrange & Act
            var item = new LootItem();

            // Assert
            Assert.Equal(string.Empty, item.Name);
            Assert.Equal(string.Empty, item.Description);
            Assert.Equal(0, item.ValueInPennies);
            Assert.Equal((WealthLevel)0, item.WealthLevel); // Default enum value is 0, not the first defined value
        }

        #endregion

        #region Business Logic Tests (Wealth Level Ranges)

        [Theory]
        [InlineData(WealthLevel.Rubbish, 1, 12)]     // Rubbish: 1-12 pennies
        [InlineData(WealthLevel.Poor, 13, 60)]       // Poor: 13-60 pennies
        [InlineData(WealthLevel.Common, 61, 240)]    // Common: 61-240 pennies
        [InlineData(WealthLevel.Wealthy, 241, 1200)] // Wealthy: 241-1200 pennies
        [InlineData(WealthLevel.Noble, 1201, 5000)]  // Noble: 1201+ pennies
        public void LootItem_WealthLevelRanges_ShouldBeDocumented(WealthLevel wealthLevel, int minValue, int maxValue)
        {
            // This test documents the expected value ranges for each wealth level
            // It validates that items can be created with values in the expected ranges
            
            // Arrange & Act - Test minimum value
            var minItem = new LootItem
            {
                Name = $"Min {wealthLevel} Item",
                Description = $"Minimum value item for {wealthLevel}",
                ValueInPennies = minValue,
                WealthLevel = wealthLevel
            };

            var maxItem = new LootItem
            {
                Name = $"Max {wealthLevel} Item",
                Description = $"Maximum value item for {wealthLevel}",
                ValueInPennies = maxValue,
                WealthLevel = wealthLevel
            };

            // Assert
            var minValidationResults = ValidateModel(minItem);
            var maxValidationResults = ValidateModel(maxItem);
            
            Assert.Empty(minValidationResults);
            Assert.Empty(maxValidationResults);
        }

        #endregion

        #region Multiple Validation Errors Tests

        [Fact]
        public void LootItem_MultipleValidationErrors_ShouldReturnAllErrors()
        {
            // Arrange - Create item with multiple validation errors
            var item = new LootItem
            {
                Name = "AB",        // Too short
                Description = "",   // Empty (required)
                ValueInPennies = -5, // Negative (invalid)
                WealthLevel = WealthLevel.Common
            };

            // Act
            var validationResults = ValidateModel(item);

            // Assert
            Assert.True(validationResults.Count >= 3); // Should have at least 3 errors
            Assert.Contains(validationResults, v => v.MemberNames.Contains("Name"));
            Assert.Contains(validationResults, v => v.MemberNames.Contains("Description"));
            Assert.Contains(validationResults, v => v.MemberNames.Contains("ValueInPennies"));
        }

        #endregion

        #region Helper Methods

        /// <summary>
        /// Validates a model using the standard .NET validation framework.
        /// </summary>
        /// <param name="model">The model to validate</param>
        /// <returns>List of validation results (empty if valid)</returns>
        private static List<ValidationResult> ValidateModel(object model)
        {
            var validationResults = new List<ValidationResult>();
            var context = new ValidationContext(model);
            Validator.TryValidateObject(model, context, validationResults, validateAllProperties: true);
            return validationResults;
        }

        /// <summary>
        /// Returns a valid penny value for the specified wealth level based on documented ranges.
        /// </summary>
        /// <param name="wealthLevel">The wealth level to get a valid value for</param>
        /// <returns>A valid penny value for the wealth level</returns>
        private static int GetValidValueForWealthLevel(WealthLevel wealthLevel)
        {
            return wealthLevel switch
            {
                WealthLevel.Rubbish => 6,     // Mid-range of 1-12
                WealthLevel.Poor => 30,       // Mid-range of 13-60
                WealthLevel.Common => 120,    // Mid-range of 61-240
                WealthLevel.Wealthy => 600,   // Mid-range of 241-1200
                WealthLevel.Noble => 2000,    // Above 1201
                _ => 100 // Default fallback
            };
        }

        #endregion
    }
}
