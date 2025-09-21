# Configuration Guide

## Required Configuration

Before running the application, you need to configure the following settings:

### OpenAI Configuration

Add your OpenAI API key to the configuration:

**appsettings.Development.json:**

```json
{
  "OpenAI": {
    "ApiKey": "your-openai-api-key-here",
    "ChatModel": "gpt-4",
    "EmbeddingModel": "text-embedding-3-small"
  }
}
```

**Environment Variable (Alternative):**

```bash
export OpenAI__ApiKey="your-openai-api-key-here"
```

### Qdrant Configuration

The application expects a Qdrant vector database to be running. Default configuration:

```json
{
  "Qdrant": {
    "Host": "localhost",
    "Port": "6334",
    "UseHttps": "false",
    "CollectionName": "warhammer_lore",
    "MaxSearchResults": 5,
    "SimilarityThreshold": 0.7
  }
}
```

## Running Qdrant Locally

```bash
# Using Docker
docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant
```

## Service Registration

The following services are automatically registered in the DI container:

- `IOpenAIService` -> `OpenAIService`
- `IQdrantService` -> `QdrantService`
- `ChatClient` (OpenAI)
- `EmbeddingClient` (OpenAI)
- `QdrantClient`
- `QdrantSettings` (IOptions pattern)

## Security Notes

- Never commit API keys to source control
- Use User Secrets for development: `dotnet user-secrets set "OpenAI:ApiKey" "your-key"`
- Use Azure Key Vault or similar for production
