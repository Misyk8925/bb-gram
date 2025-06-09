import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {PostActionsSchema} from "./entities/post-actions";
import {PostSchema} from "./entities/post";
import {CommentSchema} from "./entities/comment";
import {CommentAuthorSchema} from "./entities/comment-author";
import {SupabaseModule} from "../common/supabase/supabase.module";



@Module({
  imports: [
      MongooseModule.forFeature([
          { name: 'Post', schema: PostSchema },
          { name: 'PostActions', schema: PostActionsSchema },
          { name: 'Comment', schema: CommentSchema },
          { name: 'CommentAuthor', schema: CommentAuthorSchema },
      ]),
      SupabaseModule,
  ],
  providers: [PostsService],
  controllers: [PostsController]
})
export class PostsModule {}
