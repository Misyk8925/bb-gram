import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";

@Schema()
export class PostActions {
    id: string
    @Prop({required: true})
    likes: number
    @Prop({required: true})
    reposts: number
    @Prop({required: true})
    isLiked: boolean
    @Prop({required: true})
    isReposted: boolean
}

export const PostActionsSchema = SchemaFactory.createForClass(PostActions);