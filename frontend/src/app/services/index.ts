/**
 * Barrel export for all Angular services.
 * Makes importing services easier throughout the application.
 */

// Services
export { HttpClientService } from './http-client.service';
export { LootApiService } from './loot-api.service';
export { SessionService } from './session.service';
export { CurrencyService } from './currency.service';

// Types (using export type for isolatedModules compatibility)
export type { LootGenerationResponse, HealthCheckResponse, ApiErrorResponse } from './loot-api.service';
export type { SessionData, CooldownStatus } from './session.service';
export type { CurrencyBreakdown, CurrencyDisplayOptions } from './currency.service';