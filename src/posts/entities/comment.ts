import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";

@Schema()
export class Comment {

    id: string

    @Prop({required: true})
    authorId: string

    @Prop({required: true})
    text: string

    @Prop({required: true})
    date: Date

    @Prop({required: true})
    isLiked: boolean
}

export const CommentSchema = SchemaFactory.createForClass(Comment);