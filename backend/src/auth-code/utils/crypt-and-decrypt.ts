// import * as bcrypt from 'bcrypt';

export async function hash(password: string): Promise<string> {
  // return await bcrypt.hash(password, await bcrypt.genSalt());
  return password;
}

export async function isMatch(password, hash): Promise<boolean> {
  // return await bcrypt.compare(password, hash);
  return password === hash;
}
