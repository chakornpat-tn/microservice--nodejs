import { trace } from "@opentelemetry/api";

export async function traceOperation<T>(
  operationName: string,
  parentSpan: any,
  operation: () => Promise<T>
): Promise<T> {
  const tracer = trace.getTracer("catalog-service");

  return await tracer.startActiveSpan(operationName, async (span) => {
    try {
      const result = await operation();
      span.setAttributes({ "operation.success": true });
      return result;
    } catch (error) {
      span.recordException(error as Error);
      span.setAttributes({
        "operation.success": false,
        "error.message":
          error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    } finally {
      span.end();
    }
  });
}
