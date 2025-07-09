import { OutboxEvent } from '../../domain/entities/outboxEvent';

export interface IOutboxRepository {
  findUnprocessedEvents(): Promise<OutboxEvent[]>;
  markEventAsProcessed(source: string, eventId: number): Promise<void>;
}
