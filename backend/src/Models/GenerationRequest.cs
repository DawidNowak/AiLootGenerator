using System.ComponentModel.DataAnnotations;

namespace AiLootGenerator.RestApi.Models
{
    /// <summary>
    /// Captures user input and context for loot generation session.
    /// </summary>
    public class GenerationRequest
    {
        /// <summary>
        /// User-provided location description.
        /// </summary>
        [Required]
        [StringLength(200, MinimumLength = 1, ErrorMessage = "Location must be between 1 and 200 characters")]
        public string Location { get; set; } = string.Empty;

        /// <summary>
        /// Selected wealth tier for generation.
        /// </summary>
        [Required]
        public WealthLevel WealthLevel { get; set; }

        /// <summary>
        /// Target language for generation (e.g., "en", "pl").
        /// </summary>
        [Required]
        [RegularExpression("^(en|pl)$", ErrorMessage = "Language must be 'en' or 'pl'")]
        public string Language { get; set; } = string.Empty;

        /// <summary>
        /// Session tracking for cooldowns.
        /// </summary>
        [Required]
        public Guid SessionId { get; set; }
    }
}