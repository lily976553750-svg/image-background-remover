import AuthButton from "@/components/AuthButton";
import Footer from "@/components/Footer";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Image as ImageIcon,
  Info,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";

const corePlans = [
  {
    name: "Free",
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
    price: "$8.99",
    period: "per month",
    allowance: "25 images",
    description: "For personal projects, profile images, and occasional product photos.",
    cta: "Choose Starter",
    href: "mailto:support@bg-remover.xyz?subject=Starter%20plan",
    features: [
      "25 successful background removals per month",
      "Google account sign-in",
      "No automatic overage charges",
      "Monthly allowance refresh",
    ],
  },
  {
    name: "Creator",
    price: "$19.99",
    period: "per month",
    allowance: "80 images",
    description: "For creators, small shops, and repeat image cleanup workflows.",
    cta: "Choose Creator",
    href: "mailto:support@bg-remover.xyz?subject=Creator%20plan",
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

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
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
        </section>

        <section className="border-y border-gray-100 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 py-10">
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
                    <ArrowRight className="h-4 w-4" />
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
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}
