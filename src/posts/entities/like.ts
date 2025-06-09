import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";


@Schema()
export class Like{
    id: string

    @Prop({required: true})
    userId: string

    @Prop({required: true})
    postId: string
}

export const LikeSchema = SchemaFactory.createForClass(Like);