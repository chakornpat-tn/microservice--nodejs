import { FastifyInstance } from "fastify";
import { CreateUserSchema } from "../schema/createUserSchema";
import { createUser } from "@/application/user/command/createuser";
import { userRepository } from "@/infrastructure/db/User";

export default async function CreateUserRoute(app: FastifyInstance) {
    app.post("/users", async (request, reply) => {
        const req = CreateUserSchema.safeParse(request)
        if(!req.success) {
            console.log('Invalid input:', req.error);
            return reply.status(400).send("Invalid input");
        }

        const createUserUsecase = createUser({
            repository: userRepository
        })
        try {
            const result = await createUserUsecase(req.data.body)
            return reply.status(200).send(result);
        } catch (error) {
            console.log({
                error: error instanceof Error ? `Create User Error: ${error.message}` : "Create User Error: Unknown error",
            });
            return reply.status(500).send("create user error");
        }

    })
}
