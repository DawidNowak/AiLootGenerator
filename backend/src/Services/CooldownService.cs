using Microsoft.Extensions.Caching.Memory;

namespace AiLootGenerator.RestApi.Services
{
    /// <summary>
    /// Exception thrown when a user attempts to generate loot while still on cooldown.
    /// </summary>
    public class CooldownActiveException : Exception
    {
        /// <summary>
        /// Gets the remaining seconds until the cooldown expires.
        /// </summary>
        public int RemainingSeconds { get; }

        /// <summary>
        /// Gets the time when the user can retry the request.
        /// </summary>
        public DateTime RetryAfter { get; }

        /// <summary>
        /// Initializes a new instance of the CooldownActiveException class.
        /// </summary>
        /// <param name="remainingSeconds">The remaining seconds until the cooldown expires.</param>
        public CooldownActiveException(int remainingSeconds) 
            : base($"Cooldown active. Please wait {remainingSeconds} seconds before generating loot again.")
        {
            RemainingSeconds = remainingSeconds;
            RetryAfter = DateTime.UtcNow.AddSeconds(remainingSeconds);
        }
    }

    /// <summary>
    /// Service for managing session-based cooldown timers for loot generation.
    /// Uses in-memory caching to track generation timestamps per session.
    /// </summary>
    public interface ICooldownService
    {
        /// <summary>
        /// Validates that the session is not on cooldown and throws an exception if it is.
        /// </summary>
        /// <param name="sessionId">The session ID to validate.</param>
        /// <exception cref="CooldownActiveException">Thrown when the session is on cooldown.</exception>
        void ValidateSessionNotOnCooldown(Guid sessionId);

        /// <summary>
        /// Records a generation timestamp for the specified session, starting the cooldown period.
        /// </summary>
        /// <param name="sessionId">The session ID to record the generation for.</param>
        void RecordGeneration(Guid sessionId);
    }

    /// <summary>
    /// Implementation of cooldown service for Warhammer Fantasy loot generation.
    /// Manages 30-second cooldown periods between generation requests.
    /// </summary>
    public class CooldownService : ICooldownService
    {
        private readonly IMemoryCache _memoryCache;
        private readonly ILogger<CooldownService> _logger;

        /// <summary>
        /// The cooldown duration in seconds.
        /// </summary>
        public const int CooldownDurationSeconds = 30;

        /// <summary>
        /// The cache expiration time for cooldown entries (1 hour sliding expiration).
        /// </summary>
        private static readonly TimeSpan CacheExpiration = TimeSpan.FromHours(1);

        /// <summary>
        /// Initializes a new instance of the CooldownService class.
        /// </summary>
        /// <param name="memoryCache">The memory cache for storing cooldown timestamps.</param>
        /// <param name="logger">The logger for diagnostic information.</param>
        /// <exception cref="ArgumentNullException">Thrown when memoryCache or logger is null.</exception>
        public CooldownService(IMemoryCache memoryCache, ILogger<CooldownService> logger)
        {
            _memoryCache = memoryCache ?? throw new ArgumentNullException(nameof(memoryCache));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <inheritdoc/>
        public void ValidateSessionNotOnCooldown(Guid sessionId)
        {
            if (sessionId == Guid.Empty)
                throw new ArgumentException("Session ID cannot be empty.", nameof(sessionId));

            var cacheKey = GetCacheKey(sessionId);
            var lastGeneration = _memoryCache.Get<DateTime?>(cacheKey);

            if (!lastGeneration.HasValue)
                return; // No previous generation, not on cooldown

            var timeSinceLastGeneration = DateTime.UtcNow - lastGeneration.Value;
            var cooldownDuration = TimeSpan.FromSeconds(CooldownDurationSeconds);

            if (timeSinceLastGeneration >= cooldownDuration)
                return; // Cooldown has expired

            // Still on cooldown, calculate remaining time and throw exception
            var remainingCooldown = cooldownDuration - timeSinceLastGeneration;
            var remainingSeconds = (int)Math.Ceiling(remainingCooldown.TotalSeconds);
            
            _logger.LogInformation("Session {SessionId} attempted generation during cooldown. {RemainingSeconds} seconds remaining.", 
                sessionId, remainingSeconds);
            throw new CooldownActiveException(remainingSeconds);
        }

        /// <inheritdoc/>
        public void RecordGeneration(Guid sessionId)
        {
            if (sessionId == Guid.Empty)
                throw new ArgumentException("Session ID cannot be empty.", nameof(sessionId));

            var cacheKey = GetCacheKey(sessionId);
            var currentTime = DateTime.UtcNow;

            var cacheOptions = new MemoryCacheEntryOptions
            {
                SlidingExpiration = CacheExpiration
            };

            _memoryCache.Set(cacheKey, currentTime, cacheOptions);

            _logger.LogInformation("Recorded generation for session {SessionId} at {Timestamp}.", 
                sessionId, currentTime);
        }

        /// <summary>
        /// Generates the cache key for the specified session ID.
        /// </summary>
        /// <param name="sessionId">The session ID.</param>
        /// <returns>The cache key for storing cooldown information.</returns>
        private static string GetCacheKey(Guid sessionId)
        {
            return $"cooldown:{sessionId}";
        }
    }
}