/**
 * Unit tests for Validation Service
 * Tests for Task T029 - Request/response validation for API services
 * 
 * Comprehensive test coverage for all validation functions,
 * including request validation, response validation, error handling,
 * and utility functions.
 */

import { describe, it, expect } from '@jest/globals';
import {
    validateGenerationRequest,
    validateGenerationResponse,
    validateHealthResponse,
    validateErrorResponse,
    validateCooldownErrorResponse,
    validateLootItem,
    validateApiResponse,
    formatValidationErrors,
    getFieldErrors,
    hasFieldError,
    createValidationResult,
    addValidationError
} from '../../src/services/validation';
import { WealthLevel } from '../../src/types/index';

describe('Validation Service', () => {
    describe('createValidationResult', () => {
        it('should create valid result by default', () => {
            const result = createValidationResult();

            expect(result.valid).toBe(true);
            expect(result.errors).toEqual([]);
            expect(result.fieldErrors).toEqual({});
        });

        it('should create custom validation result', () => {
            const result = createValidationResult(
                false,
                ['Error 1', 'Error 2'],
                { field1: ['Field error'] }
            );

            expect(result.valid).toBe(false);
            expect(result.errors).toEqual(['Error 1', 'Error 2']);
            expect(result.fieldErrors).toEqual({ field1: ['Field error'] });
        });
    });

    describe('addValidationError', () => {
        it('should add error without field', () => {
            const result = createValidationResult();
            addValidationError(result, 'General error');

            expect(result.valid).toBe(false);
            expect(result.errors).toEqual(['General error']);
            expect(result.fieldErrors).toEqual({});
        });

        it('should add error with field', () => {
            const result = createValidationResult();
            addValidationError(result, 'Field error', 'testField');

            expect(result.valid).toBe(false);
            expect(result.errors).toEqual(['Field error']);
            expect(result.fieldErrors.testField).toEqual(['Field error']);
        });

        it('should add multiple errors to same field', () => {
            const result = createValidationResult();
            addValidationError(result, 'Error 1', 'testField');
            addValidationError(result, 'Error 2', 'testField');

            expect(result.fieldErrors.testField).toEqual(['Error 1', 'Error 2']);
        });
    });

    describe('validateGenerationRequest', () => {
        const validRequest = {
            location: 'Ubersreik barracks',
            wealthLevel: WealthLevel.Common,
            language: 'en',
            sessionId: 'test-session-123'
        };

        it('should validate correct request', async () => {
            const result = await validateGenerationRequest(validRequest);

            expect(result.valid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it('should fail for non-object request', async () => {
            const result = await validateGenerationRequest(null);

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Request must be an object');
        });

        it('should fail for missing location', async () => {
            const request = { ...validRequest, location: undefined };
            const result = await validateGenerationRequest(request);

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Location is required');
            expect(result.fieldErrors.location).toContain('Location is required');
        });

        it('should fail for non-string location', async () => {
            const request = { ...validRequest, location: 123 };
            const result = await validateGenerationRequest(request);

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Location must be a string');
        });

        it('should fail for empty location', async () => {
            const request = { ...validRequest, location: '   ' };
            const result = await validateGenerationRequest(request);

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Location cannot be empty');
        });

        it('should fail for location too long', async () => {
            const request = { ...validRequest, location: 'a'.repeat(201) };
            const result = await validateGenerationRequest(request);

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Location must be 200 characters or less');
        });

        it('should fail for invalid wealth level', async () => {
            const request = { ...validRequest, wealthLevel: 'Invalid' };
            const result = await validateGenerationRequest(request);

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Invalid wealth level. Must be one of: Rubbish, Poor, Common, Wealthy, Noble');
        });

        it('should fail for invalid language', async () => {
            const request = { ...validRequest, language: 'fr' };
            const result = await validateGenerationRequest(request);

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Invalid language. Must be "en" or "pl"');
        });

        it('should fail for missing session ID', async () => {
            const request = { ...validRequest, sessionId: undefined };
            const result = await validateGenerationRequest(request);

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Session ID is required');
        });

        it('should collect multiple errors', async () => {
            const request = {
                location: '',
                wealthLevel: 'Invalid',
                language: 'fr',
                sessionId: ''
            };
            const result = await validateGenerationRequest(request);

            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(3);
        });
    });

    describe('validateLootItem', () => {
        const validItem = {
            name: 'Test Item',
            description: 'A test item description',
            valueInPennies: 100,
            wealthLevel: WealthLevel.Common
        };

        it('should validate correct item', () => {
            const result = validateLootItem(validItem);

            expect(result.valid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it('should fail for non-object item', () => {
            const result = validateLootItem(null);

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Item must be an object');
        });

        it('should include item index in error messages', () => {
            const result = validateLootItem(null, 2);

            expect(result.valid).toBe(false);
            expect(result.errors[0]).toContain('Item 3:'); // Index 2 = Item 3
        });

        it('should fail for missing name', () => {
            const item = { ...validItem, name: undefined };
            const result = validateLootItem(item);

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Name is required');
        });

        it('should fail for name too short', () => {
            const item = { ...validItem, name: 'AB' };
            const result = validateLootItem(item);

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Name must be between 3 and 100 characters');
        });

        it('should fail for name too long', () => {
            const item = { ...validItem, name: 'a'.repeat(101) };
            const result = validateLootItem(item);

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Name must be between 3 and 100 characters');
        });

        it('should fail for description too long', () => {
            const item = { ...validItem, description: 'a'.repeat(501) };
            const result = validateLootItem(item);

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Description must be 500 characters or less');
        });

        it('should fail for invalid value in pennies', () => {
            const item = { ...validItem, valueInPennies: 0 };
            const result = validateLootItem(item);

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Value in pennies must be a positive integer');
        });

        it('should fail for non-integer value', () => {
            const item = { ...validItem, valueInPennies: 10.5 };
            const result = validateLootItem(item);

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Value in pennies must be a positive integer');
        });

        it('should fail for invalid wealth level', () => {
            const item = { ...validItem, wealthLevel: 'Invalid' };
            const result = validateLootItem(item);

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Invalid wealth level');
        });
    });

    describe('validateGenerationResponse', () => {
        const validResponse = {
            items: [
                {
                    name: 'Test Item 1',
                    description: 'Description 1',
                    valueInPennies: 100,
                    wealthLevel: WealthLevel.Common
                },
                {
                    name: 'Test Item 2',
                    description: 'Description 2',
                    valueInPennies: 200,
                    wealthLevel: WealthLevel.Wealthy
                },
                {
                    name: 'Test Item 3',
                    description: 'Description 3',
                    valueInPennies: 50,
                    wealthLevel: WealthLevel.Poor
                },
                {
                    name: 'Test Item 4',
                    description: 'Description 4',
                    valueInPennies: 75,
                    wealthLevel: WealthLevel.Common
                }
            ],
            generatedAt: '2025-09-22T14:30:00Z',
            cooldownExpiresAt: '2025-09-22T14:30:30Z'
        };

        it('should validate correct response', () => {
            const result = validateGenerationResponse(validResponse);

            expect(result.valid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it('should fail for non-object response', () => {
            const result = validateGenerationResponse(null);

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Response must be an object');
        });

        it('should fail for missing items array', () => {
            const response = { ...validResponse, items: undefined };
            const result = validateGenerationResponse(response);

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Items array is required');
        });

        it('should fail for non-array items', () => {
            const response = { ...validResponse, items: 'not-array' };
            const result = validateGenerationResponse(response);

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Items must be an array');
        });

        it('should fail for too few items', () => {
            const response = { ...validResponse, items: validResponse.items.slice(0, 3) };
            const result = validateGenerationResponse(response);

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Items array must contain 4-6 items');
        });

        it('should fail for too many items', () => {
            const response = {
                ...validResponse,
                items: [...validResponse.items, ...validResponse.items]
            };
            const result = validateGenerationResponse(response);

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Items array must contain 4-6 items');
        });

        it('should fail for invalid timestamp format', () => {
            const response = { ...validResponse, generatedAt: 'invalid-date' };
            const result = validateGenerationResponse(response);

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Generated timestamp must be a valid ISO date string');
        });

        it('should validate each item in the array', () => {
            const response = {
                ...validResponse,
                items: [
                    { ...validResponse.items[0], name: 'AB' }, // Too short
                    validResponse.items[1],
                    validResponse.items[2],
                    validResponse.items[3]
                ]
            };
            const result = validateGenerationResponse(response);

            expect(result.valid).toBe(false);
            expect(result.errors.some(error => error.includes('Item 1:'))).toBe(true);
        });
    });

    describe('validateHealthResponse', () => {
        const validResponse = {
            status: 'Healthy',
            timestamp: '2025-09-22T14:30:00Z',
            services: {
                openai: 'Healthy',
                qdrant: 'Healthy'
            }
        };

        it('should validate correct response', () => {
            const result = validateHealthResponse(validResponse);

            expect(result.valid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it('should fail for invalid status', () => {
            const response = { ...validResponse, status: 'Invalid' };
            const result = validateHealthResponse(response);

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Status must be one of: Healthy, Degraded, Unhealthy');
        });

        it('should fail for invalid service status', () => {
            const response = {
                ...validResponse,
                services: {
                    ...validResponse.services,
                    openai: 'Invalid'
                }
            };
            const result = validateHealthResponse(response);

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('OpenAI service status must be "Healthy" or "Unhealthy"');
        });
    });

    describe('validateErrorResponse', () => {
        const validResponse = {
            error: 'ValidationError',
            message: 'Invalid input',
            details: { field: 'location' }
        };

        it('should validate correct error response', () => {
            const result = validateErrorResponse(validResponse);

            expect(result.valid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it('should fail for missing error field', () => {
            const response = { ...validResponse, error: undefined };
            const result = validateErrorResponse(response);

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Error field is required');
        });

        it('should fail for non-string message', () => {
            const response = { ...validResponse, message: 123 };
            const result = validateErrorResponse(response);

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Message field must be a string');
        });

        it('should accept optional details', () => {
            const response = { error: 'TestError', message: 'Test message' };
            const result = validateErrorResponse(response);

            expect(result.valid).toBe(true);
        });
    });

    describe('validateCooldownErrorResponse', () => {
        const validResponse = {
            error: 'CooldownActive',
            message: 'Please wait',
            details: {},
            remainingSeconds: 15,
            retryAfter: '2025-09-22T14:30:15Z'
        };

        it('should validate correct cooldown response', () => {
            const result = validateCooldownErrorResponse(validResponse);

            expect(result.valid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it('should fail for negative remaining seconds', () => {
            const response = { ...validResponse, remainingSeconds: -1 };
            const result = validateCooldownErrorResponse(response);

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Remaining seconds must be a non-negative integer');
        });

        it('should fail for non-integer remaining seconds', () => {
            const response = { ...validResponse, remainingSeconds: 15.5 };
            const result = validateCooldownErrorResponse(response);

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Remaining seconds must be a non-negative integer');
        });

        it('should fail for invalid retry after timestamp', () => {
            const response = { ...validResponse, retryAfter: 'invalid-date' };
            const result = validateCooldownErrorResponse(response);

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Retry after timestamp must be a valid ISO date string');
        });
    });

    describe('validateApiResponse', () => {
        it('should validate generation response', () => {
            const response = {
                items: [
                    {
                        name: 'Test Item',
                        description: 'Test description',
                        valueInPennies: 100,
                        wealthLevel: WealthLevel.Common
                    },
                    {
                        name: 'Test Item 2',
                        description: 'Test description 2',
                        valueInPennies: 200,
                        wealthLevel: WealthLevel.Wealthy
                    },
                    {
                        name: 'Test Item 3',
                        description: 'Test description 3',
                        valueInPennies: 50,
                        wealthLevel: WealthLevel.Poor
                    },
                    {
                        name: 'Test Item 4',
                        description: 'Test description 4',
                        valueInPennies: 75,
                        wealthLevel: WealthLevel.Common
                    }
                ],
                generatedAt: '2025-09-22T14:30:00Z',
                cooldownExpiresAt: '2025-09-22T14:30:30Z'
            };

            // Mock the type guard to return true
            const originalIsGenerationResponse = require('../../src/types/api').isGenerationResponse;
            require('../../src/types/api').isGenerationResponse = jest.fn().mockReturnValue(true);

            const result = validateApiResponse(response, 'generation');

            expect(result.valid).toBe(true);

            // Restore original function
            require('../../src/types/api').isGenerationResponse = originalIsGenerationResponse;
        });

        it('should fail for unknown response type', () => {
            const result = validateApiResponse({}, 'unknown' as any);

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Unknown expected response type: unknown');
        });
    });

    describe('utility functions', () => {
        describe('formatValidationErrors', () => {
            it('should return empty string for valid result', () => {
                const result = createValidationResult();
                const formatted = formatValidationErrors(result);

                expect(formatted).toBe('');
            });

            it('should return single error message', () => {
                const result = createValidationResult(false, ['Single error']);
                const formatted = formatValidationErrors(result);

                expect(formatted).toBe('Single error');
            });

            it('should format multiple errors', () => {
                const result = createValidationResult(false, ['Error 1', 'Error 2']);
                const formatted = formatValidationErrors(result);

                expect(formatted).toBe('Validation failed:\n• Error 1\n• Error 2');
            });
        });

        describe('getFieldErrors', () => {
            it('should return field errors', () => {
                const result = createValidationResult();
                addValidationError(result, 'Field error', 'testField');

                const fieldErrors = getFieldErrors(result, 'testField');

                expect(fieldErrors).toEqual(['Field error']);
            });

            it('should return empty array for non-existent field', () => {
                const result = createValidationResult();

                const fieldErrors = getFieldErrors(result, 'nonExistent');

                expect(fieldErrors).toEqual([]);
            });
        });

        describe('hasFieldError', () => {
            it('should return true when field has errors', () => {
                const result = createValidationResult();
                addValidationError(result, 'Field error', 'testField');

                const hasError = hasFieldError(result, 'testField');

                expect(hasError).toBe(true);
            });

            it('should return false when field has no errors', () => {
                const result = createValidationResult();

                const hasError = hasFieldError(result, 'testField');

                expect(hasError).toBe(false);
            });
        });
    });
});