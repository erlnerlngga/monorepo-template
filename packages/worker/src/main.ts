import { telemetryConfig } from "@repo/config";
import { startTelemetry } from "@repo/telemetry";

startTelemetry({
  config: telemetryConfig,
  serviceName: "worker",
});

const { runWorker } = await import("./index");

runWorker();
