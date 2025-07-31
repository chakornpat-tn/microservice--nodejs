import { IUserRepository } from "@/domain/repository/IUserRepository";
import * as UserEntity from "@/domain/entity/user";
import { hashPassword } from "@/shared/utils/bcrypt";

type createUserRequest = {
  email: string;
  password?: string;
  name?: string;
  ssoId?: string;
};

export const createUser =
  (deps: { repository: IUserRepository }) => async (req: createUserRequest) => {
    if (req.password) req.password = await hashPassword(req.password);

    const entity = UserEntity.CreateUserEntity(req);
    
    return await deps.repository.create(entity);
  };
