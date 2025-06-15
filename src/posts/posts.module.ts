import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {PostActionsSchema} from "./entities/post-actions";
import {PostSchema} from "./entities/post";
import {CommentSchema} from "./entities/comment";
import {CommentAuthorSchema} from "./entities/comment-author";
import {SupabaseModule} from "../common/supabase/supabase.module";
import { CurrentUserInterceptor } from '../common/interceptors/current-user.interceptor'; // Импортируем интерцептор
import { TypeOrmModule } from '@nestjs/typeorm'; // Импортируем TypeOrmModule
import { User } from '../users/entities/user'; // Импортируем сущность User



@Module({
  imports: [
      MongooseModule.forFeature([
          { name: 'Post', schema: PostSchema },
          { name: 'PostActions', schema: PostActionsSchema },
          { name: 'Comment', schema: CommentSchema },
          { name: 'CommentAuthor', schema: CommentAuthorSchema },
      ]),
      SupabaseModule,
      TypeOrmModule.forFeature([User]), // Добавляем User для доступа к DataSource/Repository в этом модуле
  ],
  providers: [PostsService, CurrentUserInterceptor], // Добавляем CurrentUserInterceptor в провайдеры
  controllers: [PostsController],
    exports: [PostsService],
})
export class PostsModule {}
