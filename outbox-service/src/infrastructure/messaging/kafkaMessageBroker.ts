import { Kafka, Partitioners, Producer } from 'kafkajs';
import { IMessageBroker } from '../../application/interfaces/messageBroker';
import { OutboxEvent } from '../../domain/entities/outboxEvent';
import { KAFKA_BROKERS, KAFKA_CLIENT_ID } from '../../config';

export class KafkaMessageBroker implements IMessageBroker {
  private kafka: Kafka;
  private producer: Producer;

  constructor() {
    this.kafka = new Kafka({
      clientId: KAFKA_CLIENT_ID,
      brokers: KAFKA_BROKERS,
    });
    this.producer = this.kafka.producer({
      createPartitioner: Partitioners.DefaultPartitioner,
    });
  }

  async connect(): Promise<void> {
    await this.producer.connect();
    console.log('Kafka Producer Connected');
  }

  async disconnect(): Promise<void> {
    await this.producer.disconnect();
    console.log('Kafka Producer Disconnected');
  }

  async publishEvent(event: OutboxEvent): Promise<void> {
    await this.producer.send({
      topic: event.topic,
      messages: [
        {
          key: event.key,
          value: JSON.stringify(event.payload),
          headers: {
            eventType: event.eventType,
            source: event.source,
            timestamp: event.timestamp.toISOString(),
          },
        },
      ],
    });
  }
}
