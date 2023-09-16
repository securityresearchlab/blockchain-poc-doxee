import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsEnum, IsNotEmpty } from "class-validator";
import { Invitation } from "src/blockchain/entities/invitation";
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

    constructor(invitation: Invitation) {
        this.invitationId = invitation.invitationId;
        this.creationDate = invitation.creationDate;
        this.expirationDate = invitation.expirationDate;
        this.status = invitation.status;
    }
}