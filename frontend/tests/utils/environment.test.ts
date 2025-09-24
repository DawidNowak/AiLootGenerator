/**
 * Unit tests for environment utilities
 */

import { loadEnvironmentConfig, isDevelopment } from '../../src/utils/environment';

describe('environment', () => {
    describe('loadEnvironmentConfig', () => {
        beforeEach(() => {
            // Clear any existing global mocks
            delete (global as any).import;
            delete (global as any).process;
        });

        it('should return default configuration when no environment variables are set', () => {
            const config = loadEnvironmentConfig();

            expect(config).toEqual({
                apiBaseUrl: 'https://localhost:5001',
                apiVersion: 'api',
                apiTimeout: 10000,
            });
        });

        it('should load configuration from Vite environment variables', () => {
            // Mock Vite environment
            (global as any).import = {
                meta: {
                    env: {
                        VITE_API_BASE_URL: 'https://api.example.com',
                        VITE_API_VERSION: 'v1',
                        VITE_API_TIMEOUT: '5000',
                    }
                }
            };

            const config = loadEnvironmentConfig();

            expect(config).toEqual({
                apiBaseUrl: 'https://api.example.com',
                apiVersion: 'v1',
                apiTimeout: 5000,
            });
        });

        it('should load configuration from process.env when import.meta is not available', () => {
            // Mock Node.js environment
            (global as any).process = {
                env: {
                    VITE_API_BASE_URL: 'https://node.example.com',
                    VITE_API_VERSION: 'v2',
                    VITE_API_TIMEOUT: '15000',
                }
            };

            const config = loadEnvironmentConfig();

            expect(config).toEqual({
                apiBaseUrl: 'https://node.example.com',
                apiVersion: 'v2',
                apiTimeout: 15000,
            });
        });

        it('should use defaults for missing environment variables', () => {
            (global as any).import = {
                meta: {
                    env: {
                        VITE_API_BASE_URL: 'https://partial.example.com',
                        // Missing VITE_API_VERSION and VITE_API_TIMEOUT
                    }
                }
            };

            const config = loadEnvironmentConfig();

            expect(config).toEqual({
                apiBaseUrl: 'https://partial.example.com',
                apiVersion: 'api', // default
                apiTimeout: 10000, // default
            });
        });

        it('should handle invalid timeout values gracefully', () => {
            (global as any).import = {
                meta: {
                    env: {
                        VITE_API_TIMEOUT: 'invalid-number',
                    }
                }
            };

            const config = loadEnvironmentConfig();

            expect(config.apiTimeout).toBe(10000); // Should fall back to default when parseInt fails
        });

        it('should handle zero timeout value', () => {
            (global as any).import = {
                meta: {
                    env: {
                        VITE_API_TIMEOUT: '0',
                    }
                }
            };

            const config = loadEnvironmentConfig();

            expect(config.apiTimeout).toBe(0);
        });

        it('should handle errors gracefully and return defaults', () => {
            // Mock a scenario where accessing env throws
            (global as any).import = {
                get meta() {
                    throw new Error('Access denied');
                }
            };

            const config = loadEnvironmentConfig();

            expect(config).toEqual({
                apiBaseUrl: 'https://localhost:5001',
                apiVersion: 'api',
                apiTimeout: 10000,
            });
        });
    });

    describe('isDevelopment', () => {
        beforeEach(() => {
            // Clear any existing global mocks
            delete (global as any).import;
            delete (global as any).process;
        });

        it('should return false when no environment is detected', () => {
            expect(isDevelopment()).toBe(false);
        });

        it('should detect development mode from Vite environment', () => {
            (global as any).import = {
                meta: {
                    env: {
                        DEV: true
                    }
                }
            };

            expect(isDevelopment()).toBe(true);
        });

        it('should detect production mode from Vite environment', () => {
            (global as any).import = {
                meta: {
                    env: {
                        DEV: false
                    }
                }
            };

            expect(isDevelopment()).toBe(false);
        });

        it('should detect development mode from Node.js environment', () => {
            (global as any).process = {
                env: {
                    NODE_ENV: 'development'
                }
            };

            expect(isDevelopment()).toBe(true);
        });

        it('should detect production mode from Node.js environment', () => {
            (global as any).process = {
                env: {
                    NODE_ENV: 'production'
                }
            };

            expect(isDevelopment()).toBe(false);
        });

        it('should detect test mode as non-development from Node.js environment', () => {
            (global as any).process = {
                env: {
                    NODE_ENV: 'test'
                }
            };

            expect(isDevelopment()).toBe(false);
        });

        it('should prefer Vite environment over Node.js environment', () => {
            (global as any).import = {
                meta: {
                    env: {
                        DEV: true
                    }
                }
            };

            (global as any).process = {
                env: {
                    NODE_ENV: 'production'
                }
            };

            expect(isDevelopment()).toBe(true);
        });

        it('should handle errors gracefully and return false', () => {
            // Mock a scenario where accessing env throws
            (global as any).import = {
                get meta() {
                    throw new Error('Access denied');
                }
            };

            expect(isDevelopment()).toBe(false);
        });

        it('should handle missing DEV property in Vite environment', () => {
            (global as any).import = {
                meta: {
                    env: {
                        // No DEV property
                    }
                }
            };

            expect(isDevelopment()).toBe(false);
        });

        it('should handle missing NODE_ENV in Node.js environment', () => {
            (global as any).process = {
                env: {
                    // No NODE_ENV
                }
            };

            expect(isDevelopment()).toBe(false);
        });
    });
});