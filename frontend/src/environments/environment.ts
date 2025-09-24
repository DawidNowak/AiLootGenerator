export const environment = {
    production: false,
    apiUrl: 'https://localhost:7026/api',
    apiTimeout: 30000, // 30 seconds
    cooldownDurationMs: 60000, // 1 minute
    maxRetries: 3,
    retryDelayMs: 1000,
    enableLogging: true,
    defaultLanguage: 'pl',
    supportedLanguages: ['en', 'pl'],
    appVersion: '1.0.0'
};