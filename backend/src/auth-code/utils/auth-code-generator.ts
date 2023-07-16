import { AuthCode } from "../entities/auth-code";
import { ReasonEnum } from "../entities/reason-enum";

const CODE_LENGTH = 8;

export default function generateAuthCode(reason: ReasonEnum): AuthCode {
    let authCode = new AuthCode(reason);
    authCode.code = generateCode(CODE_LENGTH);
    return authCode;
}

function generateCode(length: number): string {
    let code = "";
    
    for(let i=0; i<length; i++) {
        code += Math.floor(Math.random() * 9);    
    }

    return code;
}