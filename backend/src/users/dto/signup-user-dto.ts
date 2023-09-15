import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsStrongPassword, Length, Matches } from "class-validator";

export class SignUpUserDto {
    @IsNotEmpty()
    @ApiProperty({example: "name"})
    name: string;

    @IsNotEmpty()
    @ApiProperty({example: "surname"})
    surname: string;

    @IsNotEmpty()
    @ApiProperty({example: "org.example.doxee"})
    organization: string;

    @IsNotEmpty()
    @Length(12, 12)
    @Matches(/^[0-9]{12}$/i)
    @ApiProperty({example: "123456789012"})
    awsClientId: string;

    @IsNotEmpty()
    @Matches(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i)
    @ApiProperty({example: "email@doxee.com"})
    email: string;

    @IsNotEmpty()
    @IsStrongPassword({minLength: 8, minNumbers: 2, minLowercase: 2, minSymbols: 2, minUppercase: 2})
    @ApiProperty({example: "S7r0ngP@ssw0rD!"})
    password: string;
}