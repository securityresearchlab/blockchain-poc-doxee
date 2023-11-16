import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsStrongPassword, Matches, MaxLength } from "class-validator";

export class SignUpUserDto {
    @IsNotEmpty()
    @MaxLength(32)
    @Matches(/^[a-zA-Z][a-zA-Z]*$/i, 
        {message: 'The name field must contain only letters'})
    @ApiProperty({example: "name"})
    name: string;

    @IsNotEmpty()
    @MaxLength(32)
    @Matches(/^[a-zA-Z][a-zA-Z]*$/i, 
        {message: 'The surname field must contain only letters'})
    @ApiProperty({example: "surname"})
    surname: string;

    @IsNotEmpty()
    @MaxLength(64)
    @Matches(/^(?!-|[0-9])(?!.*-$)(?!.*?--)[a-zA-Z0-9-]+$/i, 
        {message: 'The name field must contain only letters, numbers and dashes'})
    @ApiProperty({example: "org.example.doxee"})
    organization: string;

    @IsNotEmpty()
    @Matches(/^[0-9]{12}$/i, 
        {message: 'The AWS Client ID must contain 12 numbers'})
    @ApiProperty({example: "123456789012"})
    awsClientId: string;

    @IsNotEmpty()
    @IsEmail()
    @ApiProperty({example: "email@doxee.com"})
    email: string;

    @IsNotEmpty()
    @IsStrongPassword({minLength: 8, minNumbers: 2, minLowercase: 2, minSymbols: 2, minUppercase: 2}, 
        {message: 'The password must contain at least 2 numbers, 2 lowercase characters, 2 uppercase characters and 2 symbols'})
    @ApiProperty({example: "S7r0ngP@ssw0rD!"})
    password: string;
}