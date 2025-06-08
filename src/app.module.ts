import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from "@nestjs/mongoose";
import { ChatsModule } from './chats/chats.module';
import { PostsModule } from './posts/posts.module';
import { SupabaseModule } from './common/supabase/supabase.module';
import { AuthModule } from './auth/auth.module';
import * as dotenv from 'dotenv';
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user';
import { FriendRequest } from './users/entities/friendRequest';
import { Friendship } from './users/entities/friendship';

dotenv.config();

@Module({
  imports: [
    MongooseModule.forRoot(process.env.TEST_MONGODB_URL ?? ''),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.SUPABASE_HOST || 'localhost',
      port: parseInt(process.env.SUPABASE_PORT || '5432'),
      username: process.env.SUPABASE_USERNAME || 'postgres',
      password: process.env.SUPABASE_PASSWORD || 'postgres',
      database: process.env.SUPABASE_DATABASE || 'postgres',
      entities: [User, FriendRequest, Friendship],
      synchronize: true,
      ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false,
      } : false,
    }),
    ChatsModule,
    PostsModule,
    SupabaseModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}