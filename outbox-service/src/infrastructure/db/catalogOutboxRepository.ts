import { PrismaClient as CatalogPrismaClient, CatalogOutboxEvent } from '../../../generated/prisma/catalog';
import { IOutboxRepository } from 'application/interfaces/outboxRepository';
import { OutboxEvent } from 'domain/entities/outboxEvent';

export class CatalogOutboxRepository implements IOutboxRepository {
  private prisma: CatalogPrismaClient;

  constructor() {
    this.prisma = new CatalogPrismaClient();
  }

  async findUnprocessedEvents(): Promise<OutboxEvent[]> {
    return this.prisma.catalogOutboxEvent.findMany({
      where: { processed: false },
    });
  }

async markEventAsProcessed(source: string, eventId: number): Promise<void> {
    await this.prisma.catalogOutboxEvent.update({
      where: { id: eventId },
      data: { processed: true, publishedAt: new Date() },
    });
  }
}
