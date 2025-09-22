/**
 * Unit Tests for HTTP Client Configuration and Error Handling
 * Tests for Tasks: T024 (HTTP client config) + T025 (Error handling wrapper)
 * 
 * Comprehensive testing of HTTP client functionality including:
 * - Configuration management
 * - Request/response handling
 * - Error handling and classification
 * - Timeout and network error scenarios
 * - Utility functions and error messages
 */

import {
    HttpClient,
    createHttpClient,
    httpClient,
    DEFAULT_CONFIG,
    HttpClientError,
    TimeoutError,
    NetworkError,
    ApiError,
    CooldownError,
    HttpStatus,
    ErrorUtils
} from '../../src/services/httpClient';

import {
    ContentType,
    ErrorResponse,
    CooldownErrorResponse
} from '../../src/types/api';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock AbortController
const mockAbort = jest.fn();
global.AbortController = jest.fn(() => ({
    signal: { aborted: false },
    abort: mockAbort
})) as any;

// Mock setTimeout and clearTimeout
jest.useFakeTimers();

describe('HttpClient', () => {
    let client: HttpClient;

    beforeEach(() => {
        client = new HttpClient();
        mockFetch.mockClear();
        mockAbort.mockClear();
        jest.clearAllTimers();
    });

    describe('Configuration', () => {
        it('should use default configuration when no config provided', () => {
            const config = client.getConfig();

            expect(config.baseURL).toBe(DEFAULT_CONFIG.baseURL);
            expect(config.timeout).toBe(DEFAULT_CONFIG.timeout);
            expect(config.headers).toEqual(DEFAULT_CONFIG.headers);
        });

        it('should merge custom configuration with defaults', () => {
            const customConfig = {
                baseURL: 'https://api.example.com',
                timeout: 10000,
                headers: { 'Authorization': 'Bearer token' }
            };

            const customClient = new HttpClient(customConfig);
            const config = customClient.getConfig();

            expect(config.baseURL).toBe(customConfig.baseURL);
            expect(config.timeout).toBe(customConfig.timeout);
            expect(config.headers).toEqual({
                ...DEFAULT_CONFIG.headers,
                ...customConfig.headers
            });
        });

        it('should update configuration with updateConfig method', () => {
            const newConfig = {
                baseURL: 'https://updated.api.com',
                headers: { 'X-Custom': 'value' }
            };

            client.updateConfig(newConfig);
            const config = client.getConfig();

            expect(config.baseURL).toBe(newConfig.baseURL);
            expect(config.headers).toEqual({
                ...DEFAULT_CONFIG.headers,
                ...newConfig.headers
            });
        });
    });

    describe('URL Building', () => {
        it('should build correct URLs with base URL and endpoint', () => {
            const baseURL = 'https://api.example.com';
            const customClient = new HttpClient({ baseURL });

            mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                statusText: 'OK',
                headers: new Map([['content-type', 'application/json']]),
                json: async () => ({ data: 'test' }),
                text: async () => '{"data": "test"}'
            });

            customClient.get('/test/endpoint');

            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.example.com/test/endpoint',
                expect.any(Object)
            );
        });

        it('should handle trailing slashes correctly', () => {
            const baseURL = 'https://api.example.com/';
            const customClient = new HttpClient({ baseURL });

            mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                statusText: 'OK',
                headers: new Map([['content-type', 'application/json']]),
                json: async () => ({ data: 'test' }),
                text: async () => '{"data": "test"}'
            });

            customClient.get('/test');

            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.example.com/test',
                expect.any(Object)
            );
        });

        it('should handle endpoints without leading slash', () => {
            mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                statusText: 'OK',
                headers: new Map([['content-type', 'application/json']]),
                json: async () => ({ data: 'test' }),
                text: async () => '{"data": "test"}'
            });

            client.get('test');

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringMatching(/\/test$/),
                expect.any(Object)
            );
        });
    });

    describe('Request Methods', () => {
        const mockResponse = {
            ok: true,
            status: 200,
            statusText: 'OK',
            headers: new Map([['content-type', 'application/json']]),
            json: async () => ({ success: true }),
            text: async () => '{"success": true}'
        };

        beforeEach(() => {
            mockFetch.mockResolvedValue(mockResponse);
        });

        it('should make GET requests correctly', async () => {
            const response = await client.get('/test');

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/test'),
                expect.objectContaining({
                    method: 'GET',
                    headers: expect.objectContaining({
                        'Content-Type': ContentType.JSON,
                        'Accept': ContentType.JSON
                    })
                })
            );

            expect(response.data).toEqual({ success: true });
            expect(response.status).toBe(200);
        });

        it('should make POST requests with data correctly', async () => {
            const postData = { name: 'test', value: 123 };

            await client.post('/test', postData);

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/test'),
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        'Content-Type': ContentType.JSON
                    }),
                    body: JSON.stringify(postData)
                })
            );
        });

        it('should handle custom headers in requests', async () => {
            const customHeaders = { 'Authorization': 'Bearer token' };

            await client.get('/test', { headers: customHeaders });

            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        ...DEFAULT_CONFIG.headers,
                        ...customHeaders
                    })
                })
            );
        });

        it('should handle non-JSON responses', async () => {
            const textResponse = {
                ok: true,
                status: 200,
                statusText: 'OK',
                headers: new Map([['content-type', 'text/plain']]),
                text: async () => 'Plain text response'
            };

            mockFetch.mockResolvedValue(textResponse);

            const response = await client.get('/test');
            expect(response.data).toBe('Plain text response');
        });
    });

    describe('Error Handling', () => {
        it('should throw TimeoutError on request timeout', async () => {
            mockFetch.mockImplementation(() => {
                return new Promise((_, reject) => {
                    setTimeout(() => {
                        const error = new Error('AbortError');
                        error.name = 'AbortError';
                        reject(error);
                    }, 100);
                });
            });

            const request = client.get('/test', { timeout: 50 });

            // Fast-forward time to trigger timeout
            jest.advanceTimersByTime(100);

            await expect(request).rejects.toThrow(TimeoutError);
            await expect(request).rejects.toThrow('Request timeout after 50ms');
        });

        it('should throw NetworkError on fetch failure', async () => {
            mockFetch.mockRejectedValue(new Error('Network error'));

            await expect(client.get('/test')).rejects.toThrow(NetworkError);
            await expect(client.get('/test')).rejects.toThrow('Network error');
        });

        it('should throw CooldownError for 429 responses with cooldown data', async () => {
            const cooldownResponse: CooldownErrorResponse = {
                error: 'TooManyRequests',
                message: 'Cooldown period active',
                details: {},
                remainingSeconds: 120,
                retryAfter: '2024-01-01T10:02:00Z'
            };

            mockFetch.mockResolvedValue({
                ok: false,
                status: 429,
                statusText: 'Too Many Requests',
                headers: new Map([['content-type', 'application/json']]),
                json: async () => cooldownResponse,
                text: async () => JSON.stringify(cooldownResponse)
            });

            await expect(client.get('/test')).rejects.toThrow(CooldownError);

            try {
                await client.get('/test');
            } catch (error) {
                expect(error).toBeInstanceOf(CooldownError);
                const cooldownError = error as CooldownError;
                expect(cooldownError.remainingSeconds).toBe(120);
                expect(cooldownError.retryAfter).toBe('2024-01-01T10:02:00Z');
            }
        });

        it('should throw ApiError for API error responses', async () => {
            const errorResponse: ErrorResponse = {
                error: 'ValidationError',
                message: 'Invalid input provided',
                details: { field: 'location' }
            };

            mockFetch.mockResolvedValue({
                ok: false,
                status: 400,
                statusText: 'Bad Request',
                headers: new Map([['content-type', 'application/json']]),
                json: async () => errorResponse,
                text: async () => JSON.stringify(errorResponse)
            });

            await expect(client.get('/test')).rejects.toThrow(ApiError);

            try {
                await client.get('/test');
            } catch (error) {
                expect(error).toBeInstanceOf(ApiError);
                const apiError = error as ApiError;
                expect(apiError.errorCode).toBe('ValidationError');
                expect(apiError.details).toEqual({ field: 'location' });
            }
        });

        it('should throw HttpClientError for non-API error responses', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
                headers: new Map([['content-type', 'text/plain']]),
                text: async () => 'Server error occurred'
            });

            await expect(client.get('/test')).rejects.toThrow(HttpClientError);

            try {
                await client.get('/test');
            } catch (error) {
                expect(error).toBeInstanceOf(HttpClientError);
                const httpError = error as HttpClientError;
                expect(httpError.status).toBe(500);
                expect(httpError.statusText).toBe('Internal Server Error');
            }
        });
    });

    describe('Factory Functions', () => {
        it('should create HTTP client with custom config using factory', () => {
            const config = {
                baseURL: 'https://custom.api.com',
                timeout: 5000
            };

            const customClient = createHttpClient(config);
            const clientConfig = customClient.getConfig();

            expect(clientConfig.baseURL).toBe(config.baseURL);
            expect(clientConfig.timeout).toBe(config.timeout);
        });

        it('should provide default HTTP client instance', () => {
            expect(httpClient).toBeInstanceOf(HttpClient);

            const config = httpClient.getConfig();
            expect(config.baseURL).toBe(DEFAULT_CONFIG.baseURL);
        });
    });
});

describe('HttpStatus Utilities', () => {
    describe('isSuccess', () => {
        it('should identify success status codes correctly', () => {
            expect(HttpStatus.isSuccess(200)).toBe(true);
            expect(HttpStatus.isSuccess(201)).toBe(true);
            expect(HttpStatus.isSuccess(299)).toBe(true);
            expect(HttpStatus.isSuccess(199)).toBe(false);
            expect(HttpStatus.isSuccess(300)).toBe(false);
            expect(HttpStatus.isSuccess(400)).toBe(false);
        });
    });

    describe('isClientError', () => {
        it('should identify client error status codes correctly', () => {
            expect(HttpStatus.isClientError(400)).toBe(true);
            expect(HttpStatus.isClientError(404)).toBe(true);
            expect(HttpStatus.isClientError(429)).toBe(true);
            expect(HttpStatus.isClientError(499)).toBe(true);
            expect(HttpStatus.isClientError(399)).toBe(false);
            expect(HttpStatus.isClientError(500)).toBe(false);
        });
    });

    describe('isServerError', () => {
        it('should identify server error status codes correctly', () => {
            expect(HttpStatus.isServerError(500)).toBe(true);
            expect(HttpStatus.isServerError(502)).toBe(true);
            expect(HttpStatus.isServerError(599)).toBe(true);
            expect(HttpStatus.isServerError(499)).toBe(false);
            expect(HttpStatus.isServerError(600)).toBe(false);
        });
    });

    describe('isError', () => {
        it('should identify any error status codes correctly', () => {
            expect(HttpStatus.isError(400)).toBe(true);
            expect(HttpStatus.isError(500)).toBe(true);
            expect(HttpStatus.isError(200)).toBe(false);
            expect(HttpStatus.isError(300)).toBe(false);
        });
    });
});

describe('ErrorUtils', () => {
    describe('getErrorMessage', () => {
        it('should return user-friendly message for CooldownError', () => {
            const cooldownError = new CooldownError(
                {
                    error: 'TooManyRequests',
                    message: 'Cooldown active',
                    details: {},
                    remainingSeconds: 130,
                    retryAfter: '2024-01-01T10:02:00Z'
                },
                429,
                'Too Many Requests'
            );

            const message = ErrorUtils.getErrorMessage(cooldownError);
            expect(message).toBe('Please wait 3 minutes before generating more loot.');
        });

        it('should return user-friendly message for NetworkError', () => {
            const networkError = new NetworkError('Connection failed');
            const message = ErrorUtils.getErrorMessage(networkError);
            expect(message).toBe('Unable to connect to the server. Please check your internet connection.');
        });

        it('should return user-friendly message for TimeoutError', () => {
            const timeoutError = new TimeoutError(5000);
            const message = ErrorUtils.getErrorMessage(timeoutError);
            expect(message).toBe('Request timed out. Please try again.');
        });

        it('should return API error message for ApiError', () => {
            const apiError = new ApiError(
                {
                    error: 'ValidationError',
                    message: 'Location is required',
                    details: {}
                },
                400,
                'Bad Request'
            );

            const message = ErrorUtils.getErrorMessage(apiError);
            expect(message).toBe('Location is required');
        });

        it('should return generic message for unknown errors', () => {
            const message = ErrorUtils.getErrorMessage('Unknown error type');
            expect(message).toBe('An unexpected error occurred.');
        });
    });

    describe('isRetryable', () => {
        it('should identify retryable errors correctly', () => {
            expect(ErrorUtils.isRetryable(new NetworkError('Connection failed'))).toBe(true);
            expect(ErrorUtils.isRetryable(new TimeoutError(5000))).toBe(true);

            const serverError = new HttpClientError('Server error', 500, 'Internal Server Error');
            expect(ErrorUtils.isRetryable(serverError)).toBe(true);
        });

        it('should identify non-retryable errors correctly', () => {
            const cooldownError = new CooldownError(
                {
                    error: 'TooManyRequests',
                    message: 'Cooldown active',
                    details: {},
                    remainingSeconds: 60,
                    retryAfter: '2024-01-01T10:01:00Z'
                },
                429,
                'Too Many Requests'
            );

            const apiError = new ApiError(
                {
                    error: 'ValidationError',
                    message: 'Invalid input',
                    details: {}
                },
                400,
                'Bad Request'
            );

            const clientError = new HttpClientError('Not found', 404, 'Not Found');

            expect(ErrorUtils.isRetryable(cooldownError)).toBe(false);
            expect(ErrorUtils.isRetryable(apiError)).toBe(false);
            expect(ErrorUtils.isRetryable(clientError)).toBe(false);
        });
    });

    describe('getRetryDelay', () => {
        it('should return null for non-retryable errors', () => {
            const apiError = new ApiError(
                {
                    error: 'ValidationError',
                    message: 'Invalid input',
                    details: {}
                },
                400,
                'Bad Request'
            );

            expect(ErrorUtils.getRetryDelay(apiError, 1)).toBeNull();
        });

        it('should return exponential backoff delays for retryable errors', () => {
            const networkError = new NetworkError('Connection failed');

            const delay1 = ErrorUtils.getRetryDelay(networkError, 1);
            const delay2 = ErrorUtils.getRetryDelay(networkError, 2);
            const delay3 = ErrorUtils.getRetryDelay(networkError, 3);

            expect(delay1).toBeGreaterThan(1000);
            expect(delay1).toBeLessThan(1500); // 1s + jitter
            expect(delay2).toBeGreaterThan(2000);
            expect(delay2).toBeLessThan(2500); // 2s + jitter
            expect(delay3).toBeGreaterThan(4000);
            expect(delay3).toBeLessThan(4500); // 4s + jitter
        });

        it('should cap retry delay at maximum value', () => {
            const networkError = new NetworkError('Connection failed');
            const delay = ErrorUtils.getRetryDelay(networkError, 10); // Very high attempt number

            expect(delay).toBeLessThanOrEqual(33000); // 30s + max jitter
        });
    });
});

describe('Error Class Hierarchy', () => {
    it('should maintain proper inheritance chain', () => {
        const httpError = new HttpClientError('HTTP error', 500, 'Internal Server Error');
        const timeoutError = new TimeoutError(5000);
        const networkError = new NetworkError('Network error');
        const apiError = new ApiError(
            { error: 'TestError', message: 'Test message', details: {} },
            400,
            'Bad Request'
        );

        expect(httpError).toBeInstanceOf(Error);
        expect(httpError).toBeInstanceOf(HttpClientError);

        expect(timeoutError).toBeInstanceOf(Error);
        expect(timeoutError).toBeInstanceOf(TimeoutError);

        expect(networkError).toBeInstanceOf(Error);
        expect(networkError).toBeInstanceOf(NetworkError);

        expect(apiError).toBeInstanceOf(Error);
        expect(apiError).toBeInstanceOf(HttpClientError);
        expect(apiError).toBeInstanceOf(ApiError);
    });

    it('should set error properties correctly', () => {
        const httpError = new HttpClientError('Test error', 404, 'Not Found', { extra: 'data' });

        expect(httpError.name).toBe('HttpClientError');
        expect(httpError.message).toBe('Test error');
        expect(httpError.status).toBe(404);
        expect(httpError.statusText).toBe('Not Found');
        expect(httpError.response).toEqual({ extra: 'data' });
    });
});