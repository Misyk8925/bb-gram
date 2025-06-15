import {
    Body,
    Controller,
    Post,
    Get,
    Param,
    UseGuards,
    UseFilters,
    UseInterceptors,
    UploadedFile
} from '@nestjs/common';
import {PostsService} from "./posts.service";

import {CreatePostDto} from "./DTO/create-post.dto";
import {AllExceptionsFilter} from "../common/filters/all.exceptions.filter";
import {AuthGuard} from "../common/guards/auth-guard.guard";
import {CurrentUser} from "../common/decorators/CurrentUser.decorator";
import {FileInterceptor} from "@nestjs/platform-express";
import * as multer from 'multer';
import { CurrentUserInterceptor } from '../common/interceptors/current-user.interceptor'; // Импортируем интерцептор

@Controller('api/posts')
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard)
@UseInterceptors(CurrentUserInterceptor) // Применяем CurrentUserInterceptor ко всем маршрутам контроллера
export class PostsController {
    constructor(
        private readonly postsService: PostsService,
    ) {}

    @Post()
    @UseInterceptors(
        FileInterceptor('img', {
            storage: multer.memoryStorage(),
            limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
        }),
    )
    async createPost(
        @Body() createPostDto: CreatePostDto,
        @CurrentUser() user,
        @UploadedFile() file : Express.Multer.File)
    {
        return await this.postsService.createPost(
            user.id,
            user.username,
            createPostDto.title,
            createPostDto.description,
            createPostDto.img,
            file.buffer,
            file.originalname,
            file.mimetype,);
    }

    @Post(':postId/like')
    async likePost(@Param('postId') id: string, @CurrentUser() user) {
        return await this.postsService.likePost(id, user.id);
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
