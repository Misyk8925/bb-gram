import {Body, Controller, Patch, Post, UseFilters} from '@nestjs/common';
import {UsersService} from "./users.service";
import {CreateUserDto} from "./DTO/CreateUser.dto";
import {UpdateUserDto} from "./DTO/UpdateUser.dto";
import {CatchEverythingFilter} from "../common/filters/catch.everything.filter";
import {AllExceptionsFilter} from "../common/filters/all.exceptions.filter";
import {HttpAdapterHost} from "@nestjs/core";

@Controller('users')
@UseFilters(AllExceptionsFilter)
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
    ) {
    }

    @Post('create')
    async createUser(@Body() createUserDto: CreateUserDto) {
        return await this.usersService.createUser(
            createUserDto.name,
            createUserDto.email,
            createUserDto.username,
            createUserDto.imgUrl,
            createUserDto.description);
    }

    @Patch()
    async updateUser(@Body() updateUserDto: UpdateUserDto) {
        return await this.usersService.updateUser(
            updateUserDto.name,
            updateUserDto.username,
            updateUserDto.img,
            updateUserDto.description);
    }
}
