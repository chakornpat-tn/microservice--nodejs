import { PrismaClient as OrderPrismaClient, OrderOutboxEvent } from '../../../generated/prisma/order';
import { IOutboxRepository } from 'application/interfaces/outboxRepository';
import { OutboxEvent } from 'domain/entities/outboxEvent';

export class OrderOutboxRepository implements IOutboxRepository {
  private prisma: OrderPrismaClient;

  constructor() {
    this.prisma = new OrderPrismaClient();
  }

  async findUnprocessedEvents(): Promise<OutboxEvent[]> {
    return this.prisma.orderOutboxEvent.findMany({
      where: { processed: false },
    });
  }

async markEventAsProcessed(source: string, eventId: number): Promise<void> {
    await this.prisma.orderOutboxEvent.update({
      where: { id: eventId },
      data: { processed: true, publishedAt: new Date() },
    });
  }
}
