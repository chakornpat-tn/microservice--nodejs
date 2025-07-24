import { Counter, Registry, collectDefaultMetrics } from "prom-client";

const register = new Registry();

collectDefaultMetrics({ register });

const httpRequestCounter = new Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
});

register.registerMetric(httpRequestCounter);

export function recordHttpRequest(method: string, route: string, statusCode: number) {
  httpRequestCounter.inc({
    method,
    route,
    status_code: statusCode.toString(),
  });
}

export async function getMetrics() {
  return register.metrics();
}

export const metricsContentType = register.contentType;