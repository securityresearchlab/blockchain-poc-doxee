import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumberString, IsOptional, MaxLength, MinLength } from "class-validator";

export class LoginUserDto {
    @IsNotEmpty()
    @ApiProperty({example: "email@doxee.com"})
    email: string;

    @IsOptional()
    @MinLength(8)
    @MaxLength(8)
    @IsNumberString()
    @ApiProperty({example: "12345678"})
    code: string;
}