"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function PaymentStatusNotice() {
  const searchParams = useSearchParams();
  const paypalStatus = searchParams.get("paypal");

  if (paypalStatus === "success") {
    return (
      <div
        aria-live="polite"
        className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-4 text-sm leading-6 text-green-900"
      >
        <div className="flex gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-green-600" />
          <div>
            <p className="font-semibold">Your PayPal checkout is being confirmed.</p>
            <p className="mt-1">
              It can take a moment for PayPal to notify BG Remover. If your plan
              does not update right away, refresh this page in a minute.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (paypalStatus === "cancelled") {
    return (
      <div
        aria-live="polite"
        className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-950"
      >
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-none text-amber-600" />
          <div>
            <p className="font-semibold">PayPal checkout was not completed.</p>
            <p className="mt-1">
              No charge was made. If PayPal showed a security check or could not
              set up a preapproved payment, try again later, use a verified
              PayPal account email, or contact us for help.
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <a
                href="mailto:support@bg-remover.xyz?subject=PayPal%20checkout%20help"
                className="font-semibold text-amber-900 underline underline-offset-4"
              >
                Contact support
              </a>
              <Link
                href="/pricing"
                className="font-semibold text-amber-900 underline underline-offset-4"
              >
                View plans again
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
