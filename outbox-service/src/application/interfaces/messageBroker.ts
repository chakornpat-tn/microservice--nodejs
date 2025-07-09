import { OutboxEvent } from '../../domain/entities/outboxEvent';

export interface IMessageBroker {
  publishEvent(event: OutboxEvent): Promise<void>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}
