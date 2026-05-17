export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initSentry } = await import("./sentry.server.config");
    await initSentry();
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    const { initSentry } = await import("./sentry.edge.config");
    await initSentry();
  }
}

export const onRequestError = async (
  ...args: Parameters<typeof import("@sentry/nextjs").captureRequestError>
) => {
  if (process.env.NEXT_PUBLIC_SENTRY_ENABLED !== "true") {
    return;
  }

  const Sentry = await import("@sentry/nextjs");

  return Sentry.captureRequestError(...args);
};
