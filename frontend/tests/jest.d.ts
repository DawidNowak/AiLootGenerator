/**
 * Jest global type declarations for TypeScript
 */

/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

// This file ensures Jest globals are available in TypeScript files
declare global {
    namespace jest {
        interface Matchers<R> {
            toBeInTheDocument(): R;
            toHaveClass(className: string): R;
            toHaveTextContent(text: string | RegExp): R;
        }
    }

    // Ensure globalThis is available for cross-platform compatibility
    var globalThis: typeof global & typeof window;
}

export { };