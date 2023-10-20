import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsNumberString, IsOptional, IsStrongPassword, MaxLength, MinLength } from "class-validator";

export class LoginUserDto {
    @IsNotEmpty()
    @IsEmail()
    @ApiProperty({example: "email@doxee.com"})
    email: string;

    @IsStrongPassword({minLength: 8, minNumbers: 2, minLowercase: 2, minSymbols: 2, minUppercase: 2}, 
        {message: 'The password must contain at least 2 numbers, 2 lowercase characters, 2 uppercase characters and 2 symbols'})
    @ApiProperty({example: "S7r0ngP@ssw0rD!"})
    password: string;

    @IsOptional()
    @MinLength(8)
    @MaxLength(8)
    @IsNumberString()
    @ApiProperty({example: "12345678"})
    code: string;
}