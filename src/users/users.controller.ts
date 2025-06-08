import {Body, Controller, Post} from '@nestjs/common';
import {UsersService} from "./users.service";
import {CreateUserDto} from "./DTO/CreateUserDto";

@Controller('users')
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
}
