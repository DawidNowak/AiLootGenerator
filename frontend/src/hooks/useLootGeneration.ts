/**
 * Loot Generation Hook for Warhammer Fantasy Loot Generator
 * Task: T046 - Create loot generation hook
 * 
 * Manages loot generation state, API calls, and user experience.
 * Integrates with cooldown management and form validation.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    generateLoot,
    LootGenerationResult as ServiceLootGenerationResult,
    LootGenerationOptions
} from '../services/lootService';
import { GenerationRequest, GenerationResponse } from '../types/api';
import { useCooldown } from './useCooldown';

/**
 * Generation state information
 */
export interface GenerationState {
    /** Whether generation is in progress */
    isLoading: boolean;
    /** Whether generation was successful */
    isSuccess: boolean;
    /** Whether generation failed */
    isError: boolean;
    /** Generated loot data (if successful) */
    data: GenerationResponse | null;
    /** Error information (if failed) */
    error: {
        type: 'validation' | 'cooldown' | 'server' | 'network' | 'timeout';
        message: string;
        details?: any;
        remainingSeconds?: number;
        retryAfter?: string;
    } | null;
    /** Response time for last request */
    responseTime: number;
    /** Generation attempt count */
    attemptCount: number;
}

/**
 * Loot generation hook options
 */
export interface UseLootGenerationOptions {
    /** Session ID for cooldown tracking */
    sessionId: string;
    /** Callback when generation succeeds */
    onSuccess?: (data: GenerationResponse) => void;
    /** Callback when generation fails */
    onError?: (error: GenerationState['error']) => void;
    /** Callback when cooldown is triggered */
    onCooldown?: (remainingSeconds: number, retryAfter: string) => void;
    /** Whether to automatically manage cooldown state */
    manageCooldown?: boolean;
    /** Maximum retry attempts for network errors */
    maxRetries?: number;
    /** Retry delay in milliseconds */
    retryDelay?: number;
}

/**
 * Loot generation hook return value
 */
export interface LootGenerationResult extends GenerationState {
    /** Generate loot with given parameters */
    generate: (request: Omit<GenerationRequest, 'sessionId'>) => Promise<boolean>;
    /** Generate loot with simplified options */
    generateSimple: (options: LootGenerationOptions) => Promise<boolean>;
    /** Retry last failed generation */
    retry: () => Promise<boolean>;
    /** Reset generation state */
    reset: () => void;
    /** Clear error state */
    clearError: () => void;
    /** Cooldown management (if enabled) */
    cooldown: {
        isInCooldown: boolean;
        remainingSeconds: number;
        formattedTime: string;
        expiresAt: Date | null;
    };
}

/**
 * Create initial generation state
 */
function createInitialState(): GenerationState {
    return {
        isLoading: false,
        isSuccess: false,
        isError: false,
        data: null,
        error: null,
        responseTime: 0,
        attemptCount: 0
    };
}

/**
 * Loot generation management hook
 * 
 * @param options - Generation configuration
 * @returns Generation state and controls
 * 
 * @example
 * ```typescript
 * const sessionId = useSessionId();
 * const generation = useLootGeneration({
 *   sessionId,
 *   onSuccess: (data) => console.log('Generated items:', data.items),
 *   onError: (error) => console.error('Generation failed:', error.message),
 *   manageCooldown: true
 * });
 * 
 * const handleGenerate = async () => {
 *   const success = await generation.generate({
 *     location: 'Ubersreik marketplace',
 *     wealthLevel: WealthLevel.Common,
 *     language: 'en'
 *   });
 *   
 *   if (success) {
 *     console.log('Generation successful!');
 *   }
 * };
 * 
 * return (
 *   <div>
 *     {generation.cooldown.isInCooldown ? (
 *       <span>Next generation in: {generation.cooldown.formattedTime}</span>
 *     ) : (
 *       <button 
 *         onClick={handleGenerate}
 *         disabled={generation.isLoading}
 *       >
 *         {generation.isLoading ? 'Generating...' : 'Generate Loot'}
 *       </button>
 *     )}
 *     
 *     {generation.isSuccess && generation.data && (
 *       <div>
 *         {generation.data.items.map((item, index) => (
 *           <div key={index}>{item.name}: {item.description}</div>
 *         ))}
 *       </div>
 *     )}
 *     
 *     {generation.isError && generation.error && (
 *       <div>Error: {generation.error.message}</div>
 *     )}
 *   </div>
 * );
 * ```
 */
export function useLootGeneration(options: UseLootGenerationOptions): LootGenerationResult {
    const {
        sessionId,
        onSuccess,
        onError,
        onCooldown,
        manageCooldown = true,
        maxRetries = 3,
        retryDelay = 1000
    } = options;

    const { t } = useTranslation('errors');

    // State
    const [state, setState] = useState<GenerationState>(createInitialState);
    const [lastRequest, setLastRequest] = useState<GenerationRequest | null>(null);

    // Refs for stable references
    const onSuccessRef = useRef(onSuccess);
    const onErrorRef = useRef(onError);
    const onCooldownRef = useRef(onCooldown);
    const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Update callback refs when they change
    useEffect(() => {
        onSuccessRef.current = onSuccess;
        onErrorRef.current = onError;
        onCooldownRef.current = onCooldown;
    }, [onSuccess, onError, onCooldown]);

    // Cooldown management
    const cooldown = useCooldown({
        sessionId,
        onCooldownEnd: () => {
            // Reset error state when cooldown ends
            if (state.error?.type === 'cooldown') {
                setState(prev => ({
                    ...prev,
                    isError: false,
                    error: null
                }));
            }
        },
        autoStart: true
    });

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }
        };
    }, []);

    // Perform generation with retry logic
    const performGeneration = useCallback(async (
        request: GenerationRequest,
        retryCount = 0
    ): Promise<boolean> => {
        try {
            setState(prev => ({
                ...prev,
                isLoading: true,
                isError: false,
                error: null,
                attemptCount: prev.attemptCount + 1
            }));

            const result: ServiceLootGenerationResult = await generateLoot({
                location: request.location,
                wealthLevel: request.wealthLevel,
                language: request.language,
                sessionId: request.sessionId
            });

            setState(prev => ({
                ...prev,
                isLoading: false,
                responseTime: result.responseTime
            }));

            if (result.success && result.data) {
                // Success
                setState(prev => ({
                    ...prev,
                    isSuccess: true,
                    data: result.data!
                }));

                // Update cooldown if managed
                if (manageCooldown && result.data.cooldownExpiresAt) {
                    cooldown.setCooldown(result.data.cooldownExpiresAt);
                }

                // Call success callback
                onSuccessRef.current?.(result.data);
                return true;
            } else if (result.error) {
                // Handle different error types
                const error = result.error;

                // Cooldown error
                if (error.type === 'cooldown') {
                    if (manageCooldown && error.retryAfter) {
                        cooldown.setCooldown(error.retryAfter);
                    }
                    onCooldownRef.current?.(error.remainingSeconds || 0, error.retryAfter || '');
                }

                // Network errors with retry logic
                if (error.type === 'network' || error.type === 'timeout') {
                    if (retryCount < maxRetries) {
                        setState(prev => ({
                            ...prev,
                            isLoading: false,
                            error: {
                                ...error,
                                message: t('errors.retrying', {
                                    attempt: retryCount + 1,
                                    maxAttempts: maxRetries,
                                    defaultValue: `Retrying... (${retryCount + 1}/${maxRetries})`
                                })
                            }
                        }));

                        // Retry after delay
                        return new Promise((resolve) => {
                            retryTimeoutRef.current = setTimeout(async () => {
                                const success = await performGeneration(request, retryCount + 1);
                                resolve(success);
                            }, retryDelay * (retryCount + 1)); // Exponential backoff
                        });
                    }
                }

                // Set error state
                setState(prev => ({
                    ...prev,
                    isError: true,
                    error
                }));

                // Call error callback
                onErrorRef.current?.(error);
                return false;
            }

            return false;
        } catch (error) {
            const unexpectedError = {
                type: 'server' as const,
                message: t('errors.unexpected_error'),
                details: error
            };

            setState(prev => ({
                ...prev,
                isLoading: false,
                isError: true,
                error: unexpectedError
            }));

            onErrorRef.current?.(unexpectedError);
            return false;
        }
    }, [t, manageCooldown, cooldown, maxRetries, retryDelay]);

    // Generate loot with full request
    const generate = useCallback(async (
        request: Omit<GenerationRequest, 'sessionId'>
    ): Promise<boolean> => {
        const fullRequest: GenerationRequest = {
            ...request,
            sessionId
        };

        setLastRequest(fullRequest);
        return performGeneration(fullRequest);
    }, [sessionId, performGeneration]);

    // Generate loot with simplified options
    const generateSimple = useCallback(async (
        options: LootGenerationOptions
    ): Promise<boolean> => {
        return generate({
            location: options.location,
            wealthLevel: options.wealthLevel,
            language: options.language
        });
    }, [generate]);

    // Retry last failed generation
    const retry = useCallback(async (): Promise<boolean> => {
        if (!lastRequest) {
            console.warn('No previous request to retry');
            return false;
        }

        return performGeneration(lastRequest);
    }, [lastRequest, performGeneration]);

    // Reset generation state
    const reset = useCallback(() => {
        setState(createInitialState());
        setLastRequest(null);

        if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
            retryTimeoutRef.current = null;
        }
    }, []);

    // Clear error state
    const clearError = useCallback(() => {
        setState(prev => ({
            ...prev,
            isError: false,
            error: null
        }));
    }, []);

    return {
        ...state,
        generate,
        generateSimple,
        retry,
        reset,
        clearError,
        cooldown: {
            isInCooldown: cooldown.isInCooldown,
            remainingSeconds: cooldown.remainingSeconds,
            formattedTime: cooldown.formattedTime,
            expiresAt: cooldown.expiresAt
        }
    };
}

export default useLootGeneration;