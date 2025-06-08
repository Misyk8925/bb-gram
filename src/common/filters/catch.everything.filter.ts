import {ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger} from "@nestjs/common";
import {HttpAdapterHost} from "@nestjs/core";


@Catch()
export class CatchEverythingFilter implements ExceptionFilter {
    private readonly logger = new Logger('CatchEverythingFilter')
    constructor(
        private readonly hhtpAdapterHost: HttpAdapterHost
    ) {
    }
    catch(exception: unknown, host: ArgumentsHost) {
        const {httpAdapter} = this.hhtpAdapterHost;
        const ctx = host.switchToHttp();

        const httpStatus =
            exception instanceof HttpException
                ? exception.getStatus()
                : 500
        const responseBody = {
            statusCode: httpStatus,
            timestamp: new Date().toISOString(),
            path: httpAdapter.getRequestUrl(ctx.getRequest()),
            message: exception instanceof HttpException
                ? exception.message
                : exception instanceof Error
                    ? exception.message
                    : String(exception)
        };

        httpAdapter.reply(
            ctx.getResponse(), responseBody, httpStatus
        );
        this.logger.error(responseBody);
    }

}