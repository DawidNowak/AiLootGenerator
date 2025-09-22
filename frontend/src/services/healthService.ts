/**
 * Health Service for Warhammer Fantasy Loot Generator
 * Task: T027 - Health check API function
 * 
 * Provides health check functionality to verify backend API availability
 * and system status. Used for application monitoring and connectivity verification.
 */

import { httpClient, HttpClientError, TimeoutError } from './httpClient';
import { endpoints } from './endpoints';
import { ApiResponse, HealthResponse } from '../types/api';
import { validateHealthResponse } from './validation';

/**
 * Health check status enumeration
 */
export enum HealthStatus {
    HEALTHY = 'healthy',
    UNHEALTHY = 'unhealthy',
    UNKNOWN = 'unknown'
}

/**
 * Health check result with additional metadata
 */
export interface HealthCheckResult {
    /** Overall health status */
    status: HealthStatus;
    /** Response time in milliseconds */
    responseTime: number;
    /** Health response data (if available) */
    data?: HealthResponse;
    /** Error information (if unhealthy) */
    error?: string;
}

/**
 * Check the health of the backend API
 * 
 * @returns Promise resolving to health check result
 * @throws {HttpClientError} When the API returns an error response
 * @throws {TimeoutError} When the request times out
 * 
 * @example
 * ```typescript
 * try {
 *   const result = await checkHealth();
 *   if (result.status === HealthStatus.HEALTHY) {
 *     console.log('API is healthy');
 *   }
 * } catch (error) {
 *   console.error('Health check failed:', error);
 * }
 * ```
 */
export const checkHealth = async (): Promise<HealthCheckResult> => {
    const startTime = performance.now();

    try {
        const response: ApiResponse<HealthResponse> = await httpClient.get(
            endpoints.health(),
            {
                timeout: 5000, // Shorter timeout for health checks
                headers: {
                    'Accept': 'application/json'
                }
            }
        );

        const responseTime = Math.round(performance.now() - startTime);

        if (response.status >= 200 && response.status < 300 && response.data) {
            // Validate the response structure
            const validation = validateHealthResponse(response.data);
            if (!validation.valid) {
                return {
                    status: HealthStatus.UNHEALTHY,
                    responseTime,
                    error: `Invalid response format: ${validation.errors[0]}`
                };
            }

            return {
                status: response.data.status === 'Healthy' ? HealthStatus.HEALTHY : HealthStatus.UNHEALTHY,
                responseTime,
                data: response.data
            };
        } else {
            return {
                status: HealthStatus.UNHEALTHY,
                responseTime,
                error: 'Invalid response format'
            };
        }
    } catch (error) {
        const responseTime = Math.round(performance.now() - startTime);

        // Check for HttpClientError (by instanceof or name property)
        if (error instanceof HttpClientError || (error as any)?.name === 'HttpClientError') {
            return {
                status: HealthStatus.UNHEALTHY,
                responseTime,
                error: `HTTP ${(error as any).status}: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }

        // Check for TimeoutError (by instanceof or name property)
        if (error instanceof TimeoutError || (error as any)?.name === 'TimeoutError') {
            return {
                status: HealthStatus.UNHEALTHY,
                responseTime,
                error: `Request timeout after ${(error as any).timeout}ms`
            };
        }

        return {
            status: HealthStatus.UNKNOWN,
            responseTime,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};

/**
 * Perform a quick health check (simplified response)
 * 
 * @returns Promise resolving to boolean indicating if service is healthy
 * 
 * @example
 * ```typescript
 * const isHealthy = await isServiceHealthy();
 * if (isHealthy) {
 *   // Proceed with API calls
 * } else {
 *   // Show offline message
 * }
 * ```
 */
export const isServiceHealthy = async (): Promise<boolean> => {
    try {
        const result = await checkHealth();
        return result.status === HealthStatus.HEALTHY;
    } catch (error) {
        return false;
    }
};

/**
 * Monitor health status with periodic checks
 * 
 * @param intervalMs - Check interval in milliseconds (default: 30000ms = 30s)
 * @param onStatusChange - Callback when health status changes
 * @returns Function to stop monitoring
 * 
 * @example
 * ```typescript
 * const stopMonitoring = monitorHealth(60000, (result) => {
 *   console.log('Health status:', result.status);
 * });
 * 
 * // Later...
 * stopMonitoring();
 * ```
 */
export const monitorHealth = (
    intervalMs: number = 30000,
    onStatusChange: (result: HealthCheckResult) => void
): (() => void) => {
    let lastStatus: HealthStatus | null = null;

    const performCheck = async () => {
        try {
            const result = await checkHealth();

            // Only notify on status change
            if (result.status !== lastStatus) {
                lastStatus = result.status;
                onStatusChange(result);
            }
        } catch (error) {
            const errorResult: HealthCheckResult = {
                status: HealthStatus.UNKNOWN,
                responseTime: 0,
                error: error instanceof Error ? error.message : 'Monitor check failed'
            };

            if (lastStatus !== HealthStatus.UNKNOWN) {
                lastStatus = HealthStatus.UNKNOWN;
                onStatusChange(errorResult);
            }
        }
    };

    // Perform initial check
    performCheck();

    // Set up periodic checks
    const intervalId = setInterval(performCheck, intervalMs);

    // Return cleanup function
    return () => {
        clearInterval(intervalId);
    };
};

/**
 * Health service utilities
 */
export const healthService = {
    check: checkHealth,
    isHealthy: isServiceHealthy,
    monitor: monitorHealth,
    HealthStatus
} as const;