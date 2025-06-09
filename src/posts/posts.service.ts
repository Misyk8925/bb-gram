import { Injectable } from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Post} from "./entities/post";
import mongoose, {Model} from "mongoose";
import {PostActions} from "./entities/post-actions";
import {CommentAuthor} from "./entities/comment-author";

@Injectable()
export class PostsService {
    constructor(
        @InjectModel('Post') private postModel: Model<Post>,
        @InjectModel('PostActions') private postActionsModel: Model<PostActions>,
        @InjectModel('Comment') private commentModel: Model<Comment>,
        @InjectModel('CommentAuthor') private commentAuthorModel: Model<CommentAuthor>,
    ) {
    }

    async createPost(authorId: string, title: string, description: string, img: string): Promise<Post> {
        try {
            const postActions = new this.postActionsModel({
                likes: 0,
                reposts: 0,
                isLiked: false,
                isReposted: false
            });
            await postActions.save();
            const post = new this.postModel(
                {
                    authorId,
                    title,
                    description,
                    img,
                    actions: postActions
                });
            await post.save();
            return post;
        } catch (error) {
            throw new Error('Failed to create post', error);
        }
    }

    async likePost(postId: string) {
        try {
            const post = await this.postModel.findById(postId).exec();
            if (!post) {
                throw new Error('Post not found');
            }
            await this.postActionsModel.findByIdAndUpdate(
                post.actions,
                { $inc: { likes: 1 }, $set: { isLiked: true } }
            ).exec();
        } catch (error) {
            throw new Error('Failed to like post');
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
}
