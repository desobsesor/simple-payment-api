import {
    ArgumentsHost,
    BadRequestException,
    Catch,
    ExceptionFilter,
    HttpException,
    InternalServerErrorException,
} from "@nestjs/common";
import { FastifyReply } from "fastify";

type ErrorResponse = {
    message: string;
    status: number;
    reasons?: string[];
    timestamp: string;
    path?: string;
};

@Catch()
export class ErrorResponseNormalizerFilter implements ExceptionFilter {
    async catch(rawException: Error, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<FastifyReply>();
        const request = ctx.getRequest();

        const exception =
            rawException instanceof HttpException
                ? rawException
                : new InternalServerErrorException();

        const status = exception.getStatus();
        const errorResponse = this.mapToError(exception);

        errorResponse.timestamp = new Date().toISOString();
        errorResponse.path = request.url;

        await response.status(status).send({ error: errorResponse });
    }

    private mapToError(error: HttpException): ErrorResponse {
        return {
            message: error.message,
            status: error.getStatus(),
            reasons: this.getReasons(error),
            timestamp: '',
        };
    }

    private getReasons(error: HttpException): string[] | undefined {
        if (!(error instanceof BadRequestException)) {
            return;
        }

        const response = error.getResponse() as { message?: string[] };
        return response?.message || [];
    }
}