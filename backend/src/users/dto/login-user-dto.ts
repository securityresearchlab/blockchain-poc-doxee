import { IsNotEmpty, IsOptional } from "class-validator";

export class LoginUserDto {
    @IsNotEmpty()
    email: string;

    @IsOptional()
    code: string;
}