
import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {uuid} from "@supabase/supabase-js/dist/main/lib/helpers";

@Schema()
export class Profile {
    @Prop()
    id: string

    @Prop({
        required: true,
        unique: true,
    })
    supabaseId: string

    @Prop()
    username: string
    @Prop()
    img: string
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
