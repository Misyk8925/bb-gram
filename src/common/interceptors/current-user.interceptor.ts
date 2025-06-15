import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { DataSource, Repository } from 'typeorm';
import { User } from '../../users/entities/user';

@Injectable()
export class CurrentUserInterceptor implements NestInterceptor {
    private readonly logger = new Logger(CurrentUserInterceptor.name); // Оставляем логгер для возможных будущих нужд или критических ошибок

    constructor(private dataSource: DataSource) {}

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();
        const jwtUser = request.user;

        if (jwtUser && jwtUser.id) {
            try {
                if (!this.dataSource || !this.dataSource.isInitialized) {
                      this.logger.error('DataSource is not available or not initialized!');
                    return next.handle();
                }

                const userRepository: Repository<User> = this.dataSource.getRepository(User);
                const dbUser = await userRepository.findOne({ where: { id: jwtUser.id } });

                if (dbUser) {
                    request.user = { ...jwtUser, ...dbUser };
                }
            } catch (error) {
                // Логируем ошибку, возникшую при попытке получить пользователя из БД
                this.logger.error('Error in CurrentUserInterceptor while fetching DB user:', error.message, error.stack);
            }
        }
        return next.handle();
    }
}
