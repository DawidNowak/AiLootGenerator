/**
 * Form Validation Hook for Warhammer Fantasy Loot Generator
 * Task: T045 - Create form validation hook
 * 
 * Provides comprehensive form validation for loot generation requests.
 * Includes real-time validation, error messaging, and accessibility support.
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    validateGenerationRequest,
    ValidationResult
} from '../services/validation';
import { GenerationRequest } from '../types/api';

/**
 * Field validation state
 */
export interface FieldValidation {
    /** Whether field has been touched by user */
    touched: boolean;
    /** Current validation error (null if valid) */
    error: string | null;
    /** Whether field is currently valid */
    isValid: boolean;
    /** Whether field validation is pending */
    isPending: boolean;
}

/**
 * Form validation state
 */
export interface FormValidationState {
    /** Individual field validations */
    fields: {
        location: FieldValidation;
        wealthLevel: FieldValidation;
        language: FieldValidation;
        sessionId: FieldValidation;
    };
    /** Whether entire form is valid */
    isValid: boolean;
    /** Whether any field has been touched */
    isDirty: boolean;
    /** Whether form validation is in progress */
    isValidating: boolean;
    /** General form-level errors */
    formErrors: string[];
}

/**
 * Form validation options
 */
export interface UseFormValidationOptions {
    /** Whether to validate on field change (default: true) */
    validateOnChange?: boolean;
    /** Whether to validate on field blur (default: true) */
    validateOnBlur?: boolean;
    /** Debounce delay for validation in ms (default: 300) */
    debounceMs?: number;
    /** Initial form values */
    initialValues?: Partial<GenerationRequest>;
}

/**
 * Form validation hook return value
 */
export interface FormValidationResult {
    /** Current validation state */
    state: FormValidationState;
    /** Current form values */
    values: Partial<GenerationRequest>;
    /** Update a field value */
    setValue: (field: keyof GenerationRequest, value: any) => void;
    /** Set multiple values at once */
    setValues: (values: Partial<GenerationRequest>) => void;
    /** Mark a field as touched */
    setFieldTouched: (field: keyof GenerationRequest, touched?: boolean) => void;
    /** Mark all fields as touched */
    setAllTouched: () => void;
    /** Validate entire form */
    validateForm: () => Promise<ValidationResult>;
    /** Validate a specific field */
    validateField: (field: keyof GenerationRequest) => Promise<boolean>;
    /** Reset form to initial state */
    reset: () => void;
    /** Clear all errors */
    clearErrors: () => void;
    /** Get error message for a field */
    getFieldError: (field: keyof GenerationRequest) => string | null;
    /** Check if field should show error (touched + invalid) */
    shouldShowError: (field: keyof GenerationRequest) => boolean;
}

/**
 * Default field validation state
 */
const createDefaultFieldValidation = (): FieldValidation => ({
    touched: false,
    error: null,
    isValid: true,
    isPending: false
});

/**
 * Create initial validation state
 */
function createInitialState(): FormValidationState {
    return {
        fields: {
            location: createDefaultFieldValidation(),
            wealthLevel: createDefaultFieldValidation(),
            language: createDefaultFieldValidation(),
            sessionId: createDefaultFieldValidation()
        },
        isValid: false,
        isDirty: false,
        isValidating: false,
        formErrors: []
    };
}

/**
 * Form validation hook
 * 
 * @param options - Validation configuration
 * @returns Form validation state and controls
 * 
 * @example
 * ```typescript
 * const validation = useFormValidation({
 *   validateOnChange: true,
 *   initialValues: {
 *     location: '',
 *     wealthLevel: WealthLevel.Common,
 *     language: 'en' as Language
 *   }
 * });
 * 
 * const handleSubmit = async () => {
 *   const result = await validation.validateForm();
 *   if (result.isValid) {
 *     // Submit form
 *     await generateLoot(validation.values as GenerationRequest);
 *   }
 * };
 * 
 * return (
 *   <TextField
 *     value={validation.values.location || ''}
 *     onChange={(e) => validation.setValue('location', e.target.value)}
 *     onBlur={() => validation.setFieldTouched('location')}
 *     error={validation.shouldShowError('location')}
 *     helperText={validation.getFieldError('location')}
 *   />
 * );
 * ```
 */
export function useFormValidation(
    options: UseFormValidationOptions = {}
): FormValidationResult {
    const {
        validateOnChange = true,
        validateOnBlur = true,
        debounceMs = 300,
        initialValues = {}
    } = options;

    const { t } = useTranslation('errors');

    // State
    const [state, setState] = useState<FormValidationState>(createInitialState);
    const [values, setValues] = useState<Partial<GenerationRequest>>(initialValues);
    const [debounceTimeouts, setDebounceTimeouts] = useState<Record<string, NodeJS.Timeout>>({});

    // Clear debounce timeout for a field
    const clearDebounceTimeout = useCallback((field: string) => {
        if (debounceTimeouts[field]) {
            clearTimeout(debounceTimeouts[field]);
            setDebounceTimeouts(prev => {
                const { [field]: removed, ...rest } = prev;
                return rest;
            });
        }
    }, [debounceTimeouts]);

    // Validate a single field
    const validateSingleField = useCallback(async (
        field: keyof GenerationRequest,
        value: any
    ): Promise<boolean> => {
        setState(prev => ({
            ...prev,
            fields: {
                ...prev.fields,
                [field]: {
                    ...prev.fields[field],
                    isPending: true
                }
            }
        }));

        try {
            // Create temporary request object for validation
            const tempRequest: Partial<GenerationRequest> = {
                ...values,
                [field]: value
            };

            // Skip validation if required fields are missing
            if (!tempRequest.location || !tempRequest.wealthLevel || !tempRequest.language || !tempRequest.sessionId) {
                setState(prev => ({
                    ...prev,
                    fields: {
                        ...prev.fields,
                        [field]: {
                            ...prev.fields[field],
                            isPending: false,
                            error: null,
                            isValid: true
                        }
                    }
                }));
                return true;
            }

            const result = await validateGenerationRequest(tempRequest as GenerationRequest);

            // Extract field-specific error from fieldErrors
            let fieldError: string | null = null;
            if (!result.valid && result.fieldErrors[field]) {
                fieldError = result.fieldErrors[field][0] || null;
            }

            const isValid = fieldError === null;

            setState(prev => ({
                ...prev,
                fields: {
                    ...prev.fields,
                    [field]: {
                        ...prev.fields[field],
                        isPending: false,
                        error: fieldError,
                        isValid
                    }
                }
            }));

            return isValid;
        } catch (error) {
            setState(prev => ({
                ...prev,
                fields: {
                    ...prev.fields,
                    [field]: {
                        ...prev.fields[field],
                        isPending: false,
                        error: t('validation.unexpected_error'),
                        isValid: false
                    }
                }
            }));
            return false;
        }
    }, [values, t]);

    // Set field value with optional validation
    const setValue = useCallback(async (field: keyof GenerationRequest, value: any) => {
        setValues(prev => ({ ...prev, [field]: value }));

        // Mark form as dirty
        setState(prev => ({
            ...prev,
            isDirty: true
        }));

        // Validate on change if enabled
        if (validateOnChange) {
            // Clear existing timeout
            clearDebounceTimeout(field);

            // Set new timeout for debounced validation
            const timeout = setTimeout(() => {
                validateSingleField(field, value);
            }, debounceMs);

            setDebounceTimeouts(prev => ({
                ...prev,
                [field]: timeout
            }));
        }
    }, [validateOnChange, debounceMs, clearDebounceTimeout, validateSingleField]);

    // Set multiple values
    const setValuesMultiple = useCallback((newValues: Partial<GenerationRequest>) => {
        setValues(prev => ({ ...prev, ...newValues }));
        setState(prev => ({
            ...prev,
            isDirty: true
        }));
    }, []);

    // Mark field as touched
    const setFieldTouched = useCallback((field: keyof GenerationRequest, touched = true) => {
        setState(prev => ({
            ...prev,
            fields: {
                ...prev.fields,
                [field]: {
                    ...prev.fields[field],
                    touched
                }
            }
        }));

        // Validate on blur if enabled and field is touched
        if (validateOnBlur && touched) {
            validateSingleField(field, values[field]);
        }
    }, [validateOnBlur, validateSingleField, values]);

    // Mark all fields as touched
    const setAllTouched = useCallback(() => {
        setState(prev => ({
            ...prev,
            fields: Object.keys(prev.fields).reduce((acc, field) => ({
                ...acc,
                [field]: {
                    ...prev.fields[field as keyof typeof prev.fields],
                    touched: true
                }
            }), prev.fields)
        }));
    }, []);

    // Validate entire form
    const validateForm = useCallback(async (): Promise<ValidationResult> => {
        setState(prev => ({ ...prev, isValidating: true }));

        try {
            // Ensure all required fields are present
            if (!values.location || !values.wealthLevel || !values.language || !values.sessionId) {
                const result: ValidationResult = {
                    valid: false,
                    errors: [t('validation.missing_required_fields')],
                    fieldErrors: {}
                };

                setState(prev => ({
                    ...prev,
                    isValidating: false,
                    formErrors: result.errors
                }));

                return result;
            }

            const result = await validateGenerationRequest(values as GenerationRequest);

            // Update field-specific errors
            const fieldUpdates: Partial<FormValidationState['fields']> = {};
            Object.keys(state.fields).forEach(field => {
                const fieldKey = field as keyof typeof state.fields;
                const fieldErrorList = result.fieldErrors[field] || [];
                const error = fieldErrorList.length > 0 ? fieldErrorList[0] : null;

                fieldUpdates[fieldKey] = {
                    ...state.fields[fieldKey],
                    error,
                    isValid: error === null
                };
            });

            // Form-level errors are in the general errors array
            const formErrors = result.errors || [];

            setState(prev => ({
                ...prev,
                fields: { ...prev.fields, ...fieldUpdates },
                isValid: result.valid,
                isValidating: false,
                formErrors
            }));

            return result;
        } catch (error) {
            const errorResult: ValidationResult = {
                valid: false,
                errors: [t('validation.unexpected_error')],
                fieldErrors: {}
            };

            setState(prev => ({
                ...prev,
                isValidating: false,
                formErrors: errorResult.errors
            }));

            return errorResult;
        }
    }, [values, state.fields, t]);

    // Validate specific field
    const validateField = useCallback(async (field: keyof GenerationRequest): Promise<boolean> => {
        return validateSingleField(field, values[field]);
    }, [validateSingleField, values]);

    // Reset form
    const reset = useCallback(() => {
        // Clear all debounce timeouts
        Object.values(debounceTimeouts).forEach(timeout => clearTimeout(timeout));
        setDebounceTimeouts({});

        setValues(initialValues);
        setState(createInitialState());
    }, [debounceTimeouts, initialValues]);

    // Clear errors
    const clearErrors = useCallback(() => {
        setState(prev => ({
            ...prev,
            fields: Object.keys(prev.fields).reduce((acc, field) => ({
                ...acc,
                [field]: {
                    ...prev.fields[field as keyof typeof prev.fields],
                    error: null,
                    isValid: true
                }
            }), prev.fields),
            formErrors: []
        }));
    }, []);

    // Get field error
    const getFieldError = useCallback((field: keyof GenerationRequest): string | null => {
        return state.fields[field]?.error || null;
    }, [state.fields]);

    // Check if should show error for field
    const shouldShowError = useCallback((field: keyof GenerationRequest): boolean => {
        const fieldState = state.fields[field];
        return fieldState.touched && !fieldState.isValid;
    }, [state.fields]);

    // Update overall form validity when field states change
    const overallFormIsValid = useMemo(() => {
        return Object.values(state.fields).every(field => field.isValid) &&
            state.formErrors.length === 0;
    }, [state.fields, state.formErrors]);

    // Update state when overall validity changes
    useEffect(() => {
        setState(prev => ({
            ...prev,
            isValid: overallFormIsValid
        }));
    }, [overallFormIsValid]);

    return {
        state,
        values,
        setValue,
        setValues: setValuesMultiple,
        setFieldTouched,
        setAllTouched,
        validateForm,
        validateField,
        reset,
        clearErrors,
        getFieldError,
        shouldShowError
    };
}

export default useFormValidation;