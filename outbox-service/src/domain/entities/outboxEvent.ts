
export interface OutboxEvent {
  id: number;
  eventType: string;
  source: string;
  payload: any;
  timestamp: Date;
  processed: boolean;
  publishedAt: Date | null;
  topic: string;
  key: string;
}
