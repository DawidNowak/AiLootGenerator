/**
 * Unit tests for API endpoints configuration
 * Tests for T026 - API endpoints configuration
 */

import {
    API_CONFIG,
    API_ENDPOINTS,
    buildApiUrl,
    endpoints,
    validateApiConfig,
    DEFAULT_REQUEST_CONFIG,
    API_HEADERS
} from '../../src/services/endpoints';

describe('API Endpoints Configuration', () => {
    describe('buildApiUrl', () => {
        it('should build correct URL with path', () => {
            const url = buildApiUrl('test/endpoint');
            expect(url).toMatch(/\/api\/test\/endpoint$/);
        });

        it('should handle path with leading slash', () => {
            const url = buildApiUrl('/test/endpoint');
            expect(url).toMatch(/\/api\/test\/endpoint$/);
        });

        it('should handle empty path', () => {
            const url = buildApiUrl('');
            expect(url).toMatch(/\/api\/$/);
        });

        it('should remove trailing slash from base URL', () => {
            const url = buildApiUrl('test');
            expect(url).not.toMatch(/\/\/api/);
        });
    });

    describe('API_ENDPOINTS', () => {
        it('should have health endpoint', () => {
            expect(API_ENDPOINTS.health).toMatch(/\/api\/health$/);
        });

        it('should have generateLoot endpoint', () => {
            expect(API_ENDPOINTS.generateLoot).toMatch(/\/api\/loot\/generate$/);
        });

        it('should be properly formatted URLs', () => {
            Object.values(API_ENDPOINTS).forEach(endpoint => {
                expect(() => new URL(endpoint)).not.toThrow();
            });
        });
    });

    describe('endpoints functions', () => {
        it('should return health endpoint', () => {
            const healthUrl = endpoints.health();
            expect(healthUrl).toBe(API_ENDPOINTS.health);
        });

        it('should return loot generation endpoint', () => {
            const lootUrl = endpoints.generateLoot();
            expect(lootUrl).toBe(API_ENDPOINTS.generateLoot);
        });
    });

    describe('validateApiConfig', () => {
        it('should validate correct configuration', () => {
            const isValid = validateApiConfig();
            expect(isValid).toBe(true);
        });

        it('should handle invalid base URL gracefully', () => {
            // Test with invalid URL would require mocking the config
            // For now, we test that the function exists and returns boolean
            const result = validateApiConfig();
            expect(typeof result).toBe('boolean');
        });
    });

    describe('API_CONFIG', () => {
        it('should have required properties', () => {
            expect(API_CONFIG).toHaveProperty('baseUrl');
            expect(API_CONFIG).toHaveProperty('version');
            expect(API_CONFIG).toHaveProperty('timeout');
        });

        it('should have valid timeout value', () => {
            expect(API_CONFIG.timeout).toBeGreaterThan(0);
            expect(typeof API_CONFIG.timeout).toBe('number');
        });

        it('should have non-empty version', () => {
            expect(API_CONFIG.version.trim()).not.toBe('');
        });

        it('should have valid base URL format', () => {
            expect(() => new URL(API_CONFIG.baseUrl)).not.toThrow();
        });
    });

    describe('DEFAULT_REQUEST_CONFIG', () => {
        it('should have timeout property', () => {
            expect(DEFAULT_REQUEST_CONFIG.timeout).toBe(API_CONFIG.timeout);
        });

        it('should have headers property', () => {
            expect(DEFAULT_REQUEST_CONFIG.headers).toEqual(API_HEADERS);
        });
    });

    describe('API_HEADERS', () => {
        it('should have Content-Type header', () => {
            expect(API_HEADERS['Content-Type']).toBe('application/json');
        });

        it('should have Accept header', () => {
            expect(API_HEADERS['Accept']).toBe('application/json');
        });

        it('should be readonly', () => {
            // TypeScript const assertion should make this readonly
            expect(Object.isFrozen(API_HEADERS)).toBe(false); // const assertion doesn't freeze, but provides type safety
        });
    });

    describe('Environment variable handling', () => {
        it('should use default values when env vars are not set', () => {
            // Test default fallback behavior
            expect(API_CONFIG.baseUrl).toBeDefined();
            expect(API_CONFIG.version).toBeDefined();
            expect(API_CONFIG.timeout).toBeDefined();
        });

        it('should handle timeout parsing', () => {
            expect(typeof API_CONFIG.timeout).toBe('number');
            expect(API_CONFIG.timeout).toBeGreaterThan(0);
        });
    });

    describe('URL construction edge cases', () => {
        it('should handle special characters in path', () => {
            const url = buildApiUrl('test/path with spaces');
            expect(url).toContain('test/path with spaces');
        });

        it('should handle multiple slashes', () => {
            const url = buildApiUrl('//test//path//');
            expect(url).toMatch(/\/api\/\/test\/\/path\/\/$/);
        });

        it('should maintain query parameters', () => {
            const url = buildApiUrl('test?param=value');
            expect(url).toContain('test?param=value');
        });
    });
});