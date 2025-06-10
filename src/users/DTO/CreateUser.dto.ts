import {IsEmail, IsNotEmpty, IsString} from "class-validator";
import {UploadedFile} from "@nestjs/common";
import {FileInterceptor} from "@nestjs/platform-express";


export class CreateUserDto {
       @IsNotEmpty()
       @IsString()
       name: string;


       @IsNotEmpty()
       @IsString()
       username: string;

       imgUrl: string

       @IsString()
       description: string;
}