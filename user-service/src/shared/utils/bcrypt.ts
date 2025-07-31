import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

export function comparePassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash)
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS)
}