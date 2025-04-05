import { Request } from 'express';

/**
 * Gets the real IP address of the client considering proxy headers
 * @param request The HTTP request object
 * @returns The client's real IP address
 */
export function getRealIp(request: Request): string {
    // Check common proxy headers in order of reliability
    const forwardedFor = request.headers['x-forwarded-for'];
    if (forwardedFor && typeof forwardedFor === 'string') {
        // Get the first IP in the list, which is usually the client's real IP
        const ips = forwardedFor.split(',');
        return ips[0].trim();
    }

    // Check other common headers
    const realIp = request.headers['x-real-ip'];
    if (realIp && typeof realIp === 'string') {
        return realIp;
    }

    // Use the remote address of the connection as a last resort
    return request.ip || request.connection?.remoteAddress || 'unknown';
}