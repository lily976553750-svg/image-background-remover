import AuthButton from "@/components/AuthButton";
import Footer from "@/components/Footer";
import PaymentStatusNotice from "@/components/PaymentStatusNotice";
import PricingCheckoutButton from "@/components/PricingCheckoutButton";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowRight,
  CircleDollarSign,
  Check,
  CreditCard,
  Image as ImageIcon,
  Info,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing | BG Remover",
  description:
    "Compare BG Remover pricing plans. Start free, upgrade to Starter or Creator monthly credits, and avoid automatic overage charges.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "Pricing | BG Remover",
    description:
      "Compare monthly image credit plans for BG Remover.",
    url: "https://bg-remover.xyz/pricing",
    siteName: "BG Remover",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Pricing | BG Remover",
    description:
      "Compare monthly image credit plans for BG Remover.",
  },
};

const pricingJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "BG Remover",
  description:
    "Online background remover with monthly image credit plans.",
  brand: {
    "@type": "Brand",
    name: "BG Remover",
  },
  offers: [
    {
      "@type": "Offer",
      name: "Free",
      price: "0",
      priceCurrency: "USD",
      url: "https://bg-remover.xyz/",
      availability: "https://schema.org/InStock",
    },
    {
      "@type": "Offer",
      name: "Starter",
      price: "8.99",
      priceCurrency: "USD",
      url: "https://bg-remover.xyz/pricing",
      availability: "https://schema.org/InStock",
    },
    {
      "@type": "Offer",
      name: "Creator",
      price: "19.99",
      priceCurrency: "USD",
      url: "https://bg-remover.xyz/pricing",
      availability: "https://schema.org/InStock",
    },
  ],
};

const corePlans = [
  {
    name: "Free",
    label: "Try it",
    price: "$0",
    period: "forever",
    allowance: "3 images",
    description: "For trying BG Remover with a verified Google account.",
    cta: "Start free",
    href: "/",
    features: [
      "3 successful background removals per month",
      "JPG, PNG, and WebP support",
      "Transparent PNG downloads",
      "10MB image size limit",
    ],
  },
  {
    name: "Starter",
    label: "Occasional use",
    price: "$8.99",
    period: "per month",
    allowance: "25 images",
    description: "For personal projects, profile images, and occasional product photos.",
    cta: "Choose Starter",
    href: "paypal:starter",
    features: [
      "25 successful background removals per month",
      "Google account sign-in",
      "No automatic overage charges",
      "Monthly allowance refresh",
    ],
  },
  {
    name: "Creator",
    label: "Recommended",
    price: "$19.99",
    period: "per month",
    allowance: "80 images",
    description: "For creators, small shops, and repeat image cleanup workflows.",
    cta: "Choose Creator",
    href: "paypal:creator",
    highlighted: true,
    features: [
      "80 successful background removals per month",
      "Best value for regular use",
      "No automatic overage charges",
      "Upgrade prompt when allowance is used",
    ],
  },
];

const volumePlans = [
  {
    name: "Pro",
    price: "$49.99",
    allowance: "220 images / month",
    note: "For high-volume sellers and small teams.",
  },
  {
    name: "Business",
    price: "$99.99",
    allowance: "500 images / month",
    note: "For studios, agencies, and heavier catalog work.",
  },
];

const rules = [
  "1 successful background removal uses 1 credit.",
  "Failed uploads, unsupported files, oversized files, and unclear subjects do not use credits.",
  "Monthly allowances refresh every billing month and do not roll over.",
  "When your allowance runs out, BG Remover shows an upgrade prompt and never charges automatically.",
  "Images are limited to 10MB and supported formats are JPG, PNG, and WebP.",
];

const faqs = [
  {
    question: "What happens when I run out of credits?",
    answer:
      "You will see an upgrade prompt. BG Remover does not automatically charge you for extra usage.",
  },
  {
    question: "Do unused monthly credits roll over?",
    answer:
      "No. Monthly allowances refresh each billing month and unused credits do not carry over.",
  },
  {
    question: "What counts as 1 credit?",
    answer:
      "Only a successful background removal counts as 1 credit. Failed uploads, oversized files, unsupported formats, and unclear subjects do not use credits.",
  },
  {
    question: "Why are Pro and Business not shown as main plans?",
    answer:
      "Most users only need Starter or Creator. Pro and Business are reserved for higher-volume workflows and can be activated when demand is clear.",
  },
  {
    question: "Why does PayPal ask for a security check?",
    answer:
      "PayPal may ask for a captcha, login verification, or account check based on its own risk system. BG Remover cannot control that PayPal screen, and no charge is made until you approve the subscription on PayPal.",
  },
  {
    question: "What if PayPal cannot approve the subscription?",
    answer:
      "That usually means PayPal could not approve the checkout for that account, browser, network, or region at that moment. You can try again later, use a verified PayPal account email, or contact support.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(pricingJsonLd),
        }}
      />
      <header className="w-full py-6 px-4 border-b border-gray-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800">BG Remover</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className="hidden text-sm text-gray-600 hover:text-gray-900 transition-colors sm:inline"
            >
              Tool
            </Link>
            <Link
              href="/pricing"
              className="hidden text-sm font-semibold text-blue-600 sm:inline"
            >
              Pricing
            </Link>
            <AuthButton />
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full">
        <section className="max-w-6xl mx-auto px-4 py-14 md:py-18">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 mb-5">
                <ShieldCheck className="h-4 w-4" />
                Simple monthly image credits
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-950 mb-4">
                Pricing for clean, transparent product images.
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl">
                Start free, upgrade when you need more, and keep control of your
                monthly usage. Overages never trigger automatic charges.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between rounded-lg bg-white p-1 text-sm font-semibold shadow-sm">
                <span className="rounded-md bg-blue-600 px-4 py-2 text-white">
                  Monthly
                </span>
                <span className="px-4 py-2 text-gray-500">Annual later</span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-white p-3">
                  <div className="text-lg font-bold text-gray-950">10MB</div>
                  <div className="text-xs text-gray-500">max file</div>
                </div>
                <div className="rounded-lg bg-white p-3">
                  <div className="text-lg font-bold text-gray-950">0</div>
                  <div className="text-xs text-gray-500">overage fees</div>
                </div>
                <div className="rounded-lg bg-white p-3">
                  <div className="text-lg font-bold text-gray-950">1:1</div>
                  <div className="text-xs text-gray-500">success credit</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-gray-100 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 py-10">
            <Suspense fallback={null}>
              <PaymentStatusNotice />
            </Suspense>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              {corePlans.map((plan) => (
                <article
                  key={plan.name}
                  className={`relative rounded-lg border bg-white p-6 shadow-sm ${
                    plan.highlighted
                      ? "border-blue-400 ring-2 ring-blue-100"
                      : "border-gray-200"
                  }`}
                >
                  {plan.highlighted ? (
                    <div className="absolute right-5 top-5 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                      Best value
                    </div>
                  ) : null}
                  <div className="mb-6">
                    <div className="mb-3 text-sm font-semibold text-blue-600">
                      {plan.label}
                    </div>
                    <h2 className="text-xl font-bold text-gray-950">{plan.name}</h2>
                    <p className="mt-2 min-h-12 text-sm leading-6 text-gray-600">
                      {plan.description}
                    </p>
                  </div>

                  <div className="mb-5">
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-bold text-gray-950">
                        {plan.price}
                      </span>
                      <span className="pb-1 text-sm font-medium text-gray-500">
                        {plan.period}
                      </span>
                    </div>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-800">
                      <ImageIcon className="h-4 w-4" />
                      {plan.allowance} / month
                    </div>
                  </div>

                  <PlanAction
                    href={plan.href}
                    className={`mb-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors ${
                      plan.highlighted
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "border border-gray-200 bg-white text-gray-800 hover:border-blue-300 hover:text-blue-600"
                    }`}
                  >
                    {plan.cta}
                  </PlanAction>

                  <ul className="space-y-3 text-sm text-gray-700">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-3">
                        <Check className="mt-0.5 h-4 w-4 flex-none text-green-600" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
            <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
              Most new users should start with Free or Starter. Creator is the
              best fit once background removal becomes part of a weekly workflow.
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="flex gap-3 rounded-lg border border-gray-200 bg-white p-4">
                <CreditCard className="mt-0.5 h-5 w-5 flex-none text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-950">PayPal checkout</h3>
                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    Prices are listed in USD. PayPal securely handles checkout
                    and may ask you to sign in or complete a security check.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 rounded-lg border border-gray-200 bg-white p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 flex-none text-green-600" />
                <div>
                  <h3 className="font-semibold text-gray-950">No charge before approval</h3>
                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    If you cancel or PayPal blocks the checkout, no subscription
                    is activated and no charge is made.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 rounded-lg border border-gray-200 bg-white p-4">
                <CircleDollarSign className="mt-0.5 h-5 w-5 flex-none text-amber-600" />
                <div>
                  <h3 className="font-semibold text-gray-950">Payment trouble?</h3>
                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    Try again later with a verified PayPal account email, or
                    contact us if PayPal cannot approve the checkout.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
                <Info className="h-4 w-4" />
                Usage rules
              </div>
              <h2 className="mt-3 text-2xl font-bold text-gray-950">
                Clear limits, no surprise billing.
              </h2>
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {rules.map((rule) => (
                  <div
                    key={rule}
                    className="flex gap-3 rounded-lg border border-gray-200 bg-white p-4"
                  >
                    <Check className="mt-0.5 h-4 w-4 flex-none text-blue-600" />
                    <p className="text-sm leading-6 text-gray-700">{rule}</p>
                  </div>
                ))}
                <div className="flex gap-3 rounded-lg border border-gray-200 bg-white p-4">
                  <X className="mt-0.5 h-4 w-4 flex-none text-gray-500" />
                  <p className="text-sm leading-6 text-gray-700">
                    Unused monthly credits do not carry over to the next month.
                  </p>
                </div>
              </div>
            </div>

            <aside className="rounded-lg border border-gray-200 bg-gray-50 p-6">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-950">Need more?</h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                Pro and Business plans are reserved for high-volume workflows.
              </p>
              <div className="mt-6 space-y-4">
                {volumePlans.map((plan) => (
                  <div
                    key={plan.name}
                    className="rounded-lg border border-gray-200 bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-gray-950">{plan.name}</h3>
                        <p className="mt-1 text-sm text-gray-600">{plan.allowance}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-950">{plan.price}</div>
                        <div className="text-xs text-gray-500">per month</div>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-gray-600">{plan.note}</p>
                  </div>
                ))}
              </div>
              <a
                href="mailto:support@bg-remover.xyz?subject=Volume%20plan"
                className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-gray-950 px-4 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
              >
                Contact us
                <ArrowRight className="h-4 w-4" />
              </a>
            </aside>
          </div>
        </section>

        <section className="border-t border-gray-100 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold text-gray-950">
                Pricing questions
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                The rules are intentionally conservative so users understand
                exactly when credits are used.
              </p>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              {faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="group rounded-lg border border-gray-200 bg-white p-4"
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-4 font-semibold text-gray-950">
                    {faq.question}
                    <span className="text-gray-400 transition-transform group-open:rotate-180">
                      ▼
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-gray-600">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function PlanAction({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: React.ReactNode;
}) {
  if (href === "paypal:starter" || href === "paypal:creator") {
    return (
      <PricingCheckoutButton
        plan={href === "paypal:starter" ? "starter" : "creator"}
        className={className}
      >
        {children}
      </PricingCheckoutButton>
    );
  }

  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className}>
        {children}
        <ArrowRight className="h-4 w-4" />
      </Link>
    );
  }

  return (
    <a href={href} className={className}>
      {children}
      <ArrowRight className="h-4 w-4" />
    </a>
  );
}
