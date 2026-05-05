import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  plannerId?: string;
  priceId?: string;
  quantity?: number;
  customerEmail?: string;
  returnUrl?: string;
  packIds?: string[];
}

export function StripeEmbeddedCheckout({ plannerId, priceId, quantity, customerEmail, returnUrl, packIds }: Props) {
  const fetchClientSecret = async (): Promise<string> => {
    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: { plannerId, priceId, quantity, customerEmail, returnUrl, packIds, environment: getStripeEnvironment() },
    });
    if (error || !data?.clientSecret) throw new Error(error?.message || "Failed to create checkout session");
    return data.clientSecret;
  };

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
