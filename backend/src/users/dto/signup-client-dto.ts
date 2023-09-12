import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsStrongPassword, Matches } from "class-validator";

export class SignUpClientDto {
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

    @IsNotEmpty()
    @ApiProperty({example: "p-8MHLH74DFJBKFK7A2I6OVUSNQI"})
    proposalId: string;

    @IsNotEmpty()
    @IsStrongPassword()
    password: string;
}