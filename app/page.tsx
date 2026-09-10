import Link from "next/link";
import {
  ArrowRight,
  Brush,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  Palette,
  Paintbrush,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";

import HeroSlider from "@/components/HeroSlider";

const features = [
  {
    icon: WalletCards,
    title: "Affordable Pricing",
    description:
      "Beautiful painting and wall design solutions without making your budget uncomfortable.",
  },
  {
    icon: Palette,
    title: "Creative Designs",
    description:
      "Choose from modern, elegant and personalized ideas made for your space.",
  },
  {
    icon: ShieldCheck,
    title: "Professional Service",
    description:
      "A simple service process designed to keep your project organized and stress-free.",
  },
  {
    icon: CalendarCheck,
    title: "Flexible Scheduling",
    description:
      "Pick Fast Service for priority work or Flexible Service for a convenient date range.",
  },
];

const spaces = [
  {
    title: "Bedroom",
    description: "Create a calm and personal retreat.",
    href: "/services/interior-painting/bedroom",
  },
  {
    title: "Living Room",
    description: "Make your main space feel beautiful.",
    href: "/services/interior-painting/living-room",
  },
  {
    title: "Study Room",
    description: "Build a focused and inspiring corner.",
    href: "/services/interior-painting/study-room",
  },
  {
    title: "Kitchen",
    description: "Give your kitchen a fresh new look.",
    href: "/services/interior-painting/kitchen",
  },
  {
    title: "Dining Room",
    description: "A warmer atmosphere for every meal.",
    href: "/services/interior-painting/dining-room",
  },
  {
    title: "Balcony",
    description: "Turn your balcony into a relaxing space.",
    href: "/services/interior-painting/balcony",
  },
  {
    title: "Bathroom",
    description: "Fresh, clean and modern wall finishes.",
    href: "/services/interior-painting/bathroom",
  },
  {
    title: "Wall Designs",
    description: "Add personality with creative wall treatments.",
    href: "/services/wall-designs",
  },
];

const steps = [
  {
    number: "01",
    icon: Sparkles,
    title: "Choose a Service",
    description:
      "Explore Wallora's painting and wall design services and select what fits your space.",
  },
  {
    number: "02",
    icon: Brush,
    title: "Customize Your Order",
    description:
      "Choose quantity and select Fast or Flexible Service according to your schedule.",
  },
  {
    number: "03",
    icon: CalendarCheck,
    title: "Set Your Schedule",
    description:
      "Fast Service lets you choose an exact date. Flexible Service lets you provide a date range.",
  },
  {
    number: "04",
    icon: CheckCircle2,
    title: "Enjoy Your Space",
    description:
      "Wallora handles the service so you can enjoy a refreshed and beautiful home.",
  },
];

export default function HomePage() {
  return (
    <div className="overflow-hidden">

      {/* =====================================================
          HERO
      ===================================================== */}
      <section className="page-container section-padding pt-8 sm:pt-12">
        <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">

          <div className="order-2 lg:order-1">

            <div className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-extrabold uppercase tracking-[0.15em] text-[#687052] neu-surface-small">
              <Sparkles size={15} />
              Modern painting & wall design
            </div>

            <h1 className="heading-xl max-w-2xl">
              Transform your walls.
              <span className="mt-2 block text-[#687052]">
                Transform your home.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-[#777868]">
              Wallora brings affordable painting, creative wall
              designs and thoughtful decoration solutions together
              to create spaces that feel truly yours.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/services"
                className="neu-button neu-button-primary min-h-12"
              >
                Explore Services
                <ArrowRight size={18} />
              </Link>

              <Link
                href="/order"
                className="neu-button neu-button-secondary min-h-12"
              >
                Start an Order
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-5 text-xs font-bold text-[#777868]">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-[#687052]" />
                Affordable
              </span>

              <span className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-[#687052]" />
                Creative
              </span>

              <span className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-[#687052]" />
                Flexible
              </span>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <HeroSlider />
          </div>
        </div>
      </section>

      {/* =====================================================
          FEATURES
      ===================================================== */}
      <section className="page-container section-padding">
        <div className="mb-10 max-w-2xl">
          <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#9a9b78]">
            Why Wallora
          </p>

          <h2 className="heading-lg">
            Designed around the way you live.
          </h2>

          <p className="mt-4 text-sm leading-7 text-[#777868]">
            From choosing a design to scheduling your service,
            Wallora keeps the experience simple, flexible and
            affordable.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="neu-surface rounded-[32px] p-6 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#687052] text-[#fffdf5] shadow-[5px_5px_10px_rgba(151,146,129,0.45),-5px_-5px_10px_rgba(255,252,242,0.75)]">
                  <Icon size={24} />
                </div>

                <h3 className="font-display text-lg font-extrabold text-[#414637]">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-[#777868]">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* =====================================================
          POPULAR / SERVICE CTA
      ===================================================== */}
      <section className="page-container section-padding">
        <div className="neu-surface overflow-hidden rounded-[40px] p-7 sm:p-10 lg:p-14">

          <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">

            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#687052] px-4 py-2 text-xs font-extrabold text-[#fffdf5]">
                <Paintbrush size={14} />
                Wallora Services
              </div>

              <h2 className="heading-lg max-w-2xl">
                From a single feature wall to a complete home refresh.
              </h2>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-[#777868]">
                Explore our painting and decoration services for
                bedrooms, living rooms, kitchens, study rooms,
                balconies and more.
              </p>
            </div>

            <Link
              href="/services"
              className="neu-button neu-button-primary min-h-12 whitespace-nowrap"
            >
              Browse Services
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          EXPLORE BY SPACE
      ===================================================== */}
      <section className="page-container section-padding">

        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#9a9b78]">
              Explore by space
            </p>

            <h2 className="heading-lg">
              Find the right look for every room.
            </h2>
          </div>

          <Link
            href="/services"
            className="flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-extrabold text-[#687052] transition hover:bg-[#dfdacb]"
          >
            All services
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {spaces.map((space, index) => (
            <Link
              key={space.title}
              href={space.href}
              className="group neu-surface rounded-[30px] p-6 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="mb-7 flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e1dccd] font-display text-sm font-extrabold text-[#687052] neu-inset">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className="flex h-10 w-10 items-center justify-center rounded-xl text-[#687052] transition-all group-hover:bg-[#687052] group-hover:text-[#fffdf5]">
                  <ArrowRight size={17} />
                </span>
              </div>

              <h3 className="font-display text-xl font-extrabold text-[#414637]">
                {space.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#777868]">
                {space.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* =====================================================
          HOW IT WORKS
      ===================================================== */}
      <section className="page-container section-padding">

        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#9a9b78]">
            Simple process
          </p>

          <h2 className="heading-lg">
            Your space, four simple steps away.
          </h2>

          <p className="mt-4 text-sm leading-7 text-[#777868]">
            No complicated process. Choose your service,
            schedule it and let Wallora take care of the rest.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className="relative neu-surface rounded-[32px] p-7"
              >
                <div className="mb-6 flex items-center justify-between">
                  <span className="font-display text-3xl font-extrabold text-[#9a9b78]">
                    {step.number}
                  </span>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e1dccd] text-[#687052] neu-inset">
                    <Icon size={21} />
                  </div>
                </div>

                <h3 className="font-display text-lg font-extrabold text-[#414637]">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-[#777868]">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* =====================================================
          FAST VS FLEXIBLE
      ===================================================== */}
      <section className="page-container section-padding">

        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#9a9b78]">
            Choose your pace
          </p>

          <h2 className="heading-lg">
            Service that fits your schedule.
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">

          {/* Fast */}
          <div className="neu-surface rounded-[36px] p-7 sm:p-9">

            <div className="mb-6 flex items-center justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#687052] text-[#fffdf5]">
                <Clock3 size={24} />
              </div>

              <span className="rounded-full bg-[#9a9b78] px-4 py-2 text-xs font-extrabold text-[#fffdf5]">
                Priority
              </span>
            </div>

            <h3 className="heading-md">
              Fast Service
            </h3>

            <p className="mt-3 text-sm leading-7 text-[#777868]">
              Need the work done on a specific date? Choose Fast
              Service and select your exact service date.
            </p>

            <div className="my-7 soft-divider" />

            <div className="space-y-3">
              <ServicePoint text="50% advance payment" />
              <ServicePoint text="Choose an exact service date" />
              <ServicePoint text="Priority scheduling" />
            </div>
          </div>

          {/* Flexible */}
          <div className="neu-surface rounded-[36px] p-7 sm:p-9">

            <div className="mb-6 flex items-center justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e1dccd] text-[#687052] neu-inset">
                <CalendarCheck size={24} />
              </div>

              <span className="rounded-full bg-[#e1dccd] px-4 py-2 text-xs font-extrabold text-[#687052]">
                Flexible
              </span>
            </div>

            <h3 className="heading-md">
              Flexible Service
            </h3>

            <p className="mt-3 text-sm leading-7 text-[#777868]">
              No advance payment. Give us your preferred From–To
              date range and Wallora assigns an available date.
            </p>

            <div className="my-7 soft-divider" />

            <div className="space-y-3">
              <ServicePoint text="No advance payment" />
              <ServicePoint text="Choose a preferred date range" />
              <ServicePoint text="Wallora assigns an available date" />
            </div>
          </div>

        </div>
      </section>

      {/* =====================================================
          TRUST STRIP
      ===================================================== */}
      <section className="page-container section-padding">

        <div className="neu-surface rounded-[36px] p-8 sm:p-10">

          <div className="grid gap-8 text-center sm:grid-cols-3">

            <div>
              <div className="font-display text-3xl font-extrabold text-[#687052]">
                Creative
              </div>

              <p className="mt-2 text-sm text-[#777868]">
                Design-focused solutions
              </p>
            </div>

            <div>
              <div className="font-display text-3xl font-extrabold text-[#687052]">
                Flexible
              </div>

              <p className="mt-2 text-sm text-[#777868]">
                Scheduling made easier
              </p>
            </div>

            <div>
              <div className="font-display text-3xl font-extrabold text-[#687052]">
                Affordable
              </div>

              <p className="mt-2 text-sm text-[#777868]">
                Beautiful work within budget
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
      ===================================================== */}
      <section className="page-container section-padding pb-20">

        <div className="relative overflow-hidden rounded-[40px] bg-[#687052] p-8 text-[#fffdf5] shadow-[12px_12px_20px_rgba(151,146,129,0.55),-12px_-12px_20px_rgba(255,252,242,0.85)] sm:p-12 lg:p-16">

          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#9a9b78]/30 blur-3xl" />

          <div className="relative max-w-3xl">

            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e9e4d5] text-[#687052]">
              <Sparkles size={24} />
            </div>

            <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              Ready to give your walls a new story?
            </h2>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-[#e9e4d5]/80 sm:text-base">
              Explore our services and start creating a space
              that feels more beautiful, comfortable and yours.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/services"
                className="neu-button min-h-12 bg-[#e9e4d5] text-[#414637]"
              >
                Explore Services
                <ArrowRight size={18} />
              </Link>

              <Link
                href="/contact"
                className="flex min-h-12 items-center justify-center rounded-2xl px-5 text-sm font-extrabold text-[#fffdf5] transition hover:bg-[#fffdf5]/10"
              >
                Talk to Wallora
              </Link>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}

function ServicePoint({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm font-bold text-[#414637]">
      <CheckCircle2
        size={18}
        className="shrink-0 text-[#687052]"
      />
      {text}
    </div>
  );
}