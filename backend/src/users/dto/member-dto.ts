import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsDate, IsEnum, IsNotEmpty } from "class-validator";
import { Member } from "src/blockchain/entities/member";
import { MemberStatusEnum } from "src/blockchain/entities/member-status-enum";

export class MemberDto {
    @IsNotEmpty()
    memberId: string;

    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    @IsDate()
    creationDate: Date;

    @IsNotEmpty()
    @IsBoolean()
    isOwned: boolean;

    @IsNotEmpty()
    @IsEnum(MemberStatusEnum)
    @ApiProperty({enum: MemberStatusEnum})
    status: MemberStatusEnum;

    constructor(member: Member) {
        this.memberId = member.memberId;
        this.name = member.name;
        this.creationDate = member.creationDate;
        this.isOwned = member.isOwned;
        this.status = member.status;
    }
}