namespace AiLootGenerator.RestApi.Configuration
{
    /// <summary>
    /// Configuration settings for database seeding.
    /// </summary>
    public class DatabaseSeedingSettings
    {
        /// <summary>
        /// Whether database seeding is enabled.
        /// </summary>
        public bool EnableSeeding { get; set; } = true;

        /// <summary>
        /// Path to the directory containing JSON data files for seeding.
        /// </summary>
        public string DataDirectory { get; set; } = "data";

        /// <summary>
        /// Whether to stop the seeding process if an error occurs while processing a file.
        /// If false, the process will continue with the next file.
        /// </summary>
        public bool StopOnError { get; set; } = false;
    }
}