// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock import.meta for Vite environment variables
(global as any).import = {
    meta: {
        env: {
            VITE_API_BASE_URL: 'https://localhost:5001',
            VITE_API_VERSION: 'api',
            VITE_API_TIMEOUT: '10000',
            DEV: true,
            PROD: false,
            MODE: 'test'
        }
    }
};