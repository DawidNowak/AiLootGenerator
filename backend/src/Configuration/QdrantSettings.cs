namespace AiLootGenerator.RestApi.Configuration
{
    /// <summary>
    /// Configuration settings for Qdrant vector database.
    /// </summary>
    public class QdrantSettings
    {
        /// <summary>
        /// The name of the Qdrant collection to use for storing lore items.
        /// </summary>
        public required string CollectionName { get; set; } = "warhammer_lore";

        /// <summary>
        /// Maximum number of search results to return from semantic search.
        /// </summary>
        public int MaxSearchResults { get; set; } = 5;

        /// <summary>
        /// Minimum similarity threshold for search results to be considered relevant.
        /// </summary>
        public float SimilarityThreshold { get; set; } = 0.7f;
    }
}