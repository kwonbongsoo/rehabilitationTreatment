import { describe, it, expect } from 'bun:test';
import { NextJsHandler } from '../handlers/nextjs';
import { KongHandler } from '../handlers/kong';
import { BaseError, ErrorCode } from '../common/errors';
import { CacheMiddleware } from '../middleware/cache';

describe('Error Handling Tests', () => {
  describe('NextJsHandler', () => {
    it('should wrap network errors in BaseError', async () => {
      const handler = new NextJsHandler();
      
      // Create a request that will fail (invalid URL)
      const request = new Request('http://localhost:9999/test');
      
      try {
        await handler.handleRequest(request);
        expect.unreachable('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(BaseError);
        expect((error as BaseError).code).toBe(ErrorCode.SERVICE_UNAVAILABLE);
        expect((error as BaseError).statusCode).toBe(502);
      }
    });
  });

  describe('KongHandler', () => {
    it('should wrap connection errors in BaseError', async () => {
      const handler = new KongHandler();
      
      // Create a request that will fail (invalid URL)
      const request = new Request('http://localhost:9999/api/test', {
        method: 'POST',
        body: JSON.stringify({ test: 'data' }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      try {
        await handler.handleRequest(request);
        expect.unreachable('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(BaseError);
        expect((error as BaseError).code).toBe(ErrorCode.SERVICE_UNAVAILABLE);
        expect((error as BaseError).statusCode).toBe(502);
      }
    });
  });

  describe('CacheMiddleware HTML Validation', () => {
    it('should detect invalid HTML content', async () => {
      const cacheMiddleware = new CacheMiddleware();
      
      // Test with error HTML content
      const errorResponse = new Response(
        '<html><body>Application error: a client-side exception has occurred</body></html>',
        {
          status: 200,
          headers: { 'content-type': 'text/html; charset=utf-8' }
        }
      );
      
      const result = await cacheMiddleware.cacheResponse(
        'http://example.com/test',
        errorResponse
      );
      
      // Should skip caching due to error content
      expect(result.headers.get('X-Cache')).toBe('SKIP');
      expect(result.headers.get('X-Cache-Reason')).toBe('Invalid HTML content');
    });

    it('should cache valid HTML content', async () => {
      const cacheMiddleware = new CacheMiddleware();
      
      // Test with valid HTML content
      const validResponse = new Response(
        '<!DOCTYPE html><html><body><h1>Welcome to our app</h1><p>This is a normal page with proper content that should be cached.</p></body></html>',
        {
          status: 200,
          headers: { 'content-type': 'text/html; charset=utf-8' }
        }
      );
      
      const result = await cacheMiddleware.cacheResponse(
        'http://example.com/test',
        validResponse
      );
      
      // Should attempt to cache (though may fail due to Redis unavailability)
      expect(result.headers.get('X-Cache')).toBe('MISS');
    });

    it('should not cache non-HTML responses', async () => {
      const cacheMiddleware = new CacheMiddleware();
      
      // Test with JSON response
      const jsonResponse = new Response(
        JSON.stringify({ message: 'Hello' }),
        {
          status: 200,
          headers: { 'content-type': 'application/json' }
        }
      );
      
      const result = await cacheMiddleware.cacheResponse(
        'http://example.com/api/test',
        jsonResponse
      );
      
      // Should not have cache headers for non-HTML content
      expect(result.headers.get('X-Cache')).toBeNull();
    });

    it('should not cache error status responses', async () => {
      const cacheMiddleware = new CacheMiddleware();
      
      // Test with 404 HTML response
      const errorResponse = new Response(
        '<!DOCTYPE html><html><body><h1>404 - Page Not Found</h1></body></html>',
        {
          status: 404,
          headers: { 'content-type': 'text/html; charset=utf-8' }
        }
      );
      
      const result = await cacheMiddleware.cacheResponse(
        'http://example.com/not-found',
        errorResponse
      );
      
      // Should not cache error responses
      expect(result.headers.get('X-Cache')).toBeNull();
    });
  });

  describe('BaseError Integration', () => {
    it('should create proper error responses', () => {
      const error = new BaseError(
        ErrorCode.EXTERNAL_SERVICE_TIMEOUT,
        'Service request timeout',
        { context: { url: 'http://example.com', timeout: 5000 } },
        504
      );
      
      expect(error.code).toBe(ErrorCode.EXTERNAL_SERVICE_TIMEOUT);
      expect(error.message).toBe('Service request timeout');
      expect(error.statusCode).toBe(504);
      expect(error.details?.context).toEqual({ url: 'http://example.com', timeout: 5000 });
      
      const response = error.toResponse();
      expect(response.success).toBe(false);
      expect(response.error.code).toBe(ErrorCode.EXTERNAL_SERVICE_TIMEOUT);
      expect(response.error.message).toBe('Service request timeout');
    });
  });
});