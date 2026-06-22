import { loggerConfig, redisConfig } from "@repo/config";
import { createLogger } from "@repo/logger";
import { Queue, QueueEvents, Worker, type ConnectionOptions } from "bullmq";

export const logger = createLogger({
  ...loggerConfig,
  service: "worker",
});

export const connection: ConnectionOptions = {
  url: redisConfig.url,
  maxRetriesPerRequest: null,
};

export type ExampleJob = {
  message: string;
};

export const exampleQueue = new Queue<ExampleJob>("example", {
  connection,
});

export const exampleQueueEvents = new QueueEvents("example", {
  connection,
});

export function startExampleWorker() {
  return new Worker<ExampleJob>(
    "example",
    async (job) => {
      logger.info({ jobId: job.id, message: job.data.message }, "Processing job");
      return { processedAt: new Date().toISOString() };
    },
    { connection },
  );
}

export function runWorker() {
  const worker = startExampleWorker();

  worker.on("completed", (job) => {
    logger.info({ jobId: job.id }, "Job completed");
  });

  worker.on("failed", (job, error) => {
    logger.error({ error, jobId: job?.id }, "Job failed");
  });

  return worker;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runWorker();
}
