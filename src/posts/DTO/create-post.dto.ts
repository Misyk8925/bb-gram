import {IsNotEmpty, IsString, MaxLength, MinLength, IsOptional} from "class-validator";


export class CreatePostDto {

    @IsNotEmpty({message: 'Title should not be empty'})
    @IsString({message: 'Title should be a string'})
    @MinLength(3, {message: 'Title should be at least 3 characters'})
    @MaxLength(30, {message: 'Title should be at most 30 characters'})
    title: string

    @IsOptional()
    @IsString({message: 'Description should be a string'})
    @MaxLength(700, {message: 'Description should be at most 700 characters'})
    description: string;

    @IsNotEmpty({message: 'Image should not be empty'})
    @IsString({message: 'Image should be a string'})
    img: string
}