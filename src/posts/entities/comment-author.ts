import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";

@Schema()
export class CommentAuthor {

    id: string

    @Prop({required: true})
    username: string

    @Prop()
    img: string
}

export const CommentAuthorSchema = SchemaFactory.createForClass(CommentAuthor);