import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";

@Schema()
export class Message {
    id:string
    @Prop({required: true})
    text: string
    @Prop({required: true})
    createdAt: String

}

export const MessageSchema = SchemaFactory.createForClass(Message);