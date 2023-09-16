import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, Length, Matches } from "class-validator";
import { ProposalDto } from "./proposal-dto";
import { InvitationDto } from "./invitation-dto";

export class UserDto {
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

    @IsArray()
    @ApiProperty({type: [ProposalDto], isArray: true})
    proposals: Array<ProposalDto>;

    @IsArray()
    @ApiProperty({type: [InvitationDto], isArray: true})
    invitations: Array<InvitationDto>;
}