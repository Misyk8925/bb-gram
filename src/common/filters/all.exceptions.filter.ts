import {CatchEverythingFilter} from "./catch.everything.filter";
import {ArgumentsHost, Catch} from "@nestjs/common";


@Catch()
export class AllExceptionsFilter extends CatchEverythingFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        super.catch(exception, host);
    }
}