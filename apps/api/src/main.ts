import { telemetryConfig } from "@repo/config";
import { startTelemetry } from "@repo/telemetry";

startTelemetry({
  config: telemetryConfig,
  serviceName: "api",
});

await import("./index");
