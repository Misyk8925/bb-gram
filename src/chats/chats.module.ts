import { Module } from '@nestjs/common';
import {MongooseModule} from "@nestjs/mongoose";
import {ChatSchema} from "./entities/chat";
import {ProfileSchema} from "./entities/profile";
import {MessageSchema} from "./entities/message";
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import {AuthModule} from "../auth/auth.module";
import {SupabaseModule} from "../common/supabase/supabase.module";
import { ChatsGateway } from './gateway/chats.gateway';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'Chat', schema: ChatSchema },
            { name: 'Profile', schema: ProfileSchema },
            { name: 'Message', schema: MessageSchema },
        ]),
        SupabaseModule,
    ],
    providers: [ChatsService, ChatsGateway],
    controllers: [ChatsController],
    exports: [ChatsService],
})
export class ChatsModule {}
