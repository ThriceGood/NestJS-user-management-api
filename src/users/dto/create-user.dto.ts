import { IsEmail, IsNotEmpty, IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
    
    @ApiProperty()
    @IsNotEmpty()
    firstName: string;
    
    @ApiProperty()
    @IsNotEmpty()
    lastName: string;
   
    @ApiProperty()
    @IsNotEmpty()
    nickName: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty()
    @IsNotEmpty()
    password: string;
}
