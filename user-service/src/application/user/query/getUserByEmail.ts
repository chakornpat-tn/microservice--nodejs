import { User } from "@/domain/entity/user"
import { IUserRepository } from "@/domain/repository/IUserRepository"

export const GetUserByEmail =
  (deps: { repository: IUserRepository }) => async (email:string): Promise<User | null> => {
    return await deps.repository.findByEmail(email)
  }
