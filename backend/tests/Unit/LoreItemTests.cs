using System.ComponentModel.DataAnnotations;
using AiLootGenerator.RestApi.Models;
using Xunit;

namespace AiLootGenerator.RestApi.Tests.Unit
{
    /// <summary>
    /// Unit tests for the LoreItem model to verify validation rules and property assignments.
    /// </summary>
    public class LoreItemTests : ModelValidationTestBase
    {
        #region Valid Data Tests

        [Fact]
        public void LoreItem_ValidData_ShouldPassValidation()
        {
            // Arrange
            var item = new LoreItem
            {
                Id = Guid.NewGuid(),
                Name = "Bretonnian Longbow",
                Description = "A finely crafted longbow made from the sacred woods of Athel Loren, featuring intricate elven runes along its grip.",
                ValueInPennies = 480,
                Tags = new List<string> { "Bretonnia", "Elven", "Weapon", "Archery", "Noble" }
            };

            // Act & Assert
            AssertValidModel(item);
        }

        [Fact]
        public void LoreItem_AllRequiredProperties_ShouldPassValidation()
        {
            // Arrange
            var item = new LoreItem
            {
                Id = Guid.NewGuid(),
                Name = "Dwarf Runic Hammer",
                Description = "A masterwork war hammer forged in the deep halls of Karak Azgal, bearing ancient runic inscriptions.",
                ValueInPennies = 1200,
                Tags = new List<string> { "Dwarf", "Weapon", "Runic", "Karak", "Masterwork" }
            };

            // Act & Assert
            AssertValidModel(item);
        }

        [Theory]
        [InlineData("ABC", "A valid description of at least twenty characters for proper embeddings", 100, new[] { "Tag1", "Tag2", "Tag3" })]
        [InlineData("Perfect Length Name", "A normal length description that meets the minimum character requirements for vector embeddings", 500, new[] { "Empire", "Imperial", "Noble", "Guild" })]
        [InlineData("This is a very long item name that approaches the maximum allowed character limit for names", "A comprehensive description that provides rich context for vector embedding generation while staying within limits", 2000, new[] { "Chaos", "Dark", "Cursed", "North", "Shrine", "Artifact" })]
        public void LoreItem_ValidBoundaryValues_ShouldPassValidation(string name, string description, int valueInPennies, string[] tags)
        {
            // Arrange
            var item = new LoreItem
            {
                Id = Guid.NewGuid(),
                Name = name,
                Description = description,
                ValueInPennies = valueInPennies,
                Tags = tags.ToList()
            };

            // Act & Assert
            AssertValidModel(item);
        }

        [Fact]
        public void LoreItem_MinimumTags_ShouldPassValidation()
        {
            // Arrange
            var item = new LoreItem
            {
                Id = Guid.NewGuid(),
                Name = "Test Item",
                Description = "A valid description with exactly twenty characters for testing",
                ValueInPennies = 100,
                Tags = new List<string> { "Tag1", "Tag2", "Tag3" } // Exactly 3 tags (minimum)
            };

            // Act & Assert
            AssertValidModel(item);
        }

        [Fact]
        public void LoreItem_MaximumTags_ShouldPassValidation()
        {
            // Arrange
            var item = new LoreItem
            {
                Id = Guid.NewGuid(),
                Name = "Test Item",
                Description = "A valid description with exactly twenty characters for testing",
                ValueInPennies = 100,
                Tags = new List<string> { "Tag1", "Tag2", "Tag3", "Tag4", "Tag5", "Tag6", "Tag7", "Tag8", "Tag9", "Tag10" } // Exactly 10 tags (maximum)
            };

            // Act & Assert
            AssertValidModel(item);
        }

        #endregion

        #region Invalid Data Tests

        [Theory]
        [InlineData("", "Name cannot be empty")]
        [InlineData("AB", "Name must be at least 3 characters")]
        [InlineData("This name is way too long and exceeds the maximum allowed character limit of 100 characters for item names", "Name cannot exceed 100 characters")]
        public void LoreItem_InvalidName_ShouldFailValidation(string invalidName, string _)
        {
            // Arrange
            var item = new LoreItem
            {
                Id = Guid.NewGuid(),
                Name = invalidName,
                Description = "A valid description with exactly twenty characters for testing",
                ValueInPennies = 100,
                Tags = new List<string> { "Tag1", "Tag2", "Tag3" }
            };

            // Act & Assert
            AssertInvalidProperty(item, nameof(LoreItem.Name));
        }

        [Theory]
        [InlineData("", "Description cannot be empty")]
        [InlineData("Too short", "Description must be at least 20 characters")]
        [InlineData("This description is way too long and exceeds the maximum allowed character limit of 200 characters for item descriptions which are optimized for vector embeddings and should be concise yet descriptive enough to provide proper context", "Description cannot exceed 200 characters")]
        public void LoreItem_InvalidDescription_ShouldFailValidation(string invalidDescription, string _)
        {
            // Arrange
            var item = new LoreItem
            {
                Id = Guid.NewGuid(),
                Name = "Valid Name",
                Description = invalidDescription,
                ValueInPennies = 100,
                Tags = new List<string> { "Tag1", "Tag2", "Tag3" }
            };

            // Act & Assert
            AssertInvalidProperty(item, nameof(LoreItem.Description));
        }

        [Theory]
        [InlineData(0, "Value cannot be zero")]
        [InlineData(-1, "Value cannot be negative")]
        [InlineData(-100, "Value cannot be negative")]
        public void LoreItem_InvalidValueInPennies_ShouldFailValidation(int invalidValue, string _)
        {
            // Arrange
            var item = new LoreItem
            {
                Id = Guid.NewGuid(),
                Name = "Valid Name",
                Description = "A valid description with exactly twenty characters for testing",
                ValueInPennies = invalidValue,
                Tags = new List<string> { "Tag1", "Tag2", "Tag3" }
            };

            // Act & Assert
            AssertInvalidProperty(item, nameof(LoreItem.ValueInPennies));
        }

        [Fact]
        public void LoreItem_TooFewTags_ShouldFailValidation()
        {
            // Arrange
            var item = new LoreItem
            {
                Id = Guid.NewGuid(),
                Name = "Valid Name",
                Description = "A valid description with exactly twenty characters for testing",
                ValueInPennies = 100,
                Tags = new List<string> { "Tag1", "Tag2" } // Only 2 tags (minimum is 3)
            };

            // Act & Assert
            AssertInvalidProperty(item, nameof(LoreItem.Tags), "at least 3 descriptive keywords");
        }

        [Fact]
        public void LoreItem_TooManyTags_ShouldFailValidation()
        {
            // Arrange
            var item = new LoreItem
            {
                Id = Guid.NewGuid(),
                Name = "Valid Name",
                Description = "A valid description with exactly twenty characters for testing",
                ValueInPennies = 100,
                Tags = new List<string> { "Tag1", "Tag2", "Tag3", "Tag4", "Tag5", "Tag6", "Tag7", "Tag8", "Tag9", "Tag10", "Tag11" } // 11 tags (maximum is 10)
            };

            // Act & Assert
            AssertInvalidProperty(item, nameof(LoreItem.Tags), "at most 10 descriptive keywords");
        }

        [Fact]
        public void LoreItem_EmptyTags_ShouldFailValidation()
        {
            // Arrange
            var item = new LoreItem
            {
                Id = Guid.NewGuid(),
                Name = "Valid Name",
                Description = "A valid description with exactly twenty characters for testing",
                ValueInPennies = 100,
                Tags = new List<string>() // Empty tags list
            };

            // Act & Assert
            AssertInvalidProperty(item, nameof(LoreItem.Tags), "at least 3 descriptive keywords");
        }

        [Fact]
        public void LoreItem_NullTags_ShouldFailValidation()
        {
            // Arrange
            var item = new LoreItem
            {
                Id = Guid.NewGuid(),
                Name = "Valid Name",
                Description = "A valid description with exactly twenty characters for testing",
                ValueInPennies = 100,
                Tags = null! // Null tags
            };

            // Act & Assert
            AssertInvalidProperty(item, nameof(LoreItem.Tags));
        }

        #endregion

        #region Property Assignment Tests

        [Fact]
        public void LoreItem_PropertyAssignments_ShouldWorkCorrectly()
        {
            // Arrange
            var id = Guid.NewGuid();
            var name = "Elven Cloak";
            var description = "A magical cloak woven from the finest elven silk and imbued with protective enchantments.";
            var valueInPennies = 2400;
            var tags = new List<string> { "Elven", "Magic", "Protection", "Clothing", "Rare" };

            // Act
            var item = new LoreItem
            {
                Id = id,
                Name = name,
                Description = description,
                ValueInPennies = valueInPennies,
                Tags = tags
            };

            // Assert
            Assert.Equal(id, item.Id);
            Assert.Equal(name, item.Name);
            Assert.Equal(description, item.Description);
            Assert.Equal(valueInPennies, item.ValueInPennies);
            Assert.Equal(tags, item.Tags);
        }

        [Fact]
        public void LoreItem_DefaultValues_ShouldBeCorrect()
        {
            // Act
            var item = new LoreItem();

            // Assert
            Assert.Equal(Guid.Empty, item.Id);
            Assert.Equal(string.Empty, item.Name);
            Assert.Equal(string.Empty, item.Description);
            Assert.Equal(0, item.ValueInPennies);
            Assert.NotNull(item.Tags);
            Assert.Empty(item.Tags);
        }

        [Fact]
        public void LoreItem_TagsCollection_ShouldBeModifiable()
        {
            // Arrange
            var item = new LoreItem
            {
                Id = Guid.NewGuid(),
                Name = "Test Item",
                Description = "A valid description with exactly twenty characters for testing",
                ValueInPennies = 100,
                Tags = new List<string> { "Tag1", "Tag2", "Tag3" }
            };

            // Act
            item.Tags.Add("Tag4");
            item.Tags.Remove("Tag1");

            // Assert
            Assert.Contains("Tag4", item.Tags);
            Assert.DoesNotContain("Tag1", item.Tags);
            Assert.Equal(3, item.Tags.Count);
        }

        #endregion

        #region Typical Use Case Tests

        [Fact]
        public void LoreItem_TypicalWeaponExample_ShouldPassValidation()
        {
            // Arrange
            var item = new LoreItem
            {
                Id = Guid.NewGuid(),
                Name = "Drakwald Hunter's Bow",
                Description = "A composite bow crafted from the dark woods of the Drakwald Forest, reinforced with iron bands and blessed by Taal.",
                ValueInPennies = 720,
                Tags = new List<string> { "Empire", "Drakwald", "Weapon", "Hunting", "Blessed", "Taal" }
            };

            // Act & Assert
            AssertValidModel(item);
        }

        [Fact]
        public void LoreItem_TypicalArmorExample_ShouldPassValidation()
        {
            // Arrange
            var item = new LoreItem
            {
                Id = Guid.NewGuid(),
                Name = "Kislevite Bear Pelt",
                Description = "A thick fur cloak made from the hide of a Kislev ice bear, providing exceptional warmth and protection in harsh climates.",
                ValueInPennies = 960,
                Tags = new List<string> { "Kislev", "Armor", "Fur", "Cold", "Protection" }
            };

            // Act & Assert
            AssertValidModel(item);
        }

        [Fact]
        public void LoreItem_TypicalMagicalExample_ShouldPassValidation()
        {
            // Arrange
            var item = new LoreItem
            {
                Id = Guid.NewGuid(),
                Name = "Sigmarite Pendant",
                Description = "A blessed pendant bearing the twin-tailed comet of Sigmar, radiating divine protection against the forces of darkness.",
                ValueInPennies = 1440,
                Tags = new List<string> { "Empire", "Sigmar", "Religious", "Magic", "Protection", "Divine" }
            };

            // Act & Assert
            AssertValidModel(item);
        }

        #endregion
    }
}