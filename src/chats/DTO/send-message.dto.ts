import {IsNotEmpty, IsString} from "class-validator";


export class SendMessageDto {

    @IsString({message: 'Should be a string'})
    text: string


}