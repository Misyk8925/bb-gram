
import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";

@Schema()
export class Profile {
    id: string
    @Prop()
    name: string
    @Prop()
    img: string
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
