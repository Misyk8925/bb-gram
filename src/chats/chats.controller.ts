import {Body, Controller, Get, Param, Post, Put, UseFilters, UseGuards} from '@nestjs/common';
import {ChatsService} from "./chats.service";
import {SendMessageDto} from "./DTO/send-message.dto";
import {AllExceptionsFilter} from "../common/filters/all.exceptions.filter";
import {AuthGuard} from "../common/guards/auth-guard.guard";
import {CurrentUser} from "../common/decorators/CurrentUser.decorator";

@Controller('api/chats')
@UseFilters(AllExceptionsFilter)
@UseGuards(AuthGuard)

export class ChatsController {

    constructor(
        private readonly chatsService: ChatsService,
    ) {}

    @Get()
    async getAll(@CurrentUser() user) {
        return await this.chatsService.getAll(user.id);
    }

    @Get(':username')
    async getChatWithUser(@CurrentUser()user,@Param('username') username: string) {
        return await this.chatsService.getChatWithUser(user.id, username);
    }

    @Post(':username')
    async sendMessage(@CurrentUser() user,
                      @Param('username') username: string,
                      @Body() sendMessageDto: SendMessageDto)
    {
        return await this.chatsService.sendMessage(username, sendMessageDto.text, user.id);
    }

    @Put('read/all')
    async markAllMessagesAsRead(@CurrentUser() user) {
        return await this.chatsService.markAllMessagesAsRead(user.id);
    }


}
