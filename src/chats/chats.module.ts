import { Module } from '@nestjs/common';
import {MongooseModule} from "@nestjs/mongoose";
import {ChatSchema} from "./entities/chat";
import {ProfileSchema} from "./entities/profile";
import {MessageSchema} from "./entities/message";
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'Chat', schema: ChatSchema },
            { name: 'Profile', schema: ProfileSchema },
            { name: 'Message', schema: MessageSchema },
        ]),
    ],
    providers: [ChatsService],
    controllers: [ChatsController],
})
export class ChatsModule {}
