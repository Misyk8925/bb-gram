import {IsEmail, IsNotEmpty, IsString} from "class-validator";


export class CreateUserDto {
       @IsNotEmpty()
       @IsString()
       name: string;


       @IsNotEmpty()
       @IsString()
       username: string;

       @IsString()
       imgUrl: string;

       @IsString()
       description: string;
}