import {Injectable, Logger, NestMiddleware} from "@nestjs/common";
import {NextFunction, Request, Response} from "express";
import chalk from "chalk";


@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
    private readonly logger = new Logger('HTTP')

    use(
        request: Request,
        response: Response,
        next: NextFunction
    ) {
        const {method, originalUrl, ip} = request
        const userAgent = request.get('user-agent') || ''

        response.on('finish', () => {
            const {statusCode} = response
            const contentLength = response.get('content-length')

            this.logger.log(
                chalk.magenta(`${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip}`)
            )
        })

        next()
    }
}
