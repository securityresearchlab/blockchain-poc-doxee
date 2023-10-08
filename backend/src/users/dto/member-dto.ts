import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsDate, IsEnum, IsNotEmpty } from "class-validator";
import { Member } from "src/blockchain/entities/member";
import { MemberStatusEnum } from "src/blockchain/entities/member-status-enum";
import { NodeDto } from "./node-dto";

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

    @IsArray()
    @ApiProperty({type: [NodeDto], isArray: true})
    nodes: Array<NodeDto>;

    constructor(member: Member) {
        this.memberId = member.memberId;
        this.name = member.name;
        this.creationDate = member.creationDate;
        this.isOwned = member.isOwned;
        this.status = member.status;
        this.nodes = member.nodes;
    }
}