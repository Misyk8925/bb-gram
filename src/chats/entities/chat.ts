import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import {Profile} from "./profile";
import {Message} from "./message";

@Schema()
export class Chat {
    id: string
    @Prop({
        type: mongoose.Schema.Types.ObjectId, ref: 'Profile',
        required: true,
    })
    profile: Profile

    @Prop({
        type: mongoose.Schema.Types.ObjectId, ref: 'Message',
        required: true,
    })
    lastMessage: Message

    @Prop({required: true})
    unreadMessages: number

}

export const ChatSchema = SchemaFactory.createForClass(Chat);