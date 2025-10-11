export const environment = {
    production: true,
    apiUrl: 'https://ailootgenerator-api.azurewebsites.net/api',
    apiTimeout: 30000, // 30 seconds
    cooldownDurationMs: 60000, // 1 minute
    maxRetries: 3,
    retryDelayMs: 1000,
    enableLogging: false,
    defaultLanguage: 'pl',
    supportedLanguages: ['en', 'pl'],
    appVersion: '1.0.0'
};