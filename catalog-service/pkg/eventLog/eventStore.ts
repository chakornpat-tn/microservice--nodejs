import {
  KurrentDBClient,
  jsonEvent,
  FORWARDS,
  START,
} from "@kurrent/kurrentdb-client";

const client = KurrentDBClient.connectionString`
  kurrentdb://localhost:2113?tls=false
`;

export interface IEventLog {
  source: string;
  eventType: string;
  payload: Record<string, unknown>;
}

export async function createEventLog(data: IEventLog): Promise<void> {
  const { source, eventType, payload } = data;

  const event = jsonEvent({
    type: eventType,
    data: payload,
  });

  const streamName = `${source}-${eventType}`;

  await client.appendToStream(streamName, [event]);
}

export async function readEventLog(
  source: string,
  eventType: string,
  maxCount = 100
) {
  const streamName = `${source}-${eventType}`;
  const events = client.readStream(streamName, {
    direction: FORWARDS,
    fromRevision: START,
    maxCount,
  });
  const result: any[] = [];
  for await (const e of events) {
    result.push(e.event?.data);
  }
  return result;
}