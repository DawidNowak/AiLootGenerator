import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, retry, timeout } from 'rxjs/operators';
import { environment } from '../../environments/environment';

/**
 * Service for handling HTTP requests with built-in error handling, retries, and timeout.
 * Provides a centralized way to make API calls with consistent configuration.
 */
@Injectable({
    providedIn: 'root'
})
export class HttpClientService {
    private readonly defaultHeaders = new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    });

    constructor(private http: HttpClient) { }

    /**
     * Performs GET request with error handling and retry logic.
     * @param url - The endpoint URL (relative to API base URL)
     * @param options - Optional HTTP request options
     * @returns Observable of the response
     */
    get<T>(url: string, options?: {
        headers?: HttpHeaders;
        params?: HttpParams;
    }): Observable<T> {
        const fullUrl = this.buildUrl(url);
        const headers = this.mergeHeaders(options?.headers);

        return this.http.get<T>(fullUrl, {
            headers,
            params: options?.params
        }).pipe(
            timeout(environment.apiTimeout),
            retry({
                count: environment.maxRetries,
                delay: (error, retryCount) => {
                    if (error instanceof HttpErrorResponse && error.status >= 400 && error.status < 500) {
                        // Don't retry client errors
                        return throwError(() => error);
                    }
                    return timer(environment.retryDelayMs * retryCount);
                }
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Performs POST request with error handling and retry logic.
     * @param url - The endpoint URL (relative to API base URL)
     * @param body - The request body
     * @param options - Optional HTTP request options
     * @returns Observable of the response
     */
    post<T>(url: string, body: any, options?: {
        headers?: HttpHeaders;
        params?: HttpParams;
    }): Observable<T> {
        const fullUrl = this.buildUrl(url);
        const headers = this.mergeHeaders(options?.headers);

        return this.http.post<T>(fullUrl, body, {
            headers,
            params: options?.params
        }).pipe(
            timeout(environment.apiTimeout),
            retry({
                count: environment.maxRetries,
                delay: (error, retryCount) => {
                    if (error instanceof HttpErrorResponse && error.status >= 400 && error.status < 500) {
                        // Don't retry client errors
                        return throwError(() => error);
                    }
                    return timer(environment.retryDelayMs * retryCount);
                }
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Performs PUT request with error handling and retry logic.
     * @param url - The endpoint URL (relative to API base URL)
     * @param body - The request body
     * @param options - Optional HTTP request options
     * @returns Observable of the response
     */
    put<T>(url: string, body: any, options?: {
        headers?: HttpHeaders;
        params?: HttpParams;
    }): Observable<T> {
        const fullUrl = this.buildUrl(url);
        const headers = this.mergeHeaders(options?.headers);

        return this.http.put<T>(fullUrl, body, {
            headers,
            params: options?.params
        }).pipe(
            timeout(environment.apiTimeout),
            retry({
                count: environment.maxRetries,
                delay: (error, retryCount) => {
                    if (error instanceof HttpErrorResponse && error.status >= 400 && error.status < 500) {
                        return throwError(() => error);
                    }
                    return timer(environment.retryDelayMs * retryCount);
                }
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Performs DELETE request with error handling and retry logic.
     * @param url - The endpoint URL (relative to API base URL)
     * @param options - Optional HTTP request options
     * @returns Observable of the response
     */
    delete<T>(url: string, options?: {
        headers?: HttpHeaders;
        params?: HttpParams;
    }): Observable<T> {
        const fullUrl = this.buildUrl(url);
        const headers = this.mergeHeaders(options?.headers);

        return this.http.delete<T>(fullUrl, {
            headers,
            params: options?.params
        }).pipe(
            timeout(environment.apiTimeout),
            retry({
                count: environment.maxRetries,
                delay: (error, retryCount) => {
                    if (error instanceof HttpErrorResponse && error.status >= 400 && error.status < 500) {
                        return throwError(() => error);
                    }
                    return timer(environment.retryDelayMs * retryCount);
                }
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Builds the full URL by combining the base API URL with the endpoint.
     * @param endpoint - The API endpoint path
     * @returns The full URL
     */
    private buildUrl(endpoint: string): string {
        const baseUrl = environment.apiUrl.replace(/\/$/, ''); // Remove trailing slash
        const cleanEndpoint = endpoint.replace(/^\//, ''); // Remove leading slash
        return `${baseUrl}/${cleanEndpoint}`;
    }

    /**
     * Merges custom headers with default headers.
     * @param customHeaders - Optional custom headers
     * @returns Merged headers
     */
    private mergeHeaders(customHeaders?: HttpHeaders): HttpHeaders {
        if (!customHeaders) {
            return this.defaultHeaders;
        }

        let mergedHeaders = this.defaultHeaders;
        customHeaders.keys().forEach(key => {
            const value = customHeaders.get(key);
            if (value) {
                mergedHeaders = mergedHeaders.set(key, value);
            }
        });

        return mergedHeaders;
    }

    /**
     * Handles HTTP errors with detailed error information.
     * @param error - The HTTP error response
     * @returns Observable error with formatted message
     */
    private handleError = (error: HttpErrorResponse): Observable<never> => {
        let errorMessage = 'An unknown error occurred';
        let errorCode = 'UNKNOWN_ERROR';

        if (error.error instanceof ErrorEvent) {
            // Client-side error
            errorMessage = error.error.message;
            errorCode = 'CLIENT_ERROR';
        } else {
            // Server-side error
            switch (error.status) {
                case 0:
                    errorMessage = 'Unable to connect to the server. Please check your internet connection.';
                    errorCode = 'CONNECTION_ERROR';
                    break;
                case 400:
                    errorMessage = error.error?.message || 'Invalid request. Please check your input.';
                    errorCode = 'VALIDATION_ERROR';
                    break;
                case 401:
                    errorMessage = 'You are not authorized to perform this action.';
                    errorCode = 'UNAUTHORIZED';
                    break;
                case 403:
                    errorMessage = 'Access forbidden. You don\'t have permission to access this resource.';
                    errorCode = 'FORBIDDEN';
                    break;
                case 404:
                    errorMessage = 'The requested resource was not found.';
                    errorCode = 'NOT_FOUND';
                    break;
                case 429:
                    errorMessage = 'Too many requests. Please wait before trying again.';
                    errorCode = 'RATE_LIMITED';
                    break;
                case 500:
                    errorMessage = 'Internal server error. Please try again later.';
                    errorCode = 'SERVER_ERROR';
                    break;
                case 502:
                case 503:
                case 504:
                    errorMessage = 'Server is temporarily unavailable. Please try again later.';
                    errorCode = 'SERVICE_UNAVAILABLE';
                    break;
                default:
                    errorMessage = error.error?.message || `Server error: ${error.status}`;
                    errorCode = 'HTTP_ERROR';
            }
        }

        // Log error in development
        if (environment.enableLogging && !environment.production) {
            console.error('HTTP Error:', {
                message: errorMessage,
                code: errorCode,
                status: error.status,
                url: error.url,
                details: error.error
            });
        }

        return throwError(() => ({
            message: errorMessage,
            code: errorCode,
            status: error.status,
            originalError: error
        }));
    };
}