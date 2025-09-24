/**
 * Unit tests for useFormValidation hook
 */

import { renderHook, act } from '@testing-library/react';
import { useFormValidation } from '../../src/hooks/useFormValidation';
import { WealthLevel } from '../../src/types';

// Mock react-i18next
const mockT = jest.fn((key: string) => key);
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: mockT,
    }),
}));

// Mock validation service  
jest.mock('../../src/services/validation', () => ({
    validateGenerationRequest: jest.fn(),
}));

// Import the mocked function
import { validateGenerationRequest } from '../../src/services/validation';
const mockValidateGenerationRequest = validateGenerationRequest as jest.MockedFunction<typeof validateGenerationRequest>;

describe('useFormValidation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();

        // Default successful validation
        mockValidateGenerationRequest.mockResolvedValue({
            valid: true,
            errors: [],
            fieldErrors: {},
        });
    });

    describe('initialization', () => {
        it('should initialize with default values', () => {
            const { result } = renderHook(() => useFormValidation());

            expect(result.current.state.isValid).toBe(false);
            expect(result.current.state.isDirty).toBe(false);
            expect(result.current.state.isValidating).toBe(false);
            expect(result.current.values).toEqual({});

            // Check default field states
            Object.values(result.current.state.fields).forEach(field => {
                expect(field.touched).toBe(false);
                expect(field.error).toBeNull();
                expect(field.isValid).toBe(false);
                expect(field.isPending).toBe(false);
            });
        });

        it('should initialize with provided initial values', () => {
            const initialValues = {
                location: 'Test Location',
                wealthLevel: WealthLevel.Common,
                language: 'en' as const,
                sessionId: 'test-session',
            };

            const { result } = renderHook(() =>
                useFormValidation({ initialValues })
            );

            expect(result.current.values).toEqual(initialValues);
        });
    });

    describe('setValue and setValues', () => {
        it('should update single field value', () => {
            const { result } = renderHook(() => useFormValidation());

            act(() => {
                result.current.setValue('location', 'New Location');
            });

            expect(result.current.values.location).toBe('New Location');
            expect(result.current.state.isDirty).toBe(true);
        });

        it('should update multiple field values', () => {
            const { result } = renderHook(() => useFormValidation());

            const newValues = {
                location: 'Test Location',
                wealthLevel: WealthLevel.Wealthy,
            };

            act(() => {
                result.current.setValues(newValues);
            });

            expect(result.current.values.location).toBe('Test Location');
            expect(result.current.values.wealthLevel).toBe(WealthLevel.Wealthy);
            expect(result.current.state.isDirty).toBe(true);
        });

        it('should trigger validation on change when enabled', () => {
            jest.useFakeTimers();

            const { result } = renderHook(() =>
                useFormValidation({ validateOnChange: true, debounceMs: 100 })
            );

            // Set required fields first
            act(() => {
                result.current.setValues({
                    location: 'Initial',
                    wealthLevel: WealthLevel.Common,
                    language: 'en' as const,
                    sessionId: 'test-session',
                });
            });

            // Clear the mock to ignore the above setValues call
            mockValidateGenerationRequest.mockClear();

            act(() => {
                result.current.setValue('location', 'Test Location');
            });

            // Fast forward debounce timer
            act(() => {
                jest.advanceTimersByTime(100);
            });

            expect(mockValidateGenerationRequest).toHaveBeenCalled();

            jest.useRealTimers();
        });

        it('should not trigger validation on change when disabled', () => {
            const { result } = renderHook(() =>
                useFormValidation({ validateOnChange: false })
            );

            act(() => {
                result.current.setValue('location', 'Test Location');
            });

            expect(mockValidateGenerationRequest).not.toHaveBeenCalled();
        });
    });

    describe('field touched state', () => {
        it('should mark field as touched', () => {
            const { result } = renderHook(() => useFormValidation());

            act(() => {
                result.current.setFieldTouched('location', true);
            });

            expect(result.current.state.fields.location.touched).toBe(true);
            expect(result.current.state.isDirty).toBe(true);
        });

        it('should mark all fields as touched', () => {
            const { result } = renderHook(() => useFormValidation());

            act(() => {
                result.current.setAllTouched();
            });

            Object.values(result.current.state.fields).forEach(field => {
                expect(field.touched).toBe(true);
            });
            expect(result.current.state.isDirty).toBe(true);
        });

        it('should trigger validation on blur when enabled', () => {
            jest.useFakeTimers();

            const { result } = renderHook(() =>
                useFormValidation({ validateOnBlur: true })
            );

            act(() => {
                result.current.setValues({
                    location: 'Test Location',
                    wealthLevel: WealthLevel.Common,
                    language: 'en' as const,
                    sessionId: 'test-session',
                });
            });

            // Clear the mock to ignore the above setValues call
            mockValidateGenerationRequest.mockClear();

            act(() => {
                result.current.setFieldTouched('location', true);
            });

            expect(mockValidateGenerationRequest).toHaveBeenCalled();

            jest.useRealTimers();
        });
    });

    describe('form validation', () => {
        it('should validate entire form successfully', async () => {
            mockValidateGenerationRequest.mockResolvedValue({
                valid: true,
                errors: [],
                fieldErrors: {},
            });

            const { result } = renderHook(() => useFormValidation());

            act(() => {
                result.current.setValues({
                    location: 'Valid Location',
                    wealthLevel: WealthLevel.Common,
                    language: 'en' as const,
                    sessionId: 'valid-session',
                });
            });

            let validationResult: any;
            await act(async () => {
                validationResult = await result.current.validateForm();
            });

            expect(validationResult.valid).toBe(true);
            expect(result.current.state.isValid).toBe(true);
            expect(result.current.state.isValidating).toBe(false);
        });

        it('should validate form with errors', async () => {
            mockValidateGenerationRequest.mockResolvedValue({
                valid: false,
                errors: ['Form is invalid'],
                fieldErrors: {
                    location: ['Location is required'],
                    wealthLevel: ['Wealth level is invalid'],
                },
            });

            const { result } = renderHook(() => useFormValidation());

            // Set some values to trigger validation, but leave location empty to trigger the error
            act(() => {
                result.current.setValues({
                    location: '', // Empty location should trigger "Location is required"
                    wealthLevel: WealthLevel.Common, // This value should trigger "Wealth level is invalid" according to mock
                    language: 'en' as const,
                    sessionId: 'test-session',
                });
            });

            let validationResult;
            await act(async () => {
                validationResult = await result.current.validateForm();
            });

            expect(validationResult!.valid).toBe(false);
            expect(result.current.state.isValid).toBe(false);
            expect(result.current.state.fields.location.error).toBe('Location is required');
            expect(result.current.state.fields.wealthLevel.error).toBe('Wealth level is invalid');
            expect(result.current.state.formErrors).toContain('Form is invalid');
        });

        it('should validate specific field', async () => {
            mockValidateGenerationRequest.mockResolvedValue({
                valid: false,
                errors: [],
                fieldErrors: {
                    location: ['Location is too short'],
                },
            });

            const { result } = renderHook(() => useFormValidation());

            act(() => {
                result.current.setValues({
                    location: 'x',
                    wealthLevel: WealthLevel.Common,
                    language: 'en' as const,
                    sessionId: 'test-session',
                });
            });

            let isValid;
            await act(async () => {
                isValid = await result.current.validateField('location');
            });

            expect(isValid).toBe(false);
            expect(result.current.state.fields.location.error).toBe('Location is too short');
        });

        it('should handle validation errors gracefully', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
            mockValidateGenerationRequest.mockRejectedValue(new Error('Validation failed'));

            const { result } = renderHook(() => useFormValidation());

            // Set values first to avoid missing required fields error
            act(() => {
                result.current.setValues({
                    location: 'Test Location',
                    wealthLevel: WealthLevel.Common,
                    language: 'en' as const,
                    sessionId: 'test-session',
                });
            });

            let validationResult;
            await act(async () => {
                validationResult = await result.current.validateForm();
            });

            expect(validationResult!.valid).toBe(false);
            expect(result.current.state.formErrors).toContain('validation.unexpected_error');
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Form validation error:',
                expect.any(Error)
            );

            consoleErrorSpy.mockRestore();
        });
    });

    describe('utility methods', () => {
        it('should get field error', () => {
            const { result } = renderHook(() => useFormValidation());

            // Set an error state
            act(() => {
                result.current.setValue('location', 'x');
                // Simulate validation setting error
                result.current.state.fields.location.error = 'Too short';
            });

            expect(result.current.getFieldError('location')).toBe('Too short');
        });

        it('should determine when to show error', async () => {
            const { result } = renderHook(() => useFormValidation());

            // First, set up values that will trigger field error during validation
            mockValidateGenerationRequest.mockResolvedValue({
                valid: false,
                errors: [],
                fieldErrors: {
                    location: ['Error message'],
                },
            });

            act(() => {
                result.current.setValues({
                    location: 'test',
                    wealthLevel: WealthLevel.Common,
                    language: 'en' as const,
                    sessionId: 'test-session',
                });
            });

            // Validate to get the error
            await act(async () => {
                await result.current.validateForm();
            });

            // Field with error but not touched - should not show
            expect(result.current.shouldShowError('location')).toBe(false);

            // Field with error and touched - should show
            act(() => {
                result.current.setFieldTouched('location', true);
            });

            expect(result.current.shouldShowError('location')).toBe(true);
        });

        it('should clear all errors', () => {
            const { result } = renderHook(() => useFormValidation());

            // Set some error states
            act(() => {
                result.current.state.fields.location.error = 'Location error';
                result.current.state.fields.wealthLevel.error = 'Wealth error';
                result.current.state.formErrors = ['General error'];
            });

            act(() => {
                result.current.clearErrors();
            });

            Object.values(result.current.state.fields).forEach(field => {
                expect(field.error).toBeNull();
            });
            expect(result.current.state.formErrors).toEqual([]);
        });

        it('should reset form to initial state', () => {
            const initialValues = {
                location: 'Initial Location',
                wealthLevel: WealthLevel.Wealthy,
            };

            const { result } = renderHook(() =>
                useFormValidation({ initialValues })
            );

            // Make changes
            act(() => {
                result.current.setValue('location', 'Changed Location');
                result.current.setFieldTouched('location', true);
            });

            expect(result.current.values.location).toBe('Changed Location');
            expect(result.current.state.isDirty).toBe(true);

            // Reset
            act(() => {
                result.current.reset();
            });

            expect(result.current.values.location).toBe('Initial Location');
            expect(result.current.state.isDirty).toBe(false);
            expect(result.current.state.fields.location.touched).toBe(false);
        });
    });

    describe('debouncing', () => {
        it('should debounce validation calls', () => {
            jest.useFakeTimers();

            const { result } = renderHook(() =>
                useFormValidation({
                    validateOnChange: true,
                    debounceMs: 500
                })
            );

            // Set up initial required fields
            act(() => {
                result.current.setValues({
                    location: 'initial',
                    wealthLevel: WealthLevel.Common,
                    language: 'en' as const,
                    sessionId: 'test-session',
                });
            });

            // Clear the mock to ignore the above setValues call
            mockValidateGenerationRequest.mockClear();

            // Make rapid changes
            act(() => {
                result.current.setValue('location', 'a');
            });

            act(() => {
                result.current.setValue('location', 'ab');
            });

            act(() => {
                result.current.setValue('location', 'abc');
            });

            // Validation should not have been called yet
            expect(mockValidateGenerationRequest).not.toHaveBeenCalled();

            // Fast forward past debounce delay
            act(() => {
                jest.advanceTimersByTime(500);
            });

            // Should have been called only once with final value
            expect(mockValidateGenerationRequest).toHaveBeenCalledTimes(1);

            jest.useRealTimers();
        });

        it('should use custom debounce delay', () => {
            jest.useFakeTimers();

            const { result } = renderHook(() =>
                useFormValidation({
                    validateOnChange: true,
                    debounceMs: 200
                })
            );

            // Set up initial required fields
            act(() => {
                result.current.setValues({
                    location: 'initial',
                    wealthLevel: WealthLevel.Common,
                    language: 'en' as const,
                    sessionId: 'test-session',
                });
            });

            // Clear the mock to ignore the above setValues call
            mockValidateGenerationRequest.mockClear();

            act(() => {
                result.current.setValue('location', 'test');
            });

            // Should not validate before delay
            act(() => {
                jest.advanceTimersByTime(100);
            });
            expect(mockValidateGenerationRequest).not.toHaveBeenCalled();

            // Should validate after delay
            act(() => {
                jest.advanceTimersByTime(100);
            });
            expect(mockValidateGenerationRequest).toHaveBeenCalled();

            jest.useRealTimers();
        });
    });
});