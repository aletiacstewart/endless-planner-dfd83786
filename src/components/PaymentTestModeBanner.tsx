const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN;

export function PaymentTestModeBanner() {
  if (!clientToken) {
    return (
      <div className="w-full border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-center text-sm text-destructive">
        Production checkout is not configured. Complete Stripe go-live to accept real payments.
      </div>
    );
  }

  if (clientToken.startsWith("pk_test_")) {
    return (
      <div className="w-full border-b border-accent/40 bg-accent/15 px-4 py-2 text-center text-sm text-foreground">
        Payments in this preview are in test mode. No real charges are made.
      </div>
    );
  }

  return null;
}