import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { HttpClientService } from './http-client.service';
import { LootItem } from '../models/loot-item.interface';
import { GenerationRequest } from '../models/generation-request.interface';
import { WealthLevel } from '../models/wealth-level.enum';
import { environment } from '../../environments/environment';

/**
 * Response model for the loot generation API endpoint.
 */
export interface LootGenerationResponse {
    items: LootItem[];
    sessionId: string;
    cooldownExpiresAt: string;
    totalItems: number;
}

/**
 * Response model for the health check API endpoint.
 */
export interface HealthCheckResponse {
    status: string;
    timestamp: string;
    version: string;
    services: {
        openai: string;
        qdrant: string;
    };
}

/**
 * Error response model from the API.
 */
export interface ApiErrorResponse {
    message: string;
    code: string;
    details?: any;
    timestamp: string;
    traceId?: string;
}

/**
 * Service for interacting with the loot generation API.
 * Handles all communication with the backend ASP.NET Core API.
 */
@Injectable({
    providedIn: 'root'
})
export class LootApiService {
    private readonly endpoints = {
        generateLoot: 'loot/generate',
        health: 'health'
    };

    constructor(private httpClient: HttpClientService) { }

    /**
     * Generates loot items based on the provided request parameters.
     * @param request - The generation request with location, wealth level, language, and session ID
     * @returns Observable of the loot generation response
     */
    generateLoot(request: GenerationRequest): Observable<LootGenerationResponse> {
        // Validate request before sending
        this.validateGenerationRequest(request);

        if (environment.enableLogging && !environment.production) {
            console.log('Generating loot with request:', {
                location: request.location,
                wealthLevel: WealthLevel[request.wealthLevel],
                language: request.language,
                sessionId: request.sessionId
            });
        }

        return this.httpClient.post<LootGenerationResponse>(
            this.endpoints.generateLoot,
            request
        ).pipe(
            tap(response => {
                if (environment.enableLogging && !environment.production) {
                    console.log('Loot generation successful:', {
                        itemCount: response.totalItems,
                        sessionId: response.sessionId,
                        cooldownExpiresAt: response.cooldownExpiresAt
                    });
                }
            }),
            map(response => ({
                ...response,
                // Ensure all items have proper numeric values
                items: response.items.map(item => ({
                    ...item,
                    valueInPennies: Math.max(1, Math.floor(item.valueInPennies))
                }))
            }))
        );
    }

    /**
     * Checks the health status of the backend API and its dependencies.
     * @returns Observable of the health check response
     */
    checkHealth(): Observable<HealthCheckResponse> {
        return this.httpClient.get<HealthCheckResponse>(this.endpoints.health).pipe(
            tap(response => {
                if (environment.enableLogging && !environment.production) {
                    console.log('Health check response:', response);
                }
            })
        );
    }

    /**
     * Creates a properly formatted generation request with validation.
     * @param location - The location description (1-200 characters)
     * @param wealthLevel - The wealth tier for generation
     * @param language - The target language ('en' or 'pl')
     * @param sessionId - The session GUID for cooldown tracking
     * @returns A validated generation request object
     */
    createGenerationRequest(
        location: string,
        wealthLevel: WealthLevel,
        language: string,
        sessionId: string
    ): GenerationRequest {
        const request: GenerationRequest = {
            location: location.trim(),
            wealthLevel,
            language: language.toLowerCase(),
            sessionId: sessionId
        };

        this.validateGenerationRequest(request);
        return request;
    }

    /**
     * Validates a generation request to ensure it meets API requirements.
     * @param request - The request to validate
     * @throws Error if validation fails
     */
    private validateGenerationRequest(request: GenerationRequest): void {
        if (!request) {
            throw new Error('Generation request is required');
        }

        // Validate location
        if (!request.location || typeof request.location !== 'string') {
            throw new Error('Location is required and must be a string');
        }

        const trimmedLocation = request.location.trim();
        if (trimmedLocation.length === 0) {
            throw new Error('Location cannot be empty');
        }

        if (trimmedLocation.length > 200) {
            throw new Error('Location must be 200 characters or less');
        }

        // Validate wealth level
        if (!Object.values(WealthLevel).includes(request.wealthLevel)) {
            throw new Error('Invalid wealth level provided');
        }

        // Validate language
        if (!request.language || typeof request.language !== 'string') {
            throw new Error('Language is required and must be a string');
        }

        const language = request.language.toLowerCase();
        if (!environment.supportedLanguages.includes(language)) {
            throw new Error(`Language '${language}' is not supported. Supported languages: ${environment.supportedLanguages.join(', ')}`);
        }

        // Validate session ID
        if (!request.sessionId || typeof request.sessionId !== 'string') {
            throw new Error('Session ID is required and must be a string');
        }

        // Basic GUID format validation (UUID v4)
        const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!guidRegex.test(request.sessionId)) {
            throw new Error('Session ID must be a valid GUID/UUID format');
        }
    }

    /**
     * Gets the wealth level display name for UI purposes.
     * @param wealthLevel - The wealth level enum value
     * @returns Human-readable wealth level name
     */
    getWealthLevelName(wealthLevel: WealthLevel): string {
        const names: Record<WealthLevel, string> = {
            [WealthLevel.Rubbish]: 'Rubbish',
            [WealthLevel.Poor]: 'Poor',
            [WealthLevel.Common]: 'Common',
            [WealthLevel.Wealthy]: 'Wealthy',
            [WealthLevel.Noble]: 'Noble'
        };
        return names[wealthLevel] || 'Unknown';
    }

    /**
     * Gets the wealth level description for UI purposes.
     * @param wealthLevel - The wealth level enum value
     * @returns Human-readable wealth level description
     */
    getWealthLevelDescription(wealthLevel: WealthLevel): string {
        const descriptions: Record<WealthLevel, string> = {
            [WealthLevel.Rubbish]: 'Junk items, lowest tier (1-12 pennies)',
            [WealthLevel.Poor]: 'Peasant scraps, basic items (13-60 pennies)',
            [WealthLevel.Common]: 'Everyday goods, standard quality (61-240 pennies)',
            [WealthLevel.Wealthy]: 'Merchant spoils, valuable items (241-1200 pennies)',
            [WealthLevel.Noble]: 'Opulent treasures, rare items (1201+ pennies)'
        };
        return descriptions[wealthLevel] || 'Unknown wealth level';
    }

    /**
     * Gets the estimated value range for a wealth level.
     * @param wealthLevel - The wealth level enum value
     * @returns Object with min and max penny values
     */
    getWealthLevelValueRange(wealthLevel: WealthLevel): { min: number; max: number } {
        const ranges: Record<WealthLevel, { min: number; max: number }> = {
            [WealthLevel.Rubbish]: { min: 1, max: 12 },
            [WealthLevel.Poor]: { min: 13, max: 60 },
            [WealthLevel.Common]: { min: 61, max: 240 },
            [WealthLevel.Wealthy]: { min: 241, max: 1200 },
            [WealthLevel.Noble]: { min: 1201, max: 10000 }
        };
        return ranges[wealthLevel] || { min: 0, max: 0 };
    }
}