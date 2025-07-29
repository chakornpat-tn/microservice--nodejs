import { EventLog } from "../../entities/eventLog";
import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();

export const eventLog = {
  async createEventLog(data: EventLog) {
    try {
      const eventLog = await prisma.eventLog.create({
        data,
      });
      return eventLog;
    } catch (error) {
      console.error("Error creating event log:", error);
      throw error;
    }
  },

  async getEventLogs() {
    try {
      const logs = await prisma.eventLog.findMany();
      return logs;
    } catch (error) {
      console.error("Error fetching event logs:", error);
      throw error;
    }
  },
};
