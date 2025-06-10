import { Injectable } from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Post} from "./entities/post";
import mongoose, {Model} from "mongoose";
import {PostActions} from "./entities/post-actions";
import {CommentAuthor} from "./entities/comment-author";
import {Like} from "./entities/like";
import {SupabaseService} from "../common/supabase/supabase.service";

@Injectable()
export class PostsService {
    constructor(
        @InjectModel('Post') private postModel: Model<Post>,
        @InjectModel('PostActions') private postActionsModel: Model<PostActions>,
        @InjectModel('Comment') private commentModel: Model<Comment>,
        @InjectModel('CommentAuthor') private commentAuthorModel: Model<CommentAuthor>,
        private readonly supabase: SupabaseService
    ) {
    }

    async createPost(
                     authorId: string,
                     authorUsername: string,
                     title: string,
                     description: string,
                     img: string,
                     buffer:Buffer,
                     originalName: string,
                     mimeType:string
    ): Promise<Post> {

        try{
            // e.g. prepend timestamp or UUID for unique path
            const filePath = `posts/${Date.now()}_${originalName}`;

            // upload to bucket called “posts”
            const uploadResult = await this.supabase.uploadFile(
                'posts',
                filePath,
                buffer,
                mimeType,
            );


            const postActions = new this.postActionsModel({
                likes: [],
                reposts: 0,
                isLiked: false,
                isReposted: false
            });
            await postActions.save();
            const post = new this.postModel(
                {
                    authorId,
                    authorUsername: authorUsername,
                    title,
                    description,
                    img:filePath,
                    actions: postActions
                });
            await post.save();
            return post;
        } catch (error) {
            throw new Error(`Failed to add comment: ${error.message}`);
        }
    }

    async likePost(postId: string, userId: string) {
        try {
            const post = await this.postModel.findById(postId).exec();
            if (!post) {
                throw new Error('Post not found');
            }

            const postActions = await this.postActionsModel.findById(post.actions).exec();
            if (!postActions) {
                throw new Error('Post actions not found');
            }
            for (const like of postActions.likes) {
                if (like.userId === userId) {
                    throw new Error('Already liked');
                }
            }
            postActions.likes.push({
                id: new mongoose.Types.ObjectId().toString(),
                userId,
                postId
            });

            this.setIsLiked(post.id)

            await postActions.save();
        } catch (error) {
            throw new Error(`Failed to like post: ${error.message}`)
        }
    }

    async getComments(postId: string) {
        try {
            const post = await this.postModel.findById(postId).exec();
            console.log(post);
            if (!post) {
                throw new Error('Post not found');
            }
            return post.comments;
        } catch (error) {
            throw new Error('Failed to fetch comments');
        }
    }

    async addComment(postId: string, text: string, authorId: string) {
        try {
            // Находим пост
            const post = await this.postModel.findById(postId).exec();
            if (!post) {
                throw new Error('Post not found');
            }

            // Создаем комментарий
            const commentId = new mongoose.Types.ObjectId();
            const comment = new this.commentModel({
                _id: commentId,
                text,
                date: new Date(),
                isLiked: false,
                authorId
            });

            // Сохраняем комментарий
            await comment.save();

            // Добавляем ссылку на комментарий в пост
            post.comments.push({
                id: commentId.toString(),
                authorId,
                text,
                date: new Date(),
                isLiked: false,
            });

            // Сохраняем пост
            await post.save();

            // Возвращаем комментарий
            return comment;
        } catch (error) {
            // Сохраняем оригинальное сообщение об ошибке
            console.error('Error adding comment:', error);
            throw new Error(`Failed to add comment: ${error.message}`);
        }
    }

    async setIsLiked(postId: string){
        try {
            const post = await this.postModel.findById(postId).exec();
            if (!post) {
                throw new Error('Post not found');
            }
            const postActions = await this.postActionsModel.findById(post.actions).exec();
            if (!postActions) {
                throw new Error('Post actions not found');
            }
            postActions.isLiked = postActions.likes.length > 0;
            await postActions.save();
        } catch (error) {
            throw new Error(`Failed to set isLiked: ${error.message}`);
        }
    }

    async findPostsByUsername(username: string ){
        const posts = await this.postModel.find({authorUsername: username}).exec();
        return posts;
    }
}
