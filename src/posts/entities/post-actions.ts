import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {Like} from "./like";

@Schema()
export class PostActions {
    id: string
    @Prop({
        type: [Like]
    })
    likes: Like[]
    @Prop({required: true})
    reposts: number
    @Prop({required: true})
    isLiked: boolean
    @Prop({required: true})
    isReposted: boolean
}

export const PostActionsSchema = SchemaFactory.createForClass(PostActions);