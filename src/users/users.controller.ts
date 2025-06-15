import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    UploadedFile,
    UseFilters,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import {UsersService} from "./users.service";
import {CreateUserDto} from "./DTO/CreateUser.dto";
import {UpdateUserDto} from "./DTO/UpdateUser.dto";
import {CatchEverythingFilter} from "../common/filters/catch.everything.filter";
import {AllExceptionsFilter} from "../common/filters/all.exceptions.filter";
import {HttpAdapterHost} from "@nestjs/core";
import {AuthGuard} from "../common/guards/auth-guard.guard";
import {CurrentUser} from "../common/decorators/CurrentUser.decorator";
import {FileInterceptor} from "@nestjs/platform-express";
import * as multer from "multer";

@Controller('api/users')
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard)
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
    ) {
    }

    @Post('create')
    @UseInterceptors(
        FileInterceptor('img', {
            storage: multer.memoryStorage(), // Use default memory storage
            limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
        })
    )
    async createUser(
        @Body() createUserDto: CreateUserDto,
        @CurrentUser() user,
        @UploadedFile() file: Express.Multer.File)
    {
        return await this.usersService.createUser(
            createUserDto.name,
            user.email,
            user.id,
            createUserDto.username,
            createUserDto.imgUrl,
            createUserDto.description,
            file.buffer,
            file.originalname,
            file.mimetype);
    }

    @Patch()
    async updateUser(@Body() updateUserDto: UpdateUserDto) {
        return await this.usersService.updateUser(
            updateUserDto.name,
            updateUserDto.username,
            updateUserDto.img,
            updateUserDto.description);
    }

    @Post(':username/follow')
    async followUser(@Param('username') username: string, @CurrentUser() user) {
        return await this.usersService.sendFriendRequest(user.id, username);
    }

    @Get('me/friends')
    async getFriends(@CurrentUser() user) {
        return await this.usersService.getFriends(user.id);
    }

    @Get('me/requests')
    async getFriendRequests(@CurrentUser() user) {
        return await this.usersService.getFriendRequests(user.id);
    }

    @Post('me/requests/:username/accept')
    async acceptFriendRequest(@Param('username') username: string, @CurrentUser() user) {
        return await this.usersService.acceptFriendRequest(username, user.id);
    }

    @Post('me/requests/:username/reject')
    async rejectFriendRequest(@Param('username') username: string, @CurrentUser() user) {
        return await this.usersService.rejectFriendRequest(username, user.id);
    }

    @Get(':username/posts')
    async getFriendsOfUser(@Param('username') username: string) {
        return await this.usersService.getPostsOfUser(username);
    }
}
