import { msalClient } from "@/infrastructure/oauth/microsoftClient";
import { userRepository } from "@/infrastructure/db/User";
import { signToken } from "@/shared/utils/jwt";
import { IUserRepository } from "@/domain/repository/IUserRepository";
import { CreateUserEntity } from "@/domain/entity/user";

type msLoginRequest = {
  code: string;
  redirectUri: string;
};

export const LoginWithMicrosoft =
  (deps: { repository: IUserRepository }) =>
  async (request: msLoginRequest) => {
    const tokenResponse = await msalClient.acquireTokenByCode({
      code: request.code,
      redirectUri: request.redirectUri,
      scopes: ["user.read"],
    });

    console.log({
      tokenResponse,
    });
    const email = tokenResponse.account?.username;
    if (!email) throw new Error("MS Authentication Failed");

    let user = await deps.repository.findByEmail(email);

    const ssoId = tokenResponse.account?.homeAccountId;

    if (!user) {
      const name = tokenResponse.account?.name;
      const entity = CreateUserEntity({
        email,
        name,
        ssoId,
      });
      user = await deps.repository.create(entity);
    } else if (!user.ssoId && ssoId) {
      user = await deps.repository.updateSsoId(user.id, ssoId);
    }


    const token = signToken({ userId: user.id });
    return { token, user };
  };
