import {IsEmail, IsNotEmpty} from "class-validator";


export class AuthDto {

    @IsEmail({}, {message: 'Should be a valid email'})
    email: string

    @IsNotEmpty({message: 'Should not be empty'})
    password: string
}