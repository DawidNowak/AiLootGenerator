using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using AiLootGenerator.RestApi.Services;

namespace AiLootGenerator.RestApi.Tests.Unit
{
    /// <summary>
    /// Unit tests for CooldownService covering session management and cooldown logic.
    /// </summary>
    public class CooldownServiceTests : IDisposable
    {
        private readonly IMemoryCache _memoryCache;
        private readonly ILogger<CooldownService> _logger;
        private readonly CooldownService _cooldownService;

        public CooldownServiceTests()
        {
            _memoryCache = new MemoryCache(new MemoryCacheOptions());
            _logger = new LoggerFactory().CreateLogger<CooldownService>();
            _cooldownService = new CooldownService(_memoryCache, _logger);
        }

        public void Dispose()
        {
            _memoryCache.Dispose();
        }

        #region Constructor Tests

        [Fact]
        public void Constructor_WithNullMemoryCache_ThrowsArgumentNullException()
        {
            // Arrange
            var logger = new LoggerFactory().CreateLogger<CooldownService>();

            // Act & Assert
            Assert.Throws<ArgumentNullException>(() => new CooldownService(null!, logger));
        }

        [Fact]
        public void Constructor_WithNullLogger_ThrowsArgumentNullException()
        {
            // Arrange
            var memoryCache = new MemoryCache(new MemoryCacheOptions());

            // Act & Assert
            Assert.Throws<ArgumentNullException>(() => new CooldownService(memoryCache, null!));
        }

        [Fact]
        public void Constructor_WithValidParameters_CreatesInstance()
        {
            // Arrange
            var memoryCache = new MemoryCache(new MemoryCacheOptions());
            var logger = new LoggerFactory().CreateLogger<CooldownService>();

            // Act
            var service = new CooldownService(memoryCache, logger);

            // Assert
            Assert.NotNull(service);
        }

        #endregion

        #region ValidateSessionNotOnCooldown Tests

        [Fact]
        public void ValidateSessionNotOnCooldown_WithEmptyGuid_ThrowsArgumentException()
        {
            // Act & Assert
            var exception = Assert.Throws<ArgumentException>(() => _cooldownService.ValidateSessionNotOnCooldown(Guid.Empty));
            Assert.Contains("Session ID cannot be empty", exception.Message);
            Assert.Equal("sessionId", exception.ParamName);
        }

        [Fact]
        public void ValidateSessionNotOnCooldown_WithNewSession_DoesNotThrow()
        {
            // Arrange
            var sessionId = Guid.NewGuid();

            // Act & Assert
            _cooldownService.ValidateSessionNotOnCooldown(sessionId); // Should not throw
        }

        [Fact]
        public void ValidateSessionNotOnCooldown_WithActiveCooldown_ThrowsCooldownActiveException()
        {
            // Arrange
            var sessionId = Guid.NewGuid();
            _cooldownService.RecordGeneration(sessionId);

            // Act & Assert
            var exception = Assert.Throws<CooldownActiveException>(() => _cooldownService.ValidateSessionNotOnCooldown(sessionId));
            Assert.True(exception.RemainingSeconds > 0);
            Assert.True(exception.RemainingSeconds <= CooldownService.CooldownDurationSeconds);
            Assert.Contains("Cooldown active", exception.Message);
        }

        [Fact]
        public void ValidateSessionNotOnCooldown_WithExpiredCooldown_DoesNotThrow()
        {
            // Arrange
            var sessionId = Guid.NewGuid();
            var cacheKey = $"cooldown:{sessionId}";
            var pastTime = DateTime.UtcNow.AddSeconds(-CooldownService.CooldownDurationSeconds - 1);
            
            _memoryCache.Set(cacheKey, pastTime, TimeSpan.FromHours(1));

            // Act & Assert
            _cooldownService.ValidateSessionNotOnCooldown(sessionId); // Should not throw
        }

        #endregion

        #region RecordGeneration Tests

        [Fact]
        public void RecordGeneration_WithEmptyGuid_ThrowsArgumentException()
        {
            // Act & Assert
            var exception = Assert.Throws<ArgumentException>(() => _cooldownService.RecordGeneration(Guid.Empty));
            Assert.Contains("Session ID cannot be empty", exception.Message);
            Assert.Equal("sessionId", exception.ParamName);
        }

        [Fact]
        public void RecordGeneration_WithValidSessionId_RecordsTimestamp()
        {
            // Arrange
            var sessionId = Guid.NewGuid();

            // Act
            _cooldownService.RecordGeneration(sessionId);

            // Assert - Should be on cooldown now
            var exception = Assert.Throws<CooldownActiveException>(() => _cooldownService.ValidateSessionNotOnCooldown(sessionId));
            Assert.True(exception.RemainingSeconds > 0);
            Assert.True(exception.RemainingSeconds <= CooldownService.CooldownDurationSeconds);
        }

        [Fact]
        public void RecordGeneration_CalledTwice_UpdatesTimestamp()
        {
            // Arrange
            var sessionId = Guid.NewGuid();
            
            // Act - Record first generation
            _cooldownService.RecordGeneration(sessionId);
            
            // Wait longer to ensure significant timestamp difference
            Thread.Sleep(1000); // 1 second
            
            // Should still be on cooldown from first generation
            var exception1 = Assert.Throws<CooldownActiveException>(() => _cooldownService.ValidateSessionNotOnCooldown(sessionId));
            var firstRemainingSeconds = exception1.RemainingSeconds;
            
            // Record again to reset the timestamp
            _cooldownService.RecordGeneration(sessionId);
            
            // Should still be on cooldown but with more time remaining
            var exception2 = Assert.Throws<CooldownActiveException>(() => _cooldownService.ValidateSessionNotOnCooldown(sessionId));
            var secondRemainingSeconds = exception2.RemainingSeconds;

            // Assert - The second remaining time should be greater (closer to full duration)
            // First should be around 29 seconds, second should be around 30 seconds
            Assert.True(secondRemainingSeconds >= firstRemainingSeconds, 
                $"Second remaining seconds ({secondRemainingSeconds}) should be greater than or equal to first ({firstRemainingSeconds})");
            Assert.True(firstRemainingSeconds < CooldownService.CooldownDurationSeconds,
                $"First remaining seconds ({firstRemainingSeconds}) should be less than full duration ({CooldownService.CooldownDurationSeconds})");
        }

        #endregion

        #region CooldownActiveException Tests

        [Fact]
        public void CooldownActiveException_WithRemainingSeconds_SetsPropertiesCorrectly()
        {
            // Arrange
            var remainingSeconds = 15;

            // Act
            var exception = new CooldownActiveException(remainingSeconds);

            // Assert
            Assert.Equal(remainingSeconds, exception.RemainingSeconds);
            Assert.Contains(remainingSeconds.ToString(), exception.Message);
            Assert.Contains("Cooldown active", exception.Message);
        }

        [Fact]
        public void CooldownActiveException_MessageContainsRemainingTime()
        {
            // Arrange
            var remainingSeconds = 25;

            // Act
            var exception = new CooldownActiveException(remainingSeconds);

            // Assert
            Assert.Contains("25 seconds", exception.Message);
        }

        #endregion

        #region Integration Tests

        [Fact]
        public void FullCooldownWorkflow_RecordValidateWaitValidate_WorksCorrectly()
        {
            // Arrange
            var sessionId = Guid.NewGuid();

            // Act 1: Record generation
            _cooldownService.RecordGeneration(sessionId);

            // Assert 1: Should be on cooldown
            Assert.Throws<CooldownActiveException>(() => _cooldownService.ValidateSessionNotOnCooldown(sessionId));

            // Act 2: Simulate time passage by clearing cache manually (since ClearCooldown was removed)
            var cacheKey = $"cooldown:{sessionId}";
            _memoryCache.Remove(cacheKey);

            // Assert 2: Should not be on cooldown
            _cooldownService.ValidateSessionNotOnCooldown(sessionId); // Should not throw
        }

        [Fact]
        public void CooldownService_Constants_HaveExpectedValues()
        {
            // Assert
            Assert.Equal(30, CooldownService.CooldownDurationSeconds);
        }

        #endregion
    }
}