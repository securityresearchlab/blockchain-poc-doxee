import jwtdecode from "jwt-decode";

export class JwtUtilities {
  static isExpired(token?: string | null): boolean {
    if (token == null || token == undefined) return true;
    const user: any = jwtdecode(token);
    const now = new Date().getTime().toString();
    if (new Date(Number(now.substring(0, now.length - 3))) < new Date(user.exp)) return false;
    return true;
  }
}
