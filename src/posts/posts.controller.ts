import {Body, Controller, Post, Get, Param, Req, UseGuards, UseFilters} from '@nestjs/common';
import {PostsService} from "./posts.service";

import {CreatePostDto} from "./DTO/create-post.dto";
import {AllExceptionsFilter} from "../common/filters/all.exceptions.filter";
import {AuthGuard} from "../common/guards/auth-guard.guard";
import {CurrentUser} from "../common/decorators/CurrentUser.decorator";

@Controller('api/posts')
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard)
export class PostsController {
    constructor(
        private readonly postsService: PostsService,
    ) {}

    @Post()
    async createPost(@Body() createPostDto: CreatePostDto, @CurrentUser() user) {
        console.log(user)
        return await this.postsService.createPost(
            user.id,
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
    async addComment(@Param('postId') id: string, @Body() body: { text: string }, @CurrentUser() user) {
        return await this.postsService.addComment(id, body.text, user.id);
    }

}
