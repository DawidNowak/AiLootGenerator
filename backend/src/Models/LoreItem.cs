using System.ComponentModel.DataAnnotations;

namespace AiLootGenerator.RestApi.Models
{
    /// <summary>
    /// Represents a canonical Warhammer Fantasy item stored in vector database for semantic search and generation inspiration.
    /// Note: These are reference items used internally for lore enhancement - they are NOT directly returned to users.
    /// Instead, they inspire the AI to generate new LootItem objects.
    /// </summary>
    public class LoreItem
    {
        /// <summary>
        /// Unique identifier for vector storage.
        /// </summary>
        [Required]
        public Guid Id { get; set; }

        /// <summary>
        /// Item name (e.g., "Bretonnian Longbow", "Dwarf Runic Hammer").
        /// </summary>
        [Required]
        [StringLength(100, MinimumLength = 3, ErrorMessage = "Name must be between 3 and 100 characters")]
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Rich item description for embedding generation.
        /// </summary>
        [Required]
        [StringLength(200, MinimumLength = 20, ErrorMessage = "Description must be between 20 and 200 characters")]
        public string Description { get; set; } = string.Empty;

        /// <summary>
        /// Base value in pennies (smallest WFRP denomination).
        /// </summary>
        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "ValueInPennies must be a positive integer")]
        public int ValueInPennies { get; set; }

        /// <summary>
        /// Semantic keywords for enhanced search matching.
        /// Examples:
        /// - Geographic: Ubersreik, Lustria, Araby, Kislev, Bretonnia
        /// - Cultural/Faction: Empire, Imperial, Dwarf, Elven, Chaos
        /// - Craftsmanship: Runesmith, Guild, Artisan, Noble
        /// - Location Types: Karak, Tavern, Temple, Workshop, Barracks
        /// </summary>
        [Required]
        [MinLength(3, ErrorMessage = "Tags must contain at least 3 descriptive keywords")]
        [MaxLength(10, ErrorMessage = "Tags must contain at most 10 descriptive keywords")]
        public List<string> Tags { get; set; } = new List<string>();
    }
}