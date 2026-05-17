export const dynamic = "force-dynamic";

class SentryExampleAPIError extends Error {
  constructor(message: string | undefined) {
    super(message);
    this.name = "SentryExampleAPIError";
  }
}

// A faulty API route to test Sentry's error monitoring
export async function GET() {
  if (process.env.NEXT_PUBLIC_SENTRY_ENABLED === "true") {
    const Sentry = await import("@sentry/nextjs");
    Sentry.logger.info("Sentry example API called");
  }

  throw new SentryExampleAPIError(
    "This error is raised on the backend called by the example page.",
  );
}
