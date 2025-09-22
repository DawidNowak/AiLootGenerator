/**
 * Loot Generation Service for Warhammer Fantasy Loot Generator
 * Task: T028 - Loot generation API function
 * 
 * Provides API communication for loot generation functionality.
 * Handles POST requests to /api/loot/generate endpoint with proper
 * error handling for validation errors, cooldown periods, and server errors.
 */

import { httpClient, HttpClientError, TimeoutError, ApiError, CooldownError } from './httpClient';
import { endpoints } from './endpoints';
import {
    GenerationRequest,
    GenerationResponse
} from '../types/api';
import { Language, WealthLevel } from '../types/index';
import {
    validateGenerationRequest as validateRequest,
    validateGenerationResponse
} from './validation';

/**
 * Loot generation result with additional metadata
 */
export interface LootGenerationResult {
    /** Success status */
    success: boolean;
    /** Generated loot data (if successful) */
    data?: GenerationResponse;
    /** Error information (if failed) */
    error?: {
        type: 'validation' | 'cooldown' | 'server' | 'network' | 'timeout';
        message: string;
        details?: any;
        /** For cooldown errors: seconds remaining */
        remainingSeconds?: number;
        /** For cooldown errors: retry timestamp */
        retryAfter?: string;
    };
    /** Response time in milliseconds */
    responseTime: number;
}

/**
 * Loot generation options for convenience
 */
export interface LootGenerationOptions {
    /** Location description (1-200 characters) */
    location: string;
    /** Wealth level for generated items */
    wealthLevel: WealthLevel;
    /** Target language for content */
    language: Language;
    /** Session ID for cooldown tracking */
    sessionId: string;
}

/**
 * Generate loot items for a specific location and wealth level
 * 
 * @param options - Generation parameters
 * @returns Promise resolving to generation result
 * 
 * @example
 * ```typescript
 * try {
 *   const result = await generateLoot({
 *     location: "Ubersreik barracks",
 *     wealthLevel: "Common",
 *     language: "en",
 *     sessionId: "abc123-session"
 *   });
 *   
 *   if (result.success && result.data) {
 *     console.log(`Generated ${result.data.items.length} items`);
 *     result.data.items.forEach(item => {
 *       console.log(`${item.name}: ${item.valueInPennies} pennies`);
 *     });
 *   } else if (result.error?.type === 'cooldown') {
 *     console.log(`Cooldown active: ${result.error.remainingSeconds}s remaining`);
 *   }
 * } catch (error) {
 *   console.error('Unexpected error:', error);
 * }
 * ```
 */
export async function generateLoot(options: LootGenerationOptions): Promise<LootGenerationResult> {
    const startTime = Date.now();

    try {
        // Validate request parameters before sending
        const requestValidation = validateRequest(options);
        if (!requestValidation.valid) {
            const responseTime = Date.now() - startTime;
            return {
                success: false,
                error: {
                    type: 'validation',
                    message: requestValidation.errors[0] || 'Invalid request parameters',
                    details: {
                        errors: requestValidation.errors,
                        fieldErrors: requestValidation.fieldErrors
                    }
                },
                responseTime
            };
        }

        // Prepare request payload
        const request: GenerationRequest = {
            location: options.location.trim(),
            wealthLevel: options.wealthLevel,
            language: options.language,
            sessionId: options.sessionId
        };

        // Make API request
        const response = await httpClient.post<GenerationResponse>(
            endpoints.generateLoot(),
            request,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        const responseTime = Date.now() - startTime;

        // Validate API response
        const responseValidation = validateGenerationResponse(response.data);
        if (!responseValidation.valid) {
            return {
                success: false,
                error: {
                    type: 'server',
                    message: 'Invalid response format from server',
                    details: {
                        errors: responseValidation.errors,
                        rawResponse: response.data
                    }
                },
                responseTime
            };
        }

        // Handle successful response
        if (response.data) {
            return {
                success: true,
                data: response.data,
                responseTime
            };
        } else {
            // This shouldn't happen if httpClient is working correctly
            return {
                success: false,
                error: {
                    type: 'server',
                    message: 'Invalid response format from server'
                },
                responseTime
            };
        }

    } catch (error) {
        const responseTime = Date.now() - startTime;

        // Handle specific error types
        // Check for CooldownError (duck typing for better test compatibility)
        if (error instanceof CooldownError ||
            (error as any)?.name === 'CooldownError' ||
            (typeof (error as any)?.remainingSeconds === 'number' &&
                typeof (error as any)?.retryAfter === 'string')) {
            const cooldownError = error as CooldownError;
            return {
                success: false,
                error: {
                    type: 'cooldown',
                    message: cooldownError.message,
                    details: cooldownError.details,
                    remainingSeconds: cooldownError.remainingSeconds,
                    retryAfter: cooldownError.retryAfter
                },
                responseTime
            };
        }

        // Check for ApiError (duck typing for better test compatibility)
        if (error instanceof ApiError ||
            (error as any)?.name === 'ApiError' ||
            (typeof (error as any)?.status === 'number' &&
                typeof (error as any)?.details === 'object')) {
            const apiError = error as ApiError;
            const errorType = apiError.status === 400 ? 'validation' : 'server';
            return {
                success: false,
                error: {
                    type: errorType,
                    message: apiError.message,
                    details: apiError.details
                },
                responseTime
            };
        }

        // Check for TimeoutError (duck typing for better test compatibility)
        if (error instanceof TimeoutError ||
            (error as any)?.name === 'TimeoutError' ||
            typeof (error as any)?.timeout === 'number') {
            const timeoutError = error as TimeoutError;
            return {
                success: false,
                error: {
                    type: 'timeout',
                    message: timeoutError.message,
                    details: { timeout: timeoutError.timeout }
                },
                responseTime
            };
        }

        if (error instanceof HttpClientError) {
            return {
                success: false,
                error: {
                    type: 'server',
                    message: `HTTP ${error.status}: ${error.statusText}`,
                    details: { status: error.status, statusText: error.statusText }
                },
                responseTime
            };
        }

        // Handle network errors and other unexpected errors
        return {
            success: false,
            error: {
                type: 'network',
                message: error instanceof Error ? error.message : 'Unknown network error',
                details: error
            },
            responseTime
        };
    }
}

/**
 * Validate loot generation request parameters locally before API call
 * 
 * @param options - Generation parameters to validate
 * @returns Validation result with specific error messages
 * 
 * @example
 * ```typescript
 * const validation = validateGenerationRequest({
 *   location: "",
 *   wealthLevel: "Common",
 *   language: "en",
 *   sessionId: "test-session"
 * });
 * 
 * if (!validation.valid) {
 *   console.error('Validation errors:', validation.errors);
 * }
 * ```
 */
export interface ValidationResult {
    /** Whether all validations passed */
    valid: boolean;
    /** Array of validation error messages */
    errors: string[];
    /** Field-specific errors for form handling */
    fieldErrors: Record<string, string[]>;
}

export function validateGenerationRequest(options: LootGenerationOptions): ValidationResult {
    const errors: string[] = [];
    const fieldErrors: Record<string, string[]> = {};

    // Helper function to add field error
    const addFieldError = (field: string, error: string) => {
        errors.push(error);
        if (!fieldErrors[field]) {
            fieldErrors[field] = [];
        }
        fieldErrors[field].push(error);
    };

    // Validate location
    if (!options.location || typeof options.location !== 'string') {
        addFieldError('location', 'Location is required');
    } else {
        const trimmedLocation = options.location.trim();
        if (trimmedLocation.length === 0) {
            addFieldError('location', 'Location cannot be empty');
        } else if (trimmedLocation.length > 200) {
            addFieldError('location', 'Location must be 200 characters or less');
        }
    }

    // Validate wealth level
    const validWealthLevels = Object.values(WealthLevel);
    if (!options.wealthLevel || !validWealthLevels.includes(options.wealthLevel)) {
        addFieldError('wealthLevel', 'Valid wealth level is required (Rubbish, Poor, Common, Wealthy, Noble)');
    }

    // Validate language
    const validLanguages: Language[] = ['en', 'pl'];
    if (!options.language || !validLanguages.includes(options.language)) {
        addFieldError('language', 'Valid language is required (en, pl)');
    }

    // Validate session ID
    if (!options.sessionId || typeof options.sessionId !== 'string' || options.sessionId.trim().length === 0) {
        addFieldError('sessionId', 'Session ID is required');
    }

    return {
        valid: errors.length === 0,
        errors,
        fieldErrors
    };
}

/**
 * Get estimated cooldown remaining time based on last generation
 * 
 * @param lastGenerationTime - Timestamp of last successful generation
 * @param cooldownDurationMs - Cooldown period in milliseconds (default: 30000ms = 30s)
 * @returns Remaining cooldown time in milliseconds, or 0 if no cooldown
 * 
 * @example
 * ```typescript
 * const lastGeneration = Date.now() - 15000; // 15 seconds ago
 * const remaining = getCooldownRemaining(lastGeneration);
 * 
 * if (remaining > 0) {
 *   console.log(`Must wait ${Math.ceil(remaining / 1000)}s before next generation`);
 * }
 * ```
 */
export function getCooldownRemaining(
    lastGenerationTime: number,
    cooldownDurationMs: number = 30000
): number {
    const now = Date.now();
    const timeSinceLastGeneration = now - lastGenerationTime;

    if (timeSinceLastGeneration >= cooldownDurationMs) {
        return 0; // No cooldown remaining
    }

    return cooldownDurationMs - timeSinceLastGeneration;
}

/**
 * Format cooldown time for user display
 * 
 * @param remainingMs - Remaining cooldown time in milliseconds
 * @returns Human-readable cooldown time string
 * 
 * @example
 * ```typescript
 * formatCooldownTime(15500); // "15s"
 * formatCooldownTime(65000); // "1m 5s"
 * ```
 */
export function formatCooldownTime(remainingMs: number): string {
    if (remainingMs <= 0) {
        return '0s';
    }

    const seconds = Math.ceil(remainingMs / 1000);

    if (seconds < 60) {
        return `${seconds}s`;
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (remainingSeconds === 0) {
        return `${minutes}m`;
    }

    return `${minutes}m ${remainingSeconds}s`;
}