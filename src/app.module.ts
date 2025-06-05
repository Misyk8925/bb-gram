import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {MongooseModule} from "@nestjs/mongoose";
import { ChatsModule } from './chats/chats.module';
import { PostsModule } from './posts/posts.module';
import { SupabaseModule } from './common/supabase/supabase.module';
import { AuthModule } from './auth/auth.module';
import * as dotenv from 'dotenv';
dotenv.config();

@Module({
  imports: [
      MongooseModule.forRoot(process.env.TEST_MONGODB_URL ?? ''),
      ChatsModule,
      PostsModule,
      SupabaseModule,
      AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
