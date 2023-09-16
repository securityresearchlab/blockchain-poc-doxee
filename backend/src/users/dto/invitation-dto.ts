import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsEnum, IsNotEmpty } from "class-validator";
import { InvitationStatusEnum } from "src/blockchain/entities/invitation-status-enum";

export class InvitationDto {
    @IsNotEmpty()
    invitationId: string;

    @IsNotEmpty()
    @IsDate()
    creationDate: Date;

    @IsNotEmpty()
    @IsDate()
    expirationDate: Date;

    @IsNotEmpty()
    @IsEnum(InvitationStatusEnum)
    @ApiProperty({enum: InvitationStatusEnum})
    status: InvitationStatusEnum;
}