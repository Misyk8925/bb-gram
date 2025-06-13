import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import {Profile} from "./profile";
import {Message} from "./message";

@Schema()
export class Chat {
    id: string

    @Prop({required: true})
    user1_id: string

    @Prop({required: true})
    user2_id: string


    @Prop({
        type: mongoose.Schema.Types.ObjectId, ref: 'Profile',
        required: true,
    })
    profile: Profile

    @Prop({
        type: mongoose.Schema.Types.ObjectId, ref: 'Message',
        required: true,
    })
    messages: Message[]


    @Prop({
        type: mongoose.Schema.Types.ObjectId, ref: 'Message',
        required: true,
    })
    lastMessage: Message

    @Prop({required: true})
    unreadMessages: number

}

export const ChatSchema = SchemaFactory.createForClass(Chat);