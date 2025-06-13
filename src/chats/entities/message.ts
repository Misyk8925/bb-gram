import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import mongoose from "mongoose";
import {Profile} from "./profile";

@Schema()
export class Message {
    id:string
    @Prop({required: true})
    text: string
    @Prop({required: true})
    createdAt: String

    @Prop({
        type: mongoose.Schema.Types.ObjectId, ref: 'Profile',
        required: true,
    })
    sender: Profile

    @Prop({
        required: true,
    })
    supabaseSenderId: string

    @Prop({default: false})
    isRead: boolean

}

export const MessageSchema = SchemaFactory.createForClass(Message);