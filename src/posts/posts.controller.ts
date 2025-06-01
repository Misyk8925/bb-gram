import {Body, Controller,Post, Get, Param} from '@nestjs/common';
import {PostsService} from "./posts.service";

import {CreatePostDto} from "./DTO/create-post.dto";

@Controller('api/posts')
export class PostsController {
    constructor(
        private readonly postsService: PostsService,
    ) {}

    @Post()
    async createPost(@Body() createPostDto: CreatePostDto) {
        return await this.postsService.createPost(
            createPostDto.title,
            createPostDto.description,
            createPostDto.img);
    }

    @Post(':postId/like')
    async likePost(@Param('postId') id: string) {
        return await this.postsService.likePost(id);
    }

    @Get(':postId/comments')
    async getComments(@Param('postId') id: string) {
        return await this.postsService.getComments(id);
    }

    @Post(':postId/comments')
    async addComment(@Param('postId') id: string, @Body() body: { text: string }) {
        return await this.postsService.addComment(id, body.text);
    }

}
