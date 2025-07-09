import { IOutboxRepository } from '../interfaces/outboxRepository';
import { IMessageBroker } from '../interfaces/messageBroker';

export class ProcessOutboxEvents {
  constructor(
    private outboxRepositories: IOutboxRepository[],
    private messageBroker: IMessageBroker
  ) {}

  async execute() {
    try {
      for (const repo of this.outboxRepositories) {
        const events = await repo.findUnprocessedEvents();
        for (const event of events) {
          await this.messageBroker.publishEvent(event);
          await repo.markEventAsProcessed(event.source, event.id);
          console.log(`Published event ${event.id} from ${event.source}`);
        }
      }
    } catch (error) {
      console.error('Error processing outbox events:', error);
    }
  }
}
