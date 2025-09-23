/**
 * Hooks Index - Re-exports all custom hooks
 * Provides convenient single import point for all hooks
 */

export { useCountdown } from './useCountdown';
export type { UseCountdownOptions, CountdownResult } from './useCountdown';

export { useCooldown } from './useCooldown';
export type {
    CooldownState,
    UseCooldownOptions,
    CooldownResult
} from './useCooldown';

export { useFormValidation } from './useFormValidation';
export type {
    FieldValidation,
    FormValidationState,
    UseFormValidationOptions,
    FormValidationResult
} from './useFormValidation';

export { useLootGeneration } from './useLootGeneration';
export type {
    GenerationState,
    UseLootGenerationOptions,
    LootGenerationResult
} from './useLootGeneration';

export { useLanguage } from './useLanguage';
export type {
    LanguageState,
    UseLanguageOptions,
    LanguageResult
} from './useLanguage';