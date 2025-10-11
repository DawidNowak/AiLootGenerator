using AiLootGenerator.RestApi.Configuration;
using AiLootGenerator.RestApi.Services;
using Microsoft.Extensions.Options;
using OpenAI.Chat;
using OpenAI.Embeddings;
using Qdrant.Client;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// Configure settings
builder.Services.Configure<QdrantSettings>(
    builder.Configuration.GetSection("Qdrant"));

builder.Services.Configure<DatabaseSeedingSettings>(
    builder.Configuration.GetSection("DatabaseSeeding"));

// Register OpenAI clients
builder.Services.AddSingleton<ChatClient>(serviceProvider =>
{
    var configuration = serviceProvider.GetRequiredService<IConfiguration>();
    var apiKey = configuration["OpenAI:ApiKey"] ?? throw new InvalidOperationException("OpenAI:ApiKey not configured");
    var model = configuration["OpenAI:ChatModel"] ?? "gpt-4o-mini";
    return new ChatClient(model, apiKey);
});

builder.Services.AddSingleton<EmbeddingClient>(serviceProvider =>
{
    var configuration = serviceProvider.GetRequiredService<IConfiguration>();
    var apiKey = configuration["OpenAI:ApiKey"] ?? throw new InvalidOperationException("OpenAI:ApiKey not configured");
    var model = configuration["OpenAI:EmbeddingModel"] ?? "text-embedding-3-small";
    return new EmbeddingClient(model, apiKey);
});

// Register Qdrant client
builder.Services.AddSingleton<QdrantClient>(serviceProvider =>
{
    var configuration = serviceProvider.GetRequiredService<IConfiguration>();
    var host = configuration["Qdrant:Host"] ?? "localhost";
    var port = int.Parse(configuration["Qdrant:Port"] ?? "6334");
    var https = bool.Parse(configuration["Qdrant:UseHttps"] ?? "false");
    var apiKey = configuration["Qdrant:ApiKey"];

    return new QdrantClient(host, port, https, apiKey);
});

// Register memory cache for cooldown management
builder.Services.AddMemoryCache();

// Configure CORS for frontend-backend communication
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "https://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Register application services
builder.Services.AddSingleton<ICooldownService, CooldownService>();
builder.Services.AddScoped<IOpenAIService, OpenAIService>();
builder.Services.AddScoped<IQdrantService, QdrantService>();
builder.Services.AddScoped<ILootGenerationService, LootGenerationService>();
builder.Services.AddScoped<IDatabaseSeedingService, DatabaseSeedingService>();

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

// Enable CORS
app.UseCors("AllowFrontend");

app.UseAuthorization();

app.MapControllers();

// Seed the database on startup
using (var scope = app.Services.CreateScope())
{
    var seedingService = scope.ServiceProvider.GetRequiredService<IDatabaseSeedingService>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    
    try
    {
        logger.LogInformation("Starting database seeding process...");
        var wasSeeded = await seedingService.SeedDatabaseIfNewDataAvailableAsync();
        
        if (wasSeeded)
        {
            logger.LogInformation("Database seeding completed successfully");
        }
        else
        {
            logger.LogInformation("Database seeding skipped - no new data files found or seeding disabled");
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Database seeding failed - application will continue but may have limited functionality");
        // Continue running the application even if seeding fails
    }
}

app.Run();
