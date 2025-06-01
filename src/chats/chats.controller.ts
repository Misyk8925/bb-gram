import {Body, Controller, Get, Post} from '@nestjs/common';
import {ChatsService} from "./chats.service";
import {SendMessageDto} from "./DTO/send-message.dto";

@Controller('api/chats')
export class ChatsController {

    constructor(
        private readonly chatsService: ChatsService,
    ) {}

    @Get()
    async getAll() {
        return await this.chatsService.getAll();
    }

    @Get(':username')
    async getChatWithUser(username: string) {
        return await this.chatsService.getChatWithUser(username);
    }

    // TODO missing chatID for consistent chat data
    @Post(':username')
    async sendMessage(@Body() sendMessageDto: SendMessageDto) {
        return await this.chatsService.sendMessage(sendMessageDto.username, sendMessageDto.text);
    }

    // TODO implement PUT endpoint, missing chatID for consistent chat data
}
