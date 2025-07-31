import { IUserRepository } from "@/domain/repository/IUserRepository";
import { comparePassword } from "@/shared/utils/bcrypt";
import { signToken } from "@/shared/utils/jwt";

type userLoginRequest = {
  email: string;
  password: string;
};

export const LoginWithEmail =
  (deps: { repository: IUserRepository }) => async (req: userLoginRequest) => {
    const user = await deps.repository.findByEmail(req.email);
    if (!user || !user.password) throw new Error("User not found");

    const match = await comparePassword(req.password, user.password);
    if (!match) throw new Error("Invalid credentials");

    const token = signToken({ userId: user.id })
    return {
        token,
        user
    }
  };
