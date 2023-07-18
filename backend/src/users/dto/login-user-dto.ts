import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";

export class LoginUserDto {
    @IsNotEmpty()
    @ApiProperty({example: "email@doxee.com"})
    email: string;

    @IsOptional()
    @ApiProperty({example: "12345678"})
    code: string;
}