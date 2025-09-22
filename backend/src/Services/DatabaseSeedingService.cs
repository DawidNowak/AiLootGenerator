using AiLootGenerator.RestApi.Models;
using AiLootGenerator.RestApi.Configuration;
using Microsoft.Extensions.Options;
using System.Text.Json;

namespace AiLootGenerator.RestApi.Services
{
    /// <summary>
    /// Service responsible for seeding the Qdrant vector database with initial lore data.
    /// </summary>
    public interface IDatabaseSeedingService
    {
        /// <summary>
        /// Seeds the database with initial lore data if it's empty.
        /// </summary>
        /// <param name="cancellationToken">Cancellation token for the operation.</param>
        /// <returns>True if seeding was performed, false if skipped.</returns>
        Task<bool> SeedDatabaseIfEmptyAsync(CancellationToken cancellationToken = default);
    }

    /// <summary>
    /// Implementation of database seeding service for Warhammer Fantasy lore.
    /// </summary>
    public class DatabaseSeedingService : IDatabaseSeedingService
    {
        private readonly IQdrantService _qdrantService;
        private readonly ILogger<DatabaseSeedingService> _logger;
        private readonly DatabaseSeedingSettings _seedingSettings;

        public DatabaseSeedingService(
            IQdrantService qdrantService,
            ILogger<DatabaseSeedingService> logger,
            IOptions<DatabaseSeedingSettings> seedingSettings)
        {
            _qdrantService = qdrantService ?? throw new ArgumentNullException(nameof(qdrantService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _seedingSettings = seedingSettings?.Value ?? throw new ArgumentNullException(nameof(seedingSettings));
        }

        /// <inheritdoc/>
        public async Task<bool> SeedDatabaseIfEmptyAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                // Check cancellation token early
                cancellationToken.ThrowIfCancellationRequested();
                
                _logger.LogInformation("Checking if database seeding is required...");

                // Check if seeding is enabled
                if (!_seedingSettings.EnableSeeding)
                {
                    _logger.LogInformation("Database seeding is disabled in configuration");
                    return false;
                }

                // Check if collection exists and has data
                var needsSeeding = await CheckIfSeedingRequiredAsync(cancellationToken);
                
                if (!needsSeeding)
                {
                    _logger.LogInformation("Database already contains data, skipping seeding");
                    return false;
                }

                _logger.LogInformation("Database is empty, starting seeding process...");

                // Load and seed all JSON data files
                var totalItemsSeeded = await LoadAndSeedAllDataFilesAsync(cancellationToken);

                _logger.LogInformation("Database seeding completed successfully. Total items seeded: {TotalItems}", totalItemsSeeded);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during database seeding");
                throw;
            }
        }

        /// <summary>
        /// Checks if the database needs seeding by verifying collection existence and content.
        /// </summary>
        private async Task<bool> CheckIfSeedingRequiredAsync(CancellationToken cancellationToken)
        {
            try
            {
                // First check if Qdrant service is healthy
                var isHealthy = await _qdrantService.IsHealthyAsync(cancellationToken);
                if (!isHealthy)
                {
                    _logger.LogWarning("Qdrant service is not healthy, attempting to create collection");
                    await _qdrantService.EnsureCollectionExistsAsync(cancellationToken);
                }

                // Check if collection has any data
                var hasData = await _qdrantService.HasDataAsync(cancellationToken);
                
                if (!hasData)
                {
                    _logger.LogInformation("Collection exists but is empty");
                    return true;
                }

                _logger.LogInformation("Collection contains data");
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error checking collection status, assuming seeding is required");
                await _qdrantService.EnsureCollectionExistsAsync(cancellationToken);
                return true;
            }
        }

        /// <summary>
        /// Loads and seeds all JSON data files from the configured data directory.
        /// </summary>
        private async Task<int> LoadAndSeedAllDataFilesAsync(CancellationToken cancellationToken)
        {
            var dataDirectory = _seedingSettings.DataDirectory;
            
            // If path is relative, make it relative to the current directory
            if (!Path.IsPathRooted(dataDirectory))
            {
                dataDirectory = Path.Combine(Directory.GetCurrentDirectory(), dataDirectory);
            }
            
            if (!Directory.Exists(dataDirectory))
            {
                throw new DirectoryNotFoundException($"Data directory not found: {dataDirectory}");
            }

            _logger.LogInformation("Loading data files from directory: {DataDirectory}", dataDirectory);

            var jsonFiles = Directory.GetFiles(dataDirectory, "*.json");
            
            if (!jsonFiles.Any())
            {
                _logger.LogWarning("No JSON files found in data directory: {DataDirectory}", dataDirectory);
                return 0;
            }

            var totalItemsSeeded = 0;

            foreach (var jsonFile in jsonFiles)
            {
                try
                {
                    var fileName = Path.GetFileName(jsonFile);
                    _logger.LogInformation("Processing data file: {FileName}", fileName);

                    var loreItems = await LoadLoreItemsFromFileAsync(jsonFile, cancellationToken);
                    
                    if (!loreItems.Any())
                    {
                        _logger.LogWarning("No valid lore items found in file: {FileName}", fileName);
                        continue;
                    }

                    var itemsSeeded = await _qdrantService.AddLoreItemsBatchAsync(loreItems, cancellationToken);
                    totalItemsSeeded += itemsSeeded;

                    _logger.LogInformation("Successfully seeded {ItemsSeeded} items from {FileName}", itemsSeeded, fileName);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing file: {FileName}", Path.GetFileName(jsonFile));
                    
                    if (_seedingSettings.StopOnError)
                    {
                        throw;
                    }
                    
                    // Continue with other files if StopOnError is false
                    continue;
                }
            }

            return totalItemsSeeded;
        }

        /// <summary>
        /// Loads and deserializes lore items from a JSON file.
        /// </summary>
        private async Task<List<LoreItem>> LoadLoreItemsFromFileAsync(string filePath, CancellationToken cancellationToken)
        {
            try
            {
                var jsonContent = await File.ReadAllTextAsync(filePath, cancellationToken);
                
                if (string.IsNullOrWhiteSpace(jsonContent))
                {
                    _logger.LogWarning("File is empty or contains only whitespace: {FilePath}", filePath);
                    return new List<LoreItem>();
                }

                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true,
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                };

                var loreItems = JsonSerializer.Deserialize<List<LoreItem>>(jsonContent, options);
                
                if (loreItems == null)
                {
                    _logger.LogWarning("Failed to deserialize lore items from file: {FilePath}", filePath);
                    return new List<LoreItem>();
                }

                _logger.LogDebug("Loaded {ItemCount} items from {FileName}", 
                    loreItems.Count, Path.GetFileName(filePath));

                return loreItems;
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "JSON parsing error in file: {FilePath}", filePath);
                throw new InvalidOperationException($"Failed to parse JSON file {Path.GetFileName(filePath)}: {ex.Message}", ex);
            }
        }
    }
}