using System.ComponentModel.DataAnnotations;

namespace AiLootGenerator.RestApi.Models
{
    /// <summary>
    /// Represents a generated treasure item with Warhammer Fantasy context.
    /// </summary>
    public class LootItem
    {
        /// <summary>
        /// Thematic item name (e.g., "Jungfreud Tabard in Ubersreik colors").
        /// </summary>
        [Required]
        [StringLength(100, MinimumLength = 3, ErrorMessage = "Name must be between 3 and 100 characters")]
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Detailed item description for immersion.
        /// </summary>
        [Required]
        public string Description { get; set; } = string.Empty;

        /// <summary>
        /// Estimated value in pennies (smallest WFRP denomination).
        /// </summary>
        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "ValueInPennies must be a positive integer")]
        public int ValueInPennies { get; set; }

        /// <summary>
        /// Item's wealth classification.
        /// </summary>
        [Required]
        public WealthLevel WealthLevel { get; set; }
    }
}