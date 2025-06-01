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

    async createPost(title: string, description: string, img: string): Promise<Post> {
        try {
            const postActions = new this.postActionsModel({
                likes: 0,
                reposts: 0,
                isLiked: false,
                isReposted: false
            });
            await postActions.save();
            const post = new this.postModel({title, description, img, actions: postActions});
            await post.save();
            return post;
        } catch (error) {
            throw new Error('Failed to create post');
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

    async addComment(postId: string, text: string) {
        try {
            const post = await this.postModel.findById(postId).exec();
            if (!post) {
                throw new Error('Post not found');
            }
            const comment = new this.commentModel({text, date: new Date(), isLiked: false});
            await comment.save();
            post.comments.push({
                id: new mongoose.Types.ObjectId().toString(),
                text,
                date: new Date(),
                isLiked: false,
            });
            await post.save();
            return comment;
        } catch (error) {
            throw new Error('Failed to add comment');
        }
    }
}
