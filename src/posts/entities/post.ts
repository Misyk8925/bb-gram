import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import mongoose from "mongoose";
import {PostActions} from "./post-actions";
import {Comment} from "./comment";



@Schema()
export class Post {

    id: string

    @Prop({required: true})
    authorId: string

    @Prop({required: true})
    authorUsername: string

    @Prop({required: true})
    title: string

    @Prop()
    description: string

    @Prop()
    img: string

    @Prop({
        type: mongoose.Schema.Types.ObjectId , ref: 'PostActions',
        required: true,
    })
    actions: PostActions


    @Prop({
        default: 0
    })
    total: number

    @Prop({
        type: [Comment], default: []
    })
    comments: Comment[]
}

export const PostSchema = SchemaFactory.createForClass(Post);