import pino from "pino";

export type PinoLevel = "fatal" | "error" | "warn" | "info" | "debug" | "trace"

const env: string = process.env.NODE_ENV ?? "development";
const date: string = new Date().toISOString().split("T")[0];

// Store logs inside ./logs/YYYY-MM-DD/
const logDirectory: string = `./logs/${date}`;

const serverTransport = () => {
  if (env === "development") {
    return {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "HH:MM:ss",
        ignore: "pid,hostname",
      },
    };
  }

  return {
    targets: [
      {
        target: "pino/file",
        level: "error",
        options: {
          destination: `${logDirectory}/error.log`,
          mkdir: true,
        },
      },
      {
        target: "pino/file",
        level: "warn",
        options: {
          destination: `${logDirectory}/warn.log`,
          mkdir: true,
        },
      },
    ],
  };
};

export const logger = pino({
  level: env === "production" ? "warn" : "debug",
  browser: {
    transmit: {
      send: (level: pino.Level, logEvent: pino.LogEvent) => {
        fetch("/api/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(logEvent),
        }).catch((e) => console.error(`Client log failed: ${e}`));
      },
    },
  },
  formatters: {
    // level: (label: string) => ({ level: label }), // E.g. "info", "error" // Not allowed in serverless edge builds
    bindings: (_: pino.Bindings) => {
      return {}; // Remove pid/hostname
    },
    log: (object: Record<string, unknown>) => {
      return {
        time: new Date().toISOString(),
        message: object.msg,
        ...object,
      };
    },
  },
  redact: [], // Prevent logging of sensitive data
  transport: serverTransport(),
});
