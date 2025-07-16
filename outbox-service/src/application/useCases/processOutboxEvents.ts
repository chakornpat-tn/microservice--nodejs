import { Span } from "@opentelemetry/api";
import { IOutboxRepository } from "../interfaces/outboxRepository";
import { IMessageBroker } from "../interfaces/messageBroker";
import {
  context,
  trace,
  propagation,
  SpanStatusCode,
} from "@opentelemetry/api";

export class ProcessOutboxEvents {
  constructor(
    private outboxRepositories: IOutboxRepository[],
    private messageBroker: IMessageBroker
  ) {}

  async execute() {
    try {
      const tracer = trace.getTracer("outbox-service");

      for (const repo of this.outboxRepositories) {
        const events = await repo.findUnprocessedEvents();

        for (const event of events) {
          let span: Span | undefined;

          try {
            const parsedPayload =
              typeof event.payload === "string"
                ? JSON.parse(event.payload)
                : event.payload;

            const traceContext = parsedPayload?.traceContext;

            let parentCtx = context.active();
            if (traceContext && typeof traceContext === "object") {
              parentCtx = propagation.extract(parentCtx, traceContext);
            }

            await context.with(parentCtx, async () => {
              span = tracer.startSpan(`publish ${event.eventType}`, {
                attributes: {
                  "messaging.system": "outbox",
                  "messaging.destination": event.topic,
                  "messaging.event_type": event.eventType,
                  "event.source": event.source,
                  "outbox.event_id": event.id,
                },
              });

              await context.with(trace.setSpan(parentCtx, span), async () => {
                await this.messageBroker.publishEvent(event);
                await repo.markEventAsProcessed(event.source, event.id);
              });

              span.setStatus({ code: SpanStatusCode.OK });
              span.end();
            });

            console.log(`Published event ${event.id} from ${event.source}`);
          } catch (err) {
            if (span) {
              span.recordException(err as Error);
              span.setStatus({
                code: SpanStatusCode.ERROR,
                message: "Publish failed",
              });
              span.end();
            }
            console.error(`Error in processing event ${event.id}:`, err);
          }
        }
      }
    } catch (error) {
      console.error("Error processing outbox events:", error);
    }
  }
}
