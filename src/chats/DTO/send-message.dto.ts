import {IsNotEmpty, IsString} from "class-validator";


export class SendMessageDto {

    @IsNotEmpty({message: 'Should not be empty'})
    username: string

    @IsString({message: 'Should be a string'})
    text: string


}