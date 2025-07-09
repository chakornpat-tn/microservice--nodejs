import cron from 'node-cron';
import { ProcessOutboxEvents } from '../../application/useCases/processOutboxEvents';

export function setupCron(processOutboxEvents: ProcessOutboxEvents) {
  cron.schedule('*/10 * * * * *', () => {
    console.log('Running outbox event processing job...');
    processOutboxEvents.execute();
  });
}
