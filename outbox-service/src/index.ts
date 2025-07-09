import { CatalogOutboxRepository } from './infrastructure/db/catalogOutboxRepository';
import { OrderOutboxRepository } from './infrastructure/db/orderOutboxRepository';
import { KafkaMessageBroker } from './infrastructure/messaging/kafkaMessageBroker';
import { ProcessOutboxEvents } from './application/useCases/processOutboxEvents';
import { setupCron } from './infrastructure/cron';

const catalogRepository = new CatalogOutboxRepository();
const orderRepository = new OrderOutboxRepository();
const messageBroker = new KafkaMessageBroker();

const processOutboxEvents = new ProcessOutboxEvents(
  [catalogRepository, orderRepository],
  messageBroker
);

async function startService() {
  await messageBroker.connect();
  setupCron(processOutboxEvents);
  console.log('Outbox Service Started. Waiting for cron job to trigger...');
}

startService();