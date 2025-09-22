/**
 * Request/Response Validation for API Services
 * Task: T029 - Add request/response validation to API services
 * 
 * Provides comprehensive validation utilities for API requests and responses
 * to ensure data integrity and type safety across all API communications.
 * Includes both client-side validation and server response validation.
 */

import {
    isErrorResponse,
    isCooldownErrorResponse,
    isHealthResponse,
    isGenerationResponse
} from '../types/api';
import { WealthLevel } from '../types/index';

/**
 * Validation result interface
 */
export interface ValidationResult {
    /** Whether validation passed */
    valid: boolean;
    /** Array of validation error messages */
    errors: string[];
    /** Field-specific errors for form handling */
    fieldErrors: Record<string, string[]>;
}

/**
 * Creates a new validation result
 */
export function createValidationResult(
    valid: boolean = true,
    errors: string[] = [],
    fieldErrors: Record<string, string[]> = {}
): ValidationResult {
    return { valid, errors, fieldErrors };
}

/**
 * Adds an error to a validation result
 */
export function addValidationError(
    result: ValidationResult,
    error: string,
    field?: string
): ValidationResult {
    result.valid = false;
    result.errors.push(error);

    if (field) {
        if (!result.fieldErrors[field]) {
            result.fieldErrors[field] = [];
        }
        result.fieldErrors[field].push(error);
    }

    return result;
}

/**
 * Request Validation Functions
 */

/**
 * Validates a generation request before sending to API
 * 
 * @param request - Generation request to validate
 * @returns Validation result with detailed error information
 */
export function validateGenerationRequest(request: any): ValidationResult {
    const result = createValidationResult();

    // Check if request is an object
    if (!request || typeof request !== 'object') {
        return addValidationError(result, 'Request must be an object');
    }

    // Validate location
    if (!request.location) {
        addValidationError(result, 'Location is required', 'location');
    } else if (typeof request.location !== 'string') {
        addValidationError(result, 'Location must be a string', 'location');
    } else {
        const trimmedLocation = request.location.trim();
        if (trimmedLocation.length === 0) {
            addValidationError(result, 'Location cannot be empty', 'location');
        } else if (trimmedLocation.length > 200) {
            addValidationError(result, 'Location must be 200 characters or less', 'location');
        }
    }

    // Validate wealth level
    if (!request.wealthLevel) {
        addValidationError(result, 'Wealth level is required', 'wealthLevel');
    } else if (!Object.values(WealthLevel).includes(request.wealthLevel)) {
        addValidationError(result, 'Invalid wealth level. Must be one of: Rubbish, Poor, Common, Wealthy, Noble', 'wealthLevel');
    }

    // Validate language
    if (!request.language) {
        addValidationError(result, 'Language is required', 'language');
    } else if (!['en', 'pl'].includes(request.language)) {
        addValidationError(result, 'Invalid language. Must be "en" or "pl"', 'language');
    }

    // Validate session ID
    if (!request.sessionId) {
        addValidationError(result, 'Session ID is required', 'sessionId');
    } else if (typeof request.sessionId !== 'string') {
        addValidationError(result, 'Session ID must be a string', 'sessionId');
    } else if (request.sessionId.trim().length === 0) {
        addValidationError(result, 'Session ID cannot be empty', 'sessionId');
    }

    return result;
}

/**
 * Response Validation Functions
 */

/**
 * Validates a loot item object
 * 
 * @param item - Loot item to validate
 * @param index - Item index for error reporting
 * @returns Validation result
 */
export function validateLootItem(item: any, index?: number): ValidationResult {
    const result = createValidationResult();
    const prefix = index !== undefined ? `Item ${index + 1}: ` : '';

    if (!item || typeof item !== 'object') {
        return addValidationError(result, `${prefix}Item must be an object`);
    }

    // Validate name
    if (!item.name) {
        addValidationError(result, `${prefix}Name is required`);
    } else if (typeof item.name !== 'string') {
        addValidationError(result, `${prefix}Name must be a string`);
    } else if (item.name.length < 3 || item.name.length > 100) {
        addValidationError(result, `${prefix}Name must be between 3 and 100 characters`);
    }

    // Validate description
    if (!item.description) {
        addValidationError(result, `${prefix}Description is required`);
    } else if (typeof item.description !== 'string') {
        addValidationError(result, `${prefix}Description must be a string`);
    } else if (item.description.length > 500) {
        addValidationError(result, `${prefix}Description must be 500 characters or less`);
    }

    // Validate value in pennies
    if (item.valueInPennies === undefined || item.valueInPennies === null) {
        addValidationError(result, `${prefix}Value in pennies is required`);
    } else if (!Number.isInteger(item.valueInPennies) || item.valueInPennies < 1) {
        addValidationError(result, `${prefix}Value in pennies must be a positive integer`);
    }

    // Validate wealth level
    if (!item.wealthLevel) {
        addValidationError(result, `${prefix}Wealth level is required`);
    } else if (!Object.values(WealthLevel).includes(item.wealthLevel)) {
        addValidationError(result, `${prefix}Invalid wealth level`);
    }

    return result;
}

/**
 * Validates a generation response from the API
 * 
 * @param response - Generation response to validate
 * @returns Validation result
 */
export function validateGenerationResponse(response: any): ValidationResult {
    const result = createValidationResult();

    if (!response || typeof response !== 'object') {
        return addValidationError(result, 'Response must be an object');
    }

    // Validate items array
    if (!response.items) {
        addValidationError(result, 'Items array is required');
    } else if (!Array.isArray(response.items)) {
        addValidationError(result, 'Items must be an array');
    } else {
        if (response.items.length < 4 || response.items.length > 6) {
            addValidationError(result, 'Items array must contain 4-6 items');
        }

        // Validate each item
        response.items.forEach((item: any, index: number) => {
            const itemValidation = validateLootItem(item, index);
            if (!itemValidation.valid) {
                itemValidation.errors.forEach(error => addValidationError(result, error));
            }
        });
    }

    // Validate generatedAt timestamp
    if (!response.generatedAt) {
        addValidationError(result, 'Generated timestamp is required');
    } else if (typeof response.generatedAt !== 'string') {
        addValidationError(result, 'Generated timestamp must be a string');
    } else {
        const timestamp = new Date(response.generatedAt);
        if (isNaN(timestamp.getTime())) {
            addValidationError(result, 'Generated timestamp must be a valid ISO date string');
        }
    }

    // Validate cooldownExpiresAt timestamp
    if (!response.cooldownExpiresAt) {
        addValidationError(result, 'Cooldown expiration timestamp is required');
    } else if (typeof response.cooldownExpiresAt !== 'string') {
        addValidationError(result, 'Cooldown expiration timestamp must be a string');
    } else {
        const timestamp = new Date(response.cooldownExpiresAt);
        if (isNaN(timestamp.getTime())) {
            addValidationError(result, 'Cooldown expiration timestamp must be a valid ISO date string');
        }
    }

    return result;
}

/**
 * Validates a health response from the API
 * 
 * @param response - Health response to validate
 * @returns Validation result
 */
export function validateHealthResponse(response: any): ValidationResult {
    const result = createValidationResult();

    if (!response || typeof response !== 'object') {
        return addValidationError(result, 'Response must be an object');
    }

    // Validate status
    const validStatuses = ['Healthy', 'Degraded', 'Unhealthy'];
    if (!response.status) {
        addValidationError(result, 'Status is required');
    } else if (!validStatuses.includes(response.status)) {
        addValidationError(result, 'Status must be one of: Healthy, Degraded, Unhealthy');
    }

    // Validate timestamp
    if (!response.timestamp) {
        addValidationError(result, 'Timestamp is required');
    } else if (typeof response.timestamp !== 'string') {
        addValidationError(result, 'Timestamp must be a string');
    } else {
        const timestamp = new Date(response.timestamp);
        if (isNaN(timestamp.getTime())) {
            addValidationError(result, 'Timestamp must be a valid ISO date string');
        }
    }

    // Validate services
    if (!response.services) {
        addValidationError(result, 'Services object is required');
    } else if (typeof response.services !== 'object') {
        addValidationError(result, 'Services must be an object');
    } else {
        // Validate OpenAI service status
        if (response.services.openai && !['Healthy', 'Unhealthy'].includes(response.services.openai)) {
            addValidationError(result, 'OpenAI service status must be "Healthy" or "Unhealthy"');
        }

        // Validate Qdrant service status
        if (response.services.qdrant && !['Healthy', 'Unhealthy'].includes(response.services.qdrant)) {
            addValidationError(result, 'Qdrant service status must be "Healthy" or "Unhealthy"');
        }
    }

    return result;
}

/**
 * Validates an error response from the API
 * 
 * @param response - Error response to validate
 * @returns Validation result
 */
export function validateErrorResponse(response: any): ValidationResult {
    const result = createValidationResult();

    if (!response || typeof response !== 'object') {
        return addValidationError(result, 'Response must be an object');
    }

    // Validate error field
    if (!response.error) {
        addValidationError(result, 'Error field is required');
    } else if (typeof response.error !== 'string') {
        addValidationError(result, 'Error field must be a string');
    }

    // Validate message field
    if (!response.message) {
        addValidationError(result, 'Message field is required');
    } else if (typeof response.message !== 'string') {
        addValidationError(result, 'Message field must be a string');
    }

    // Details field is optional but must be an object if present
    if (response.details && typeof response.details !== 'object') {
        addValidationError(result, 'Details field must be an object');
    }

    return result;
}

/**
 * Validates a cooldown error response from the API
 * 
 * @param response - Cooldown error response to validate
 * @returns Validation result
 */
export function validateCooldownErrorResponse(response: any): ValidationResult {
    const result = validateErrorResponse(response);

    if (!result.valid) {
        return result; // Return early if basic error validation failed
    }

    // Validate remainingSeconds
    if (response.remainingSeconds === undefined || response.remainingSeconds === null) {
        addValidationError(result, 'Remaining seconds is required');
    } else if (!Number.isInteger(response.remainingSeconds) || response.remainingSeconds < 0) {
        addValidationError(result, 'Remaining seconds must be a non-negative integer');
    }

    // Validate retryAfter
    if (!response.retryAfter) {
        addValidationError(result, 'Retry after timestamp is required');
    } else if (typeof response.retryAfter !== 'string') {
        addValidationError(result, 'Retry after timestamp must be a string');
    } else {
        const timestamp = new Date(response.retryAfter);
        if (isNaN(timestamp.getTime())) {
            addValidationError(result, 'Retry after timestamp must be a valid ISO date string');
        }
    }

    return result;
}

/**
 * Generic API response validator that uses type guards and specific validators
 * 
 * @param response - Any API response to validate
 * @param expectedType - Expected response type for validation
 * @returns Validation result
 */
export function validateApiResponse(
    response: any,
    expectedType: 'generation' | 'health' | 'error' | 'cooldown'
): ValidationResult {
    if (!response) {
        return addValidationError(createValidationResult(), 'Response is required');
    }

    switch (expectedType) {
        case 'generation':
            if (isGenerationResponse(response)) {
                return validateGenerationResponse(response);
            } else {
                return addValidationError(createValidationResult(), 'Response does not match generation response structure');
            }

        case 'health':
            if (isHealthResponse(response)) {
                return validateHealthResponse(response);
            } else {
                return addValidationError(createValidationResult(), 'Response does not match health response structure');
            }

        case 'error':
            if (isErrorResponse(response)) {
                return validateErrorResponse(response);
            } else {
                return addValidationError(createValidationResult(), 'Response does not match error response structure');
            }

        case 'cooldown':
            if (isCooldownErrorResponse(response)) {
                return validateCooldownErrorResponse(response);
            } else {
                return addValidationError(createValidationResult(), 'Response does not match cooldown error response structure');
            }

        default:
            return addValidationError(createValidationResult(), `Unknown expected response type: ${expectedType}`);
    }
}

/**
 * Utility function to format validation errors for user display
 * 
 * @param result - Validation result to format
 * @returns Formatted error message string
 */
export function formatValidationErrors(result: ValidationResult): string {
    if (result.valid) {
        return '';
    }

    if (result.errors.length === 1) {
        return result.errors[0];
    }

    return `Validation failed:\n• ${result.errors.join('\n• ')}`;
}

/**
 * Utility function to get field-specific error messages
 * 
 * @param result - Validation result to extract field errors from
 * @param field - Field name to get errors for
 * @returns Array of error messages for the field
 */
export function getFieldErrors(result: ValidationResult, field: string): string[] {
    return result.fieldErrors[field] || [];
}

/**
 * Utility function to check if a specific field has errors
 * 
 * @param result - Validation result to check
 * @param field - Field name to check for errors
 * @returns True if the field has validation errors
 */
export function hasFieldError(result: ValidationResult, field: string): boolean {
    return !!(result.fieldErrors[field] && result.fieldErrors[field].length > 0);
}