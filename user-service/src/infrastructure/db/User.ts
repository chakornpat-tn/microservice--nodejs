import { IUserRepository } from "@/domain/repository/IUserRepository";
import { prisma } from "./prismaClient";

export const userRepository: IUserRepository = {
  async create(data) {
    return await prisma.user.create({
      data,
    });
  },

  async findByID(id) {
    return await prisma.user.findUnique({
      where: { id },
    });
  },

  async findByEmail(email) {
    return await prisma.user.findUnique({ where: { email } });
  },

  async updateSsoId(id, ssoId) {
    return await prisma.user.update({
      where: { id },
      data: { ssoId },
    });
  }
};
