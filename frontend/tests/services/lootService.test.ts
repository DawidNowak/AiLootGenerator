/**
 * Unit tests for LootService
 * Tests for Task T028 - Loot generation API function
 * 
 * Comprehensive test coverage for loot generation functionality,
 * including request validation, API communication, error handling,
 * and response processing.
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import {
    generateLoot,
    validateGenerationRequest,
    getCooldownRemaining,
    formatCooldownTime,
    type LootGenerationOptions
} from '../../src/services/lootService';
import { WealthLevel } from '../../src/types/index';
import { GenerationResponse } from '../../src/types/api';

// Mock the dependencies
jest.mock('../../src/services/httpClient');
jest.mock('../../src/services/endpoints');
jest.mock('../../src/services/validation');

// Import mocked modules
import * as httpClientModule from '../../src/services/httpClient';
import * as endpointsModule from '../../src/services/endpoints';
import * as validationModule from '../../src/services/validation';

const mockHttpClient = httpClientModule.httpClient as jest.Mocked<typeof httpClientModule.httpClient>;
const mockEndpoints = endpointsModule.endpoints as jest.Mocked<typeof endpointsModule.endpoints>;
const mockValidateRequest = validationModule.validateGenerationRequest as jest.MockedFunction<typeof validationModule.validateGenerationRequest>;
const mockValidateResponse = validationModule.validateGenerationResponse as jest.MockedFunction<typeof validationModule.validateGenerationResponse>;

describe('LootService', () => {
    // Test data
    const validOptions: LootGenerationOptions = {
        location: 'Ubersreik barracks',
        wealthLevel: WealthLevel.Common,
        language: 'en',
        sessionId: 'test-session-123'
    };

    const mockSuccessResponse: GenerationResponse = {
        items: [
            {
                name: 'Jungfreud Tabard',
                description: 'A well-maintained cloth tabard bearing the heraldry of House Jungfreud',
                valueInPennies: 60,
                wealthLevel: WealthLevel.Poor
            },
            {
                name: 'Iron-bound Training Shield',
                description: 'A practice shield showing wear from countless drills',
                valueInPennies: 36,
                wealthLevel: WealthLevel.Poor
            },
            {
                name: 'Copper Tankard',
                description: 'A dented copper drinking vessel with military insignia',
                valueInPennies: 18,
                wealthLevel: WealthLevel.Rubbish
            },
            {
                name: 'Worn Leather Boots',
                description: 'Military-issue boots showing signs of long marches',
                valueInPennies: 24,
                wealthLevel: WealthLevel.Poor
            }
        ],
        generatedAt: '2025-09-22T14:30:00Z',
        cooldownExpiresAt: '2025-09-22T14:30:30Z'
    };

    beforeEach(() => {
        jest.clearAllMocks();

        // Setup default mock implementations
        mockEndpoints.generateLoot.mockReturnValue('/api/loot/generate');
        mockValidateRequest.mockReturnValue({ valid: true, errors: [], fieldErrors: {} });
        mockValidateResponse.mockReturnValue({ valid: true, errors: [], fieldErrors: {} });
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('generateLoot', () => {
        it('should successfully generate loot for valid request', async () => {
            // Arrange
            mockHttpClient.post.mockResolvedValue({
                data: mockSuccessResponse,
                status: 200,
                statusText: 'OK',
                headers: {}
            });

            // Act
            const result = await generateLoot(validOptions);

            // Assert
            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockSuccessResponse);
            expect(typeof result.responseTime).toBe('number');
            expect(result.error).toBeUndefined();

            // Verify API call
            expect(mockHttpClient.post).toHaveBeenCalledWith(
                '/api/loot/generate',
                {
                    location: 'Ubersreik barracks',
                    wealthLevel: WealthLevel.Common,
                    language: 'en',
                    sessionId: 'test-session-123'
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Verify validations were called
            expect(mockValidateRequest).toHaveBeenCalledWith(validOptions);
            expect(mockValidateResponse).toHaveBeenCalledWith(mockSuccessResponse);
        });

        it('should fail with validation error for invalid request', async () => {
            // Arrange
            const invalidOptions: LootGenerationOptions = {
                location: '', // Invalid: empty location
                wealthLevel: WealthLevel.Common,
                language: 'en',
                sessionId: 'test-session'
            };

            mockValidateRequest.mockReturnValue({
                valid: false,
                errors: ['Location cannot be empty'],
                fieldErrors: {
                    location: ['Location cannot be empty']
                }
            });

            // Act
            const result = await generateLoot(invalidOptions);

            // Assert
            expect(result.success).toBe(false);
            expect(result.error?.type).toBe('validation');
            expect(result.error?.message).toBe('Location cannot be empty');
            expect(result.error?.details?.errors).toEqual(['Location cannot be empty']);
            expect(result.error?.details?.fieldErrors).toEqual({
                location: ['Location cannot be empty']
            });

            // Verify API was not called
            expect(mockHttpClient.post).not.toHaveBeenCalled();
        });

        it('should handle cooldown error (429)', async () => {
            // Arrange - Create a mock error that matches the CooldownError interface
            const cooldownError = {
                name: 'CooldownError',
                message: 'Please wait before generating more loot',
                status: 429,
                statusText: 'Too Many Requests',
                details: {},
                remainingSeconds: 15,
                retryAfter: '2025-09-22T14:30:15Z'
            };

            mockHttpClient.post.mockRejectedValue(cooldownError);

            // Act
            const result = await generateLoot(validOptions);

            // Assert
            expect(result.success).toBe(false);
            expect(result.error?.type).toBe('cooldown');
            expect(result.error?.remainingSeconds).toBe(15);
            expect(result.error?.retryAfter).toBe('2025-09-22T14:30:15Z');
        });

        it('should handle validation error (400)', async () => {
            // Arrange - Create a mock error that matches the ApiError interface  
            const validationError = {
                name: 'ApiError',
                message: 'Location description must be between 1 and 200 characters',
                status: 400,
                statusText: 'Bad Request',
                details: { field: 'location', value: '' }
            };

            mockHttpClient.post.mockRejectedValue(validationError);

            // Act
            const result = await generateLoot(validOptions);

            // Assert
            expect(result.success).toBe(false);
            expect(result.error?.type).toBe('validation');
            expect(result.error?.details).toEqual({ field: 'location', value: '' });
        });

        it('should handle server error (500)', async () => {
            // Arrange - Create a mock error that matches the ApiError interface
            const serverError = {
                name: 'ApiError',
                message: 'OpenAI service unavailable',
                status: 500,
                statusText: 'Internal Server Error',
                details: {}
            };

            mockHttpClient.post.mockRejectedValue(serverError);

            // Act
            const result = await generateLoot(validOptions);

            // Assert
            expect(result.success).toBe(false);
            expect(result.error?.type).toBe('server');
            expect(typeof result.error?.message).toBe('string');
        });

        it('should handle timeout error', async () => {
            // Arrange - Create a mock error that matches the TimeoutError interface
            const timeoutError = {
                name: 'TimeoutError',
                message: 'Request timeout after 5000ms',
                timeout: 5000
            };

            mockHttpClient.post.mockRejectedValue(timeoutError);

            // Act
            const result = await generateLoot(validOptions);

            // Assert
            expect(result.success).toBe(false);
            expect(result.error?.type).toBe('timeout');
            expect(result.error?.details?.timeout).toBe(5000);
        });

        it('should handle network error', async () => {
            // Arrange
            const networkError = new Error('Network connection failed');
            mockHttpClient.post.mockRejectedValue(networkError);

            // Act
            const result = await generateLoot(validOptions);

            // Assert
            expect(result.success).toBe(false);
            expect(result.error?.type).toBe('network');
            expect(result.error?.message).toBe('Network connection failed');
        });

        it('should handle invalid response format', async () => {
            // Arrange
            mockHttpClient.post.mockResolvedValue({
                data: mockSuccessResponse,
                status: 200,
                statusText: 'OK',
                headers: {}
            });

            mockValidateResponse.mockReturnValue({
                valid: false,
                errors: ['Items array must contain 4-6 items'],
                fieldErrors: {}
            });

            // Act
            const result = await generateLoot(validOptions);

            // Assert
            expect(result.success).toBe(false);
            expect(result.error?.type).toBe('server');
            expect(result.error?.message).toBe('Invalid response format from server');
            expect(result.error?.details?.errors).toEqual(['Items array must contain 4-6 items']);
            expect(result.error?.details?.rawResponse).toEqual(mockSuccessResponse);
        });

        it('should trim location in request', async () => {
            // Arrange
            const optionsWithSpaces: LootGenerationOptions = {
                ...validOptions,
                location: '  Ubersreik barracks  '
            };

            mockHttpClient.post.mockResolvedValue({
                data: mockSuccessResponse,
                status: 200,
                statusText: 'OK',
                headers: {}
            });

            // Act
            await generateLoot(optionsWithSpaces);

            // Assert
            expect(mockHttpClient.post).toHaveBeenCalledWith(
                '/api/loot/generate',
                expect.objectContaining({
                    location: 'Ubersreik barracks' // Should be trimmed
                }),
                expect.anything()
            );
        });
    });

    describe('validateGenerationRequest', () => {
        it('should validate correct request', () => {
            const result = validateGenerationRequest(validOptions);

            expect(result.valid).toBe(true);
            expect(result.errors).toEqual([]);
            expect(result.fieldErrors).toEqual({});
        });

        it('should fail for empty location', () => {
            const options = { ...validOptions, location: '   ' }; // Spaces that trim to empty
            const result = validateGenerationRequest(options);

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Location cannot be empty');
            expect(result.fieldErrors.location).toContain('Location cannot be empty');
        });

        it('should fail for missing location', () => {
            const options = { ...validOptions, location: undefined as any }; // Actually missing
            const result = validateGenerationRequest(options);

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Location is required');
            expect(result.fieldErrors.location).toContain('Location is required');
        });

        it('should fail for location too long', () => {
            const options = { ...validOptions, location: 'a'.repeat(201) };
            const result = validateGenerationRequest(options);

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Location must be 200 characters or less');
            expect(result.fieldErrors.location).toContain('Location must be 200 characters or less');
        });

        it('should fail for invalid wealth level', () => {
            const options = { ...validOptions, wealthLevel: 'Invalid' as WealthLevel };
            const result = validateGenerationRequest(options);

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Valid wealth level is required (Rubbish, Poor, Common, Wealthy, Noble)');
            expect(result.fieldErrors.wealthLevel).toContain('Valid wealth level is required (Rubbish, Poor, Common, Wealthy, Noble)');
        });

        it('should fail for invalid language', () => {
            const options = { ...validOptions, language: 'fr' as any };
            const result = validateGenerationRequest(options);

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Valid language is required (en, pl)');
            expect(result.fieldErrors.language).toContain('Valid language is required (en, pl)');
        });

        it('should fail for empty session ID', () => {
            const options = { ...validOptions, sessionId: '' };
            const result = validateGenerationRequest(options);

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Session ID is required');
            expect(result.fieldErrors.sessionId).toContain('Session ID is required');
        });

        it('should collect multiple validation errors', () => {
            const options = {
                location: '',
                wealthLevel: 'Invalid' as WealthLevel,
                language: 'fr' as any,
                sessionId: ''
            };
            const result = validateGenerationRequest(options);

            expect(result.valid).toBe(false);
            expect(result.errors).toHaveLength(4);
            expect(Object.keys(result.fieldErrors)).toHaveLength(4);
        });
    });

    describe('getCooldownRemaining', () => {
        it('should return 0 when cooldown has expired', () => {
            const lastGeneration = Date.now() - 35000; // 35 seconds ago
            const remaining = getCooldownRemaining(lastGeneration, 30000);

            expect(remaining).toBe(0);
        });

        it('should return remaining time when cooldown is active', () => {
            const lastGeneration = Date.now() - 15000; // 15 seconds ago
            const remaining = getCooldownRemaining(lastGeneration, 30000);

            expect(remaining).toBeGreaterThan(14000);
            expect(remaining).toBeLessThanOrEqual(15000);
        });

        it('should use default cooldown duration', () => {
            const lastGeneration = Date.now() - 15000; // 15 seconds ago
            const remaining = getCooldownRemaining(lastGeneration);

            expect(remaining).toBeGreaterThan(14000);
            expect(remaining).toBeLessThanOrEqual(15000);
        });
    });

    describe('formatCooldownTime', () => {
        it('should format seconds only', () => {
            expect(formatCooldownTime(15000)).toBe('15s');
            expect(formatCooldownTime(1000)).toBe('1s');
            expect(formatCooldownTime(59000)).toBe('59s');
        });

        it('should format minutes and seconds', () => {
            expect(formatCooldownTime(65000)).toBe('1m 5s');
            expect(formatCooldownTime(125000)).toBe('2m 5s');
        });

        it('should format minutes only when no remaining seconds', () => {
            expect(formatCooldownTime(60000)).toBe('1m');
            expect(formatCooldownTime(120000)).toBe('2m');
        });

        it('should handle zero or negative time', () => {
            expect(formatCooldownTime(0)).toBe('0s');
            expect(formatCooldownTime(-1000)).toBe('0s');
        });
    });
});