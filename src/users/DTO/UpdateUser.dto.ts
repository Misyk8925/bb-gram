import {IsNotEmpty, IsString} from "class-validator";


export class UpdateUserDto {

    @IsNotEmpty({message: 'Name should not be empty'})
    @IsString({message: 'Name should be a string'})
    name: string

    @IsNotEmpty({message: 'Username should not be empty'})
    @IsString({message: 'Username should be a string'})
    username: string

    @IsNotEmpty({message: 'ímg is required'})
    img: string

    @IsNotEmpty({message: 'Description should not be empty'})
    @IsString({message: 'Description should be a string'})
    description: string
}