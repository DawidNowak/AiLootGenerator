/**
 * API Endpoints Configuration for Warhammer Fantasy Loot Generator
 * Task: T026 - API endpoints configuration
 * 
 * Centralizes all API endpoint definitions and URL construction
 * for consistent communication with the backend API.
 * Provides type-safe endpoint building with environment-based configuration.
 */

import { loadEnvironmentConfig } from '../utils/environment';

/**
 * API endpoint configuration interface
 */
export interface ApiEndpointConfig {
    /** Base URL for the API */
    baseUrl: string;
    /** API version prefix */
    version: string;
    /** Request timeout in milliseconds */
    timeout: number;
}

/**
 * Available API endpoints
 */
export interface ApiEndpoints {
    /** Health check endpoint */
    health: string;
    /** Loot generation endpoint */
    generateLoot: string;
}

/**
 * Environment-based API configuration
 * Defaults to localhost for development, but can be overridden via environment variables
 */
const getApiConfig = (): ApiEndpointConfig => {
    const envConfig = loadEnvironmentConfig();

    return {
        baseUrl: envConfig.apiBaseUrl.replace(/\/$/, ''), // Remove trailing slash
        version: envConfig.apiVersion,
        timeout: envConfig.apiTimeout
    };
};

/**
 * API configuration instance
 */
export const API_CONFIG: ApiEndpointConfig = getApiConfig();

/**
 * Build a complete URL for an API endpoint
 * @param path - The endpoint path (without leading slash)
 * @returns Complete URL for the endpoint
 */
export const buildApiUrl = (path: string): string => {
    const cleanPath = path.replace(/^\//, ''); // Remove leading slash if present
    return `${API_CONFIG.baseUrl}/${API_CONFIG.version}/${cleanPath}`;
};

/**
 * All available API endpoints
 * Provides centralized endpoint definitions matching the OpenAPI contract
 */
export const API_ENDPOINTS: ApiEndpoints = {
    health: buildApiUrl('health'),
    generateLoot: buildApiUrl('loot/generate')
};

/**
 * Endpoint builder functions for dynamic URL construction
 */
export const endpoints = {
    /**
     * Get the health check endpoint
     * @returns Health endpoint URL
     */
    health: (): string => API_ENDPOINTS.health,

    /**
     * Get the loot generation endpoint
     * @returns Loot generation endpoint URL
     */
    generateLoot: (): string => API_ENDPOINTS.generateLoot
};

/**
 * Common HTTP headers for API requests
 */
export const API_HEADERS = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
} as const;

/**
 * Default request configuration
 */
export const DEFAULT_REQUEST_CONFIG = {
    timeout: API_CONFIG.timeout,
    headers: API_HEADERS
} as const;

/**
 * Utility function to validate API configuration
 * @returns True if configuration is valid
 */
export const validateApiConfig = (): boolean => {
    try {
        // Validate base URL format
        new URL(API_CONFIG.baseUrl);

        // Validate version is not empty
        if (!API_CONFIG.version.trim()) {
            console.error('API version cannot be empty');
            return false;
        }

        // Validate timeout is positive
        if (API_CONFIG.timeout <= 0) {
            console.error('API timeout must be positive');
            return false;
        }

        return true;
    } catch (error) {
        console.error('Invalid API base URL:', API_CONFIG.baseUrl);
        return false;
    }
};

/**
 * Development helper to log current API configuration
 */
export const logApiConfig = (): void => {
    // Import isDevelopment here to avoid circular dependencies
    try {
        const { isDevelopment } = require('../utils/environment');
        if (isDevelopment()) {
            console.log('🔧 API Configuration:', {
                baseUrl: API_CONFIG.baseUrl,
                version: API_CONFIG.version,
                timeout: API_CONFIG.timeout,
                endpoints: API_ENDPOINTS
            });
        }
    } catch {
        // Silently fail in test environments
    }
};

// Validate configuration on module load
if (!validateApiConfig()) {
    console.warn('⚠️ API configuration validation failed. Check environment variables.');
}

// Log configuration in development
logApiConfig();