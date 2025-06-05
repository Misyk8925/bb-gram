import {ArgumentsHost, Catch, ExceptionFilter, HttpException} from "@nestjs/common";
import {HttpAdapterHost} from "@nestjs/core";


@Catch()
export class CatchEverythingFilter<T> implements ExceptionFilter {
    constructor(
        private readonly hhtpAdapterHost: HttpAdapterHost
    ) {
    }
    catch(exception: any, host: ArgumentsHost) {
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
        };

        httpAdapter.reply(
            ctx.getResponse(), responseBody, httpStatus
        );
    }

}