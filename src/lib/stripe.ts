import { loadStripe, type Stripe } from "@stripe/stripe-js";

type StripeEnv = "sandbox" | "live";

const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN;

const NOT_CONFIGURED =
  "Payments aren't set up for this version of the app yet. Finish Stripe go-live to accept payments here.";

// Derive the environment from the token PREFIX — never fall through to "live"
// when the token is missing, or checkout fails with a cryptic server error.
function paymentsEnvironment(): StripeEnv {
  if (clientToken?.startsWith("pk_test_")) return "sandbox";
  if (clientToken?.startsWith("pk_live_")) return "live";
  throw new Error(NOT_CONFIGURED);
}

export function isPaymentsConfigured(): boolean {
  return Boolean(clientToken?.startsWith("pk_test_") || clientToken?.startsWith("pk_live_"));
}

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    paymentsEnvironment();
    stripePromise = loadStripe(clientToken as string);
  }
  return stripePromise;
}

export function getStripeEnvironment(): StripeEnv {
  return paymentsEnvironment();
}

/** For read paths (subscription lookups, sync) that must not crash when
 * payments aren't configured for this build. */
export function getStripeEnvironmentSafe(): StripeEnv {
  return clientToken?.startsWith("pk_live_") ? "live" : "sandbox";
}

export const PAYMENTS_NOT_CONFIGURED_MESSAGE = NOT_CONFIGURED;
