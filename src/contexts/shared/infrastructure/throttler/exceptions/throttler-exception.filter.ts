import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { Response } from 'express';
import { AppLoggerService } from '../../logger/logger.service';
import { getRealIp } from '../../utils/network.utils';

/**
 * Custom filter to handle ThrottlerException exceptions
 * Provides a structured response when the request limit is exceeded
 */
@Catch(ThrottlerException)
export class ThrottlerExceptionFilter implements ExceptionFilter {
    constructor(private readonly logger: AppLoggerService) { }

    catch(exception: ThrottlerException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest();

        // Get request information for logging
        const ip = getRealIp(request);
        const url = request.url;
        const method = request.method;
        const userAgent = request.headers['user-agent'] || 'unknown';

        // Log the rate limiting event
        this.logger.warn(
            `Rate limit exceeded - IP: ${ip}, Method: ${method}, URL: ${url}, User-Agent: ${userAgent}`
        );

        // Calculate the recommended wait time (60 seconds by default)
        const retryAfter = 60; // seconds

        // Send a structured response
        response
            .status(HttpStatus.TOO_MANY_REQUESTS)
            .header('Retry-After', String(retryAfter))
            .json({
                statusCode: HttpStatus.TOO_MANY_REQUESTS,
                message: 'You have exceeded the request limit. Please try again later.',
                error: 'Too Many Requests',
                timestamp: new Date().toISOString(),
                path: request.url,
                retryAfter: `${retryAfter} seconds`,
            });
    }

}