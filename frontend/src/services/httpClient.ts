/**
 * HTTP Client Configuration for Warhammer Fantasy Loot Generator
 * Task: T024 - HTTP client configuration
 * Task: T025 - Error handling wrapper
 * 
 * Provides a centralized HTTP client with consistent configuration,
 * timeout handling, request/response intercepting capabilities,
 * and comprehensive error handling for API communications.
 * Uses native fetch API for HTTP communication.
 */

import {
    ApiRequestConfig,
    ApiResponse,
    HttpMethod,
    ContentType,
    ErrorResponse,
    CooldownErrorResponse,
    isErrorResponse,
    isCooldownErrorResponse
} from '../types/api';

/**
 * Custom error classes for HTTP client
 */

/**
 * Base class for HTTP client errors
 */
export class HttpClientError extends Error {
    public readonly status: number;
    public readonly statusText: string;
    public readonly response?: any;

    constructor(message: string, status: number, statusText: string, response?: any) {
        super(message);
        this.name = 'HttpClientError';
        this.status = status;
        this.statusText = statusText;
        this.response = response;
    }
}

/**
 * Error thrown when request times out
 */
export class TimeoutError extends Error {
    public readonly timeout: number;

    constructor(timeout: number) {
        super(`Request timeout after ${timeout}ms`);
        this.name = 'TimeoutError';
        this.timeout = timeout;
    }
}

/**
 * Error thrown when network connection fails
 */
export class NetworkError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'NetworkError';
    }
}

/**
 * Error thrown when API returns an error response
 */
export class ApiError extends HttpClientError {
    public readonly errorCode: string;
    public readonly details: Record<string, any>;

    constructor(errorResponse: ErrorResponse, status: number, statusText: string) {
        super(errorResponse.message, status, statusText, errorResponse);
        this.name = 'ApiError';
        this.errorCode = errorResponse.error;
        this.details = errorResponse.details;
    }
}

/**
 * Error thrown when cooldown period is active
 */
export class CooldownError extends ApiError {
    public readonly remainingSeconds: number;
    public readonly retryAfter: string;

    constructor(cooldownResponse: CooldownErrorResponse, status: number, statusText: string) {
        super(cooldownResponse, status, statusText);
        this.name = 'CooldownError';
        this.remainingSeconds = cooldownResponse.remainingSeconds;
        this.retryAfter = cooldownResponse.retryAfter;
    }
}

/**
 * Default HTTP client configuration
 */
export const DEFAULT_CONFIG = {
    /** Base URL for API endpoints */
    baseURL: (typeof window !== 'undefined' && (window as any).VITE_API_BASE_URL) || 'http://localhost:5000',
    /** Default request timeout in milliseconds */
    timeout: 30000,
    /** Default headers for all requests */
    headers: {
        'Content-Type': ContentType.JSON,
        'Accept': ContentType.JSON
    }
} as const;

/**
 * HTTP client configuration options
 */
export interface HttpClientConfig {
    /** Base URL for all requests */
    baseURL?: string;
    /** Default timeout for requests */
    timeout?: number;
    /** Default headers to include with requests */
    headers?: Record<string, string>;
}

/**
 * HTTP client class for making API requests
 * Provides a consistent interface over the fetch API
 */
export class HttpClient {
    private config: Required<HttpClientConfig>;

    constructor(config: HttpClientConfig = {}) {
        this.config = {
            baseURL: config.baseURL || DEFAULT_CONFIG.baseURL,
            timeout: config.timeout || DEFAULT_CONFIG.timeout,
            headers: { ...DEFAULT_CONFIG.headers, ...config.headers }
        };
    }

    /**
     * Makes an HTTP request with the specified configuration
     * Includes comprehensive error handling and response validation
     * @param requestConfig Request configuration
     * @returns Promise resolving to API response
     * @throws {TimeoutError} When request times out
     * @throws {NetworkError} When network connection fails
     * @throws {CooldownError} When cooldown period is active
     * @throws {ApiError} When API returns an error response
     * @throws {HttpClientError} For other HTTP errors
     */
    async request<T = any>(requestConfig: ApiRequestConfig): Promise<ApiResponse<T>> {
        const url = this.buildUrl(requestConfig.url);
        const headers = { ...this.config.headers, ...requestConfig.headers };
        const timeout = requestConfig.timeout || this.config.timeout;

        // Create AbortController for timeout handling
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                method: requestConfig.method,
                headers,
                body: requestConfig.data ? JSON.stringify(requestConfig.data) : undefined,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            // Parse response body
            let data: T;
            const contentType = response.headers.get('content-type');

            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text() as unknown as T;
            }

            // Convert Headers to plain object
            const responseHeaders: Record<string, string> = {};
            response.headers.forEach((value, key) => {
                responseHeaders[key] = value;
            });

            // Handle error responses
            if (!response.ok) {
                await this.handleErrorResponse(response, data);
            }

            return {
                data,
                status: response.status,
                statusText: response.statusText,
                headers: responseHeaders
            };

        } catch (error) {
            clearTimeout(timeoutId);

            // Re-throw custom errors as-is
            if (error instanceof HttpClientError ||
                error instanceof TimeoutError ||
                error instanceof NetworkError) {
                throw error;
            }

            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    throw new TimeoutError(timeout);
                }

                // Network-related errors
                if (error.message.includes('fetch') ||
                    error.message.includes('network') ||
                    error.message.includes('ECONNREFUSED') ||
                    error.message.includes('ENOTFOUND')) {
                    throw new NetworkError(`Network error: ${error.message}`);
                }

                throw new NetworkError(error.message);
            }

            throw new NetworkError('Unknown network error occurred');
        }
    }

    /**
     * Handles error responses from the API
     * @param response HTTP response object
     * @param data Parsed response data
     * @throws {CooldownError} When cooldown period is active
     * @throws {ApiError} When API returns an error response
     * @throws {HttpClientError} For other HTTP errors
     */
    private async handleErrorResponse(response: Response, data: any): Promise<never> {
        // Check if response data matches API error format
        if (isErrorResponse(data)) {
            // Handle specific cooldown errors
            if (response.status === 429 && isCooldownErrorResponse(data)) {
                throw new CooldownError(data, response.status, response.statusText);
            }

            // Handle general API errors
            throw new ApiError(data, response.status, response.statusText);
        }

        // Handle non-API error responses
        const errorMessage = typeof data === 'string'
            ? data
            : `HTTP ${response.status}: ${response.statusText}`;

        throw new HttpClientError(
            errorMessage,
            response.status,
            response.statusText,
            data
        );
    }

    /**
     * Makes a GET request
     * @param url Request URL
     * @param config Optional request configuration
     * @returns Promise resolving to API response
     */
    async get<T = any>(url: string, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>> {
        return this.request<T>({
            method: HttpMethod.GET,
            url,
            ...config
        });
    }

    /**
     * Makes a POST request
     * @param url Request URL
     * @param data Request body data
     * @param config Optional request configuration
     * @returns Promise resolving to API response
     */
    async post<T = any>(url: string, data?: any, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>> {
        return this.request<T>({
            method: HttpMethod.POST,
            url,
            data,
            ...config
        });
    }

    /**
     * Updates the base configuration
     * @param config New configuration to merge
     */
    updateConfig(config: Partial<HttpClientConfig>): void {
        this.config = {
            ...this.config,
            ...config,
            headers: { ...this.config.headers, ...config.headers }
        };
    }

    /**
     * Gets the current configuration
     * @returns Current HTTP client configuration
     */
    getConfig(): HttpClientConfig {
        return { ...this.config };
    }

    /**
     * Builds a complete URL from the base URL and endpoint
     * @param endpoint API endpoint path
     * @returns Complete URL
     */
    private buildUrl(endpoint: string): string {
        // Remove trailing slash from base URL and leading slash from endpoint if both exist
        const baseUrl = this.config.baseURL.replace(/\/$/, '');
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

        return `${baseUrl}${cleanEndpoint}`;
    }
}

/**
 * Default HTTP client instance
 * Pre-configured with default settings for immediate use
 */
export const httpClient = new HttpClient();

/**
 * Factory function to create HTTP client with custom configuration
 * @param config Custom configuration options
 * @returns New HTTP client instance
 */
export function createHttpClient(config: HttpClientConfig): HttpClient {
    return new HttpClient(config);
}

/**
 * HTTP status code utilities
 */
export const HttpStatus = {
    /**
     * Checks if status code indicates success (2xx)
     * @param status HTTP status code
     * @returns True if status indicates success
     */
    isSuccess: (status: number): boolean => status >= 200 && status < 300,

    /**
     * Checks if status code indicates client error (4xx)
     * @param status HTTP status code
     * @returns True if status indicates client error
     */
    isClientError: (status: number): boolean => status >= 400 && status < 500,

    /**
     * Checks if status code indicates server error (5xx)
     * @param status HTTP status code
     * @returns True if status indicates server error
     */
    isServerError: (status: number): boolean => status >= 500 && status < 600,

    /**
     * Checks if status code indicates any error (4xx or 5xx)
     * @param status HTTP status code
     * @returns True if status indicates any error
     */
    isError: (status: number): boolean => status >= 400
};

/**
 * Error handling utilities
 */
export const ErrorUtils = {
    /**
     * Extracts a user-friendly error message from various error types
     * @param error Error object of any type
     * @returns User-friendly error message
     */
    getErrorMessage: (error: unknown): string => {
        if (error instanceof CooldownError) {
            const minutes = Math.ceil(error.remainingSeconds / 60);
            return `Please wait ${minutes} minute${minutes !== 1 ? 's' : ''} before generating more loot.`;
        }

        if (error instanceof ApiError) {
            return error.message || 'An API error occurred.';
        }

        if (error instanceof NetworkError) {
            return 'Unable to connect to the server. Please check your internet connection.';
        }

        if (error instanceof TimeoutError) {
            return 'Request timed out. Please try again.';
        }

        if (error instanceof HttpClientError) {
            return error.message || 'An HTTP error occurred.';
        }

        if (error instanceof Error) {
            return error.message;
        }

        return 'An unexpected error occurred.';
    },

    /**
     * Checks if an error is retryable
     * @param error Error object
     * @returns True if the error might be resolved by retrying
     */
    isRetryable: (error: unknown): boolean => {
        if (error instanceof CooldownError) {
            return false; // Should not retry until cooldown expires
        }

        if (error instanceof ApiError) {
            return false; // API errors usually indicate client-side issues
        }

        if (error instanceof NetworkError || error instanceof TimeoutError) {
            return true; // Network issues might be temporary
        }

        if (error instanceof HttpClientError) {
            // Server errors (5xx) are potentially retryable
            return error.status >= 500;
        }

        return false;
    },

    /**
     * Gets the recommended retry delay for retryable errors
     * @param error Error object
     * @param attemptNumber Current attempt number (starting from 1)
     * @returns Recommended delay in milliseconds, or null if not retryable
     */
    getRetryDelay: (error: unknown, attemptNumber: number): number | null => {
        if (!ErrorUtils.isRetryable(error)) {
            return null;
        }

        // Exponential backoff: 1s, 2s, 4s, 8s, etc. (max 30s)
        const baseDelay = 1000;
        const delay = Math.min(baseDelay * Math.pow(2, attemptNumber - 1), 30000);

        // Add some jitter to prevent thundering herd
        const jitter = Math.random() * 0.1 * delay;

        return delay + jitter;
    }
};