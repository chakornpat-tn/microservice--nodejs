export const KAFKA_BROKERS = [process.env.BROKER_1 || 'localhost:9092'];
export const KAFKA_CLIENT_ID = process.env.CLIENT_ID || 'outbox-service';
