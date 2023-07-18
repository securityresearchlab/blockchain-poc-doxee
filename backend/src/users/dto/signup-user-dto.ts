import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, Matches } from "class-validator";

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
    @Matches(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i)
    @ApiProperty({example: "email@doxee.com"})
    email: string;
}