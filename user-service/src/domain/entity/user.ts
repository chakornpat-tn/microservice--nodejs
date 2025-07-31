export type User = {
  id: string;
  email: string;
  password: string | null;
  name: string | null;
  ssoId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export const CreateUserEntity = (input:{
  email: string;
  password?: string;
  name?: string;
  ssoId?: string;
}): User => {
  return {
    id: crypto.randomUUID(),
    email: input.email,
    password: input.password ?? null,
    name: input.name ?? null,
    ssoId: input.ssoId ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

export const ValidateUserEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}