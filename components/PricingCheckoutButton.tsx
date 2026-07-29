"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";

interface PricingCheckoutButtonProps {
  plan: "starter" | "creator";
  className: string;
  children: React.ReactNode;
}

export default function PricingCheckoutButton({
  plan,
  className,
  children,
}: PricingCheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/paypal/create-subscription", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      });

      if (response.status === 401) {
        window.location.href = "/api/auth/login?next=/pricing";
        return;
      }

      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.approvalUrl) {
        throw new Error(data?.message || "PayPal checkout is unavailable.");
      }

      window.location.href = data.approvalUrl;
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "PayPal checkout is unavailable."
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={handleCheckout}
        disabled={isLoading}
        className={className}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Opening PayPal
          </>
        ) : (
          <>
            {children}
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
      {error ? (
        <p className="mt-2 text-center text-xs leading-5 text-red-600">{error}</p>
      ) : null}
    </div>
  );
}
