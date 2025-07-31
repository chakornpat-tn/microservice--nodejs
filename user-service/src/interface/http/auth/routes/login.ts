import { FastifyInstance } from "fastify";
import { userRepository } from "@/infrastructure/db/User";
import { EmailLoginSchema } from "../schema/loginSchema";
import { LoginWithEmail } from "@/application/auth/command/loginWithEmail";
import { msalClient } from "@/infrastructure/oauth/microsoftClient";
import { LoginWithMicrosoft } from "@/application/auth/command/loginWithMicrosoft";

export default async function AuthRoute(app: FastifyInstance) {
  app.post("/auth/login", async (request, reply) => {
    const req = EmailLoginSchema.safeParse(request);
    if (!req.success) {
      console.log("Invalid input:", req.error);
      return reply.status(400).send("Invalid input");
    }

    const authUsecase = LoginWithEmail({
      repository: userRepository,
    });
    try {
      const result = await authUsecase(req.data.body);
      return reply.status(200).send(result);
    } catch (error) {
      console.log({
        error:
          error instanceof Error
            ? `Auth Error: ${error.message}`
            : "Auth Error: Unknown error",
      });
      return reply.status(401).send("auth error");
    }
  });
  app.get("/auth/microsoft/callback", async (request, reply) => {
    const { code } = request.query as { code?: string };

    if (!code) {
      return reply.status(400).send({ message: "Missing code" });
    }

    try {
      const authUsecase = LoginWithMicrosoft({
        repository: userRepository,
      });

      const result = await authUsecase({
        code,
        redirectUri: process.env.MICROSOFT_REDIRECT_URI!,
      });

      return reply.send(result);
    } catch (e) {
      console.error("Microsoft login error:", e);
      return reply.status(401).send({ message: "Unauthorized" });
    }
  });
  app.get("/auth/microsoft/login", async (_, reply) => {
    const url = await msalClient.getAuthCodeUrl({
      redirectUri: process.env.MICROSOFT_REDIRECT_URI!,
      scopes: ["user.read"],
    });

    reply.redirect(url);
  });
}
