"use client";

import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";
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
        <div className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs leading-5 text-red-700">
          <p className="font-semibold">{error}</p>
          <p className="mt-1">
            No charge was made. You can try again, keep using the free plan, or{" "}
            <a
              href="mailto:support@bg-remover.xyz?subject=PayPal%20checkout%20help"
              className="font-semibold underline underline-offset-4"
            >
              contact support
            </a>
            .
          </p>
        </div>
      ) : null}
      <p className="mt-2 flex items-start justify-center gap-1.5 text-center text-xs leading-5 text-gray-500">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 flex-none" />
        Secure checkout by PayPal. You are charged only after approving the
        plan on PayPal.
      </p>
    </div>
  );
}
