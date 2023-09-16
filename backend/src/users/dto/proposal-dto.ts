import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsEnum, IsNotEmpty } from "class-validator";
import { ProposalStatusEnum } from "src/blockchain/entities/proposal-status-enum";

export class ProposalDto {
    @IsNotEmpty()
    proposalId: string;

    @IsNotEmpty()
    @IsDate()
    creationDate: Date;

    @IsNotEmpty()
    @IsDate()
    expirationDate: Date;

    @IsNotEmpty()
    @IsEnum(ProposalStatusEnum)
    @ApiProperty({enum: ProposalStatusEnum})
    status: ProposalStatusEnum;
}