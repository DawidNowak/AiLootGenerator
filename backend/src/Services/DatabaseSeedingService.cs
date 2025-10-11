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
        /// Seeds the database with data from files that don't have 'DONE' in their name.
        /// Files are renamed with 'DONE_' prefix after successful seeding.
        /// </summary>
        /// <param name="cancellationToken">Cancellation token for the operation.</param>
        /// <returns>True if seeding was performed, false if skipped.</returns>
        Task<bool> SeedDatabaseIfNewDataAvailableAsync(CancellationToken cancellationToken = default);
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
        public async Task<bool> SeedDatabaseIfNewDataAvailableAsync(CancellationToken cancellationToken = default)
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

                // Ensure Qdrant service is healthy and collection exists
                await EnsureQdrantServiceReadyAsync(cancellationToken);

                // Find files that need to be processed (don't have 'DONE' in the name)
                var filesToProcess = GetFilesToProcess();
                
                if (!filesToProcess.Any())
                {
                    _logger.LogInformation("No new data files found for seeding (all files have 'DONE' in the name)");
                    return false;
                }

                _logger.LogInformation("Found {FileCount} new data files to process", filesToProcess.Count);

                // Load and seed all new data files
                var totalItemsSeeded = await ProcessNewDataFilesAsync(filesToProcess, cancellationToken);

                if (totalItemsSeeded > 0)
                {
                    _logger.LogInformation("Database seeding completed successfully. Total items seeded: {TotalItems}", totalItemsSeeded);
                    return true;
                }
                else
                {
                    _logger.LogInformation("No items were seeded from the available files");
                    return false;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during database seeding");
                throw;
            }
        }

        /// <summary>
        /// Ensures the Qdrant service is healthy and the collection exists.
        /// </summary>
        private async Task EnsureQdrantServiceReadyAsync(CancellationToken cancellationToken)
        {
            try
            {
                var isHealthy = await _qdrantService.IsHealthyAsync(cancellationToken);
                if (!isHealthy)
                {
                    _logger.LogWarning("Qdrant service is not healthy, attempting to create collection");
                }
                
                await _qdrantService.EnsureCollectionExistsAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error ensuring Qdrant service is ready");
                throw;
            }
        }

        /// <summary>
        /// Gets the list of JSON files that don't have 'DONE' in their name and need to be processed.
        /// </summary>
        private List<string> GetFilesToProcess()
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

            _logger.LogInformation("Scanning data directory for new files: {DataDirectory}", dataDirectory);

            var allJsonFiles = Directory.GetFiles(dataDirectory, "*.json");
            var filesToProcess = allJsonFiles
                .Where(file => !Path.GetFileName(file).Contains("DONE", StringComparison.OrdinalIgnoreCase))
                .ToList();

            _logger.LogDebug("Found {TotalFiles} JSON files, {FilesToProcess} need processing", 
                allJsonFiles.Length, filesToProcess.Count);

            return filesToProcess;
        }

        /// <summary>
        /// Processes all new data files and renames them after successful seeding.
        /// </summary>
        private async Task<int> ProcessNewDataFilesAsync(List<string> filesToProcess, CancellationToken cancellationToken)
        {
            var totalItemsSeeded = 0;

            foreach (var jsonFile in filesToProcess)
            {
                try
                {
                    var fileName = Path.GetFileName(jsonFile);
                    _logger.LogInformation("Processing data file: {FileName}", fileName);

                    var loreItems = await LoadLoreItemsFromFileAsync(jsonFile, cancellationToken);
                    
                    if (!loreItems.Any())
                    {
                        _logger.LogWarning("No valid lore items found in file: {FileName}", fileName);
                        
                        // Still rename the file even if it's empty to avoid processing it again
                        await RenameFileAsDoneAsync(jsonFile);
                        continue;
                    }

                    var itemsSeeded = await _qdrantService.AddLoreItemsBatchAsync(loreItems, cancellationToken);
                    totalItemsSeeded += itemsSeeded;

                    _logger.LogInformation("Successfully seeded {ItemsSeeded} items from {FileName}", itemsSeeded, fileName);

                    // Rename the file to mark it as processed
                    await RenameFileAsDoneAsync(jsonFile);
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
        /// Renames a file by adding 'DONE_' prefix to mark it as processed.
        /// </summary>
        private async Task RenameFileAsDoneAsync(string originalFilePath)
        {
            try
            {
                var directory = Path.GetDirectoryName(originalFilePath)!;
                var fileName = Path.GetFileName(originalFilePath);
                var newFileName = $"DONE_{fileName}";
                var newFilePath = Path.Combine(directory, newFileName);

                // Handle potential file conflicts
                int counter = 1;
                while (File.Exists(newFilePath))
                {
                    var nameWithoutExtension = Path.GetFileNameWithoutExtension(fileName);
                    var extension = Path.GetExtension(fileName);
                    newFileName = $"DONE_{nameWithoutExtension}_{counter}{extension}";
                    newFilePath = Path.Combine(directory, newFileName);
                    counter++;
                }

                File.Move(originalFilePath, newFilePath);
                
                _logger.LogInformation("Renamed processed file: {OriginalFileName} -> {NewFileName}", 
                    fileName, newFileName);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to rename file after processing: {FilePath}. " +
                    "The file was processed successfully but may be processed again on next startup.", 
                    originalFilePath);
                
                // Don't throw here as the seeding was successful, just the rename failed
            }
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