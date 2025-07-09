import cron from 'node-cron';
import { ProcessOutboxEvents } from '../../application/useCases/processOutboxEvents';

export function setupCron(processOutboxEvents: ProcessOutboxEvents) {
  cron.schedule('*/10 * * * * *', () => {
    processOutboxEvents.execute();
  });
}
