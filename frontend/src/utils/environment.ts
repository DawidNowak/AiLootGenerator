/**
 * Environment configuration for API services
 * Handles environment variable access in a test-friendly way
 */

/**
 * Interface for environment variables
 */
interface EnvironmentConfig {
    apiBaseUrl: string;
    apiVersion: string;
    apiTimeout: number;
}

/**
 * Get environment variable with fallback
 * Safe for both Vite and Jest environments
 */
const getEnvVar = (key: string, defaultValue: string): string => {
    try {
        // In test environment with mocked import.meta
        if (typeof global !== 'undefined' && (global as any).import?.meta?.env) {
            return (global as any).import.meta.env[key] || defaultValue;
        }

        // In Node.js environment (Jest with process.env)
        if (typeof process !== 'undefined' && process.env) {
            return process.env[key] || defaultValue;
        }

        return defaultValue;
    } catch {
        return defaultValue;
    }
};

/**
 * Load environment configuration
 */
export const loadEnvironmentConfig = (): EnvironmentConfig => {
    const timeout = parseInt(getEnvVar('VITE_API_TIMEOUT', '10000'), 10);
    return {
        apiBaseUrl: getEnvVar('VITE_API_BASE_URL', 'https://localhost:5001'),
        apiVersion: getEnvVar('VITE_API_VERSION', 'api'),
        apiTimeout: isNaN(timeout) ? 10000 : timeout
    };
};

/**
 * Check if running in development mode
 */
export const isDevelopment = (): boolean => {
    try {
        // Test environment with mocked import.meta
        if (typeof global !== 'undefined' && (global as any).import?.meta?.env?.DEV) {
            return (global as any).import.meta.env.DEV;
        }

        // Node.js environment
        if (typeof process !== 'undefined' && process.env.NODE_ENV) {
            return process.env.NODE_ENV === 'development';
        }

        return false;
    } catch {
        return false;
    }
};