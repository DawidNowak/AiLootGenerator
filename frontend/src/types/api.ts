/**
 * API types for the Warhammer Fantasy Loot Generator
 * Task: T016 - API Types matching OpenAPI contract
 * 
 * These types correspond directly to the OpenAPI schema definitions
 * in contracts/openapi.yaml for type safety and consistency
 */

import { Language, WealthLevel } from './index';

/**
 * Request payload for POST /api/loot/generate
 * Represents user input for loot generation
 */
export interface GenerationRequest {
    /** Description of the in-game location where loot is found */
    location: string;
    /** Wealth tier for generated items */
    wealthLevel: WealthLevel;
    /** Target language for generated content */
    language: Language;
    /** User session identifier for cooldown tracking */
    sessionId: string;
}

/**
 * Response from POST /api/loot/generate (HTTP 200)
 * Contains generated loot items and metadata
 */
export interface GenerationResponse {
    /** Generated loot items (4-6 items) */
    items: LootItem[];
    /** Timestamp when items were generated */
    generatedAt: string;
    /** When the user can generate loot again */
    cooldownExpiresAt: string;
}

/**
 * Individual loot item from generation response
 * Represents a single treasure with Warhammer Fantasy context
 */
export interface LootItem {
    /** Thematic item name (3-100 characters) */
    name: string;
    /** Detailed item description (max 500 characters) */
    description: string;
    /** Estimated value in pennies (smallest WFRP denomination) */
    valueInPennies: number;
    /** Item's wealth classification */
    wealthLevel: WealthLevel;
}

/**
 * Standard error response format (HTTP 4xx/5xx)
 * Used for validation errors and general failures
 */
export interface ErrorResponse {
    /** Error type identifier */
    error: string;
    /** Human-readable error message */
    message: string;
    /** Additional error context */
    details: Record<string, any>;
}

/**
 * Specific error response for cooldown violations (HTTP 429)
 * Extends ErrorResponse with cooldown-specific information
 */
export interface CooldownErrorResponse extends ErrorResponse {
    /** Seconds remaining in cooldown period */
    remainingSeconds: number;
    /** When user can retry the request */
    retryAfter: string;
}

/**
 * Response from GET /api/health
 * Provides service health status and dependency checks
 */
export interface HealthResponse {
    /** Overall service health status */
    status: 'Healthy' | 'Degraded' | 'Unhealthy';
    /** Health check timestamp */
    timestamp: string;
    /** Health status of individual services */
    services: {
        /** OpenAI API connection status */
        openai: 'Healthy' | 'Unhealthy';
        /** Qdrant vector database status */
        qdrant: 'Healthy' | 'Unhealthy';
    };
}

/**
 * HTTP status codes used by the API
 * For type-safe status code handling
 */
export enum ApiStatusCode {
    OK = 200,
    BadRequest = 400,
    TooManyRequests = 429,
    InternalServerError = 500,
    ServiceUnavailable = 503
}

/**
 * API endpoint paths
 * Centralized definition for URL construction
 */
export enum ApiEndpoint {
    GenerateLoot = '/api/loot/generate',
    Health = '/api/health'
}

/**
 * HTTP methods used by the API
 * For type-safe method specification
 */
export enum HttpMethod {
    GET = 'GET',
    POST = 'POST'
}

/**
 * Content types for API requests
 * Standard MIME types for HTTP communication
 */
export enum ContentType {
    JSON = 'application/json'
}

/**
 * API request configuration
 * Generic interface for HTTP client configuration
 */
export interface ApiRequestConfig {
    /** HTTP method */
    method: HttpMethod;
    /** Request URL */
    url: string;
    /** Request headers */
    headers?: Record<string, string>;
    /** Request body (for POST requests) */
    data?: any;
    /** Request timeout in milliseconds */
    timeout?: number;
}

/**
 * API response wrapper
 * Generic container for API responses with status information
 */
export interface ApiResponse<T = any> {
    /** Response data */
    data: T;
    /** HTTP status code */
    status: number;
    /** HTTP status text */
    statusText: string;
    /** Response headers */
    headers: Record<string, string>;
}

/**
 * Type guard for error responses
 * Helps distinguish between success and error responses
 */
export function isErrorResponse(response: any): response is ErrorResponse {
    return typeof response === 'object' &&
        response !== null &&
        typeof response.error === 'string' &&
        typeof response.message === 'string';
}

/**
 * Type guard for cooldown error responses
 * Identifies cooldown-specific errors for special handling
 */
export function isCooldownErrorResponse(response: any): response is CooldownErrorResponse {
    return isErrorResponse(response) &&
        typeof (response as any).remainingSeconds === 'number' &&
        typeof (response as any).retryAfter === 'string';
}

/**
 * Type guard for health responses
 * Validates health check response structure
 */
export function isHealthResponse(response: any): response is HealthResponse {
    return typeof response === 'object' &&
        response !== null &&
        typeof response.status === 'string' &&
        typeof response.timestamp === 'string' &&
        typeof response.services === 'object';
}

/**
 * Type guard for generation responses
 * Validates successful loot generation response
 */
export function isGenerationResponse(response: any): response is GenerationResponse {
    return typeof response === 'object' &&
        response !== null &&
        typeof response.requestId === 'string' &&
        Array.isArray(response.items) &&
        typeof response.location === 'string' &&
        typeof response.language === 'string';
}