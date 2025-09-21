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
    
    return new QdrantClient(host, port, https);
});

// Register memory cache for cooldown management
builder.Services.AddMemoryCache();

// Register application services
builder.Services.AddScoped<IOpenAIService, OpenAIService>();
builder.Services.AddScoped<IQdrantService, QdrantService>();
builder.Services.AddScoped<ICooldownService, CooldownService>();

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
