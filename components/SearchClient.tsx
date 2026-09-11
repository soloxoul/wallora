"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Search,
  Sparkles,
  X,
  SlidersHorizontal,
} from "lucide-react";

import {
  defaultServices,
  serviceCategories,
  type ServiceItem,
} from "@/lib/services";

import { supabase } from "@/lib/supabase";
import { getCategoryPath } from "@/components/ServiceCategoryPage";

export default function SearchClient() {
  const [query, setQuery] = useState("");
  const [services, setServices] =
    useState<ServiceItem[]>(defaultServices);

 useEffect(() => {
  const loadServices = async () => {
    const { data, error } = await supabase
      .from("wallora_services")
      .select(
        "id,title,description,price,unit,image,category,popular,popular_rank,active,sort_order"
      )
      .eq("active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Search services load failed:", error);
      return;
    }

    const freshServices: ServiceItem[] = (data ?? []).map(
      (item) => ({
        id: item.id,
        title: item.title,
        description: item.description ?? "",
        price: Number(item.price ?? 0),
        unit: item.unit ?? "per service",
        image: item.image ?? "",
        categorySlug: item.category ?? "",
        popular: Boolean(item.popular),
        rank:
          item.popular_rank !== null &&
          item.popular_rank !== undefined
            ? Number(item.popular_rank)
            : undefined,
      })
    );

    setServices(freshServices);
  };

  loadServices();

  const handleServicesUpdated = () => {
    loadServices();
  };

  window.addEventListener(
    "wallora-services-updated",
    handleServicesUpdated
  );

  window.addEventListener("focus", handleServicesUpdated);

  return () => {
    window.removeEventListener(
      "wallora-services-updated",
      handleServicesUpdated
    );

    window.removeEventListener("focus", handleServicesUpdated);
  };
}, []);

  const popularServices = useMemo(() => {
    return services
      .filter((service) => service.popular)
      .sort(
        (a, b) =>
          (a.rank ?? 999) - (b.rank ?? 999)
      )
      .slice(0, 6);
  }, [services]);

  const results = useMemo(() => {
    const value = query.trim().toLowerCase();

    if (!value) return [];

    return services.filter((service) => {
      const category = serviceCategories.find(
        (item) => item.slug === service.categorySlug
      );

      const searchableText = [
        service.title,
        service.description,
        service.unit,
        service.categorySlug,
        category?.title ?? "",
        category?.parent ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(value);
    });
  }, [query, services]);

  const quickSearches = [
    "Bedroom",
    "Living Room",
    "Wall Design",
    "Kitchen",
    "Bathroom",
    "Balcony",
    "Dining Room",
    "Study Room",
    "Bachelor Room",
    "Kids Room",
    "Master Bedroom",
    
  ];

  return (
    <section className="page-container section-padding min-h-[75vh]">
      <div className="mx-auto max-w-6xl">

        {/* ================= HERO ================= */}

        <div className="mx-auto max-w-4xl text-center">

          <div className="mb-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#687052] neu-surface-small">
            <Sparkles size={15} />
            Find your perfect service
          </div>

          <h1 className="heading-xl">
            What are you looking for?
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#777868] sm:text-base">
            Search Wallora services by room, design,
            painting style or decoration.
          </p>

          {/* ================= GOOEY SEARCH ================= */}

          <div className="relative mx-auto mt-9 max-w-3xl">

            {/* Ambient glow */}
            <div className="pointer-events-none absolute -inset-3 rounded-[40px] bg-[#9a9b78]/10 blur-2xl" />

            <div className="relative rounded-[34px] p-3 neu-surface">

              <div
                className={`
                  group relative flex min-h-[68px]
                  items-center gap-3 rounded-[25px]
                  px-5 transition-all duration-300
                  neu-inset
                  ${
                    query
                      ? "shadow-[inset_8px_8px_14px_rgba(151,146,129,0.5),inset_-8px_-8px_14px_rgba(255,252,242,0.8)]"
                      : ""
                  }
                `}
              >

                {/* Animated search icon */}
                <div
                  className={`
                    flex h-11 w-11 shrink-0 items-center
                    justify-center rounded-2xl
                    transition-all duration-300
                    ${
                      query
                        ? "bg-[#687052] text-[#fffdf5] shadow-[3px_3px_7px_rgba(151,146,129,0.4),-3px_-3px_7px_rgba(255,252,242,0.7)]"
                        : "text-[#687052]"
                    }
                  `}
                >
                  <Search
                    size={21}
                    className={
                      query
                        ? "scale-105"
                        : "group-hover:scale-110"
                    }
                  />
                </div>

                <input
                  type="search"
                  value={query}
                  onChange={(e) =>
                    setQuery(e.target.value)
                  }
                  placeholder="Search bedroom, wall texture, living room..."
                  className="min-w-0 flex-1 bg-transparent text-sm font-bold text-[#414637] outline-none placeholder:text-[#9a9b78] sm:text-base"
                />

                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="neu-icon-button h-11 w-11 shrink-0"
                    aria-label="Clear search"
                  >
                    <X size={17} />
                  </button>
                )}

              </div>
            </div>
          </div>

          {/* ================= QUICK SEARCH ================= */}

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <span className="flex min-h-10 items-center gap-2 px-2 text-xs font-bold text-[#777868]">
              <SlidersHorizontal size={14} />
              Try:
            </span>

            {quickSearches.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setQuery(item)}
                className="neu-button-secondary min-h-10 rounded-full px-4 text-xs"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* ================= RESULTS ================= */}

        {query.trim() ? (
          <div className="mt-16">

            <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-1 text-xs font-extrabold uppercase tracking-[0.16em] text-[#9a9b78]">
                  Search results
                </p>

                <h2 className="heading-lg">
                  {results.length}{" "}
                  {results.length === 1
                    ? "service"
                    : "services"}{" "}
                  found
                </h2>
              </div>

              <p className="text-sm font-semibold text-[#777868]">
                Showing results for{" "}
                <span className="font-extrabold text-[#414637]">
                  “{query}”
                </span>
              </p>
            </div>

            {results.length === 0 ? (
              <div className="neu-surface rounded-[32px] p-10 text-center sm:p-16">

                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[28px] bg-[#e1dccd] text-[#687052] neu-inset">
                  <Search size={30} />
                </div>

                <h3 className="heading-md mb-3">
                  Nothing matched your search
                </h3>

                <p className="mx-auto max-w-md text-sm leading-6 text-[#777868]">
                  Try a room name, painting type or wall
                  design such as “bedroom”, “texture” or
                  “living room”.
                </p>

                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="neu-button neu-button-primary mt-7"
                >
                  Explore Services
                  <ArrowRight size={17} />
                </button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((service) => (
                  <SearchServiceCard
                    key={service.id}
                    service={service}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* ================= POPULAR ================= */}

            {popularServices.length > 0 && (
              <div className="mt-20">

                <div className="mb-8 flex items-end justify-between gap-4">
                  <div>
                    <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#9a9b78]">
                      Customer favourites
                    </p>

                    <h2 className="heading-lg">
                      Popular Services
                    </h2>
                  </div>

                  <Link
                    href="/services"
                    className="hidden min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-extrabold text-[#687052] transition hover:bg-[#dfdacb] sm:flex"
                  >
                    View all
                    <ArrowRight size={16} />
                  </Link>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {popularServices.map((service) => (
                    <SearchServiceCard
                      key={service.id}
                      service={service}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ================= BROWSE BY SPACE ================= */}

            <div className="mt-20">

              <div className="mb-8">
                <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#9a9b78]">
                  Browse by space
                </p>

                <h2 className="heading-lg">
                  Explore Your Space
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    title: "Bedroom",
                    slug:
                      "/services/interior-painting/bedroom",
                  },
                  {
                    title: "Living Room",
                    slug:
                      "/services/interior-painting/living-room",
                  },
                  {
                    title: "Kitchen",
                    slug:
                      "/services/interior-painting/kitchen",
                  },
                   {
                    title: "Study Room",
                    slug:
                      "/services/interior-painting/study-room",
                  },

                  {
                    title: "Bathroom",
                    slug:
                      "/services/interior-painting/bathroom",
                  },
                   {
                    title: "Balcony",
                    slug:
                      "/services/interior-painting/balcony",
                  },
                   {
                    title: "Dining Room",
                    slug:
                      "/services/interior-painting/dining-room",
                  },
                  {
                    title: "Men's Bedroom",
                    slug:
                      "/services/interior-painting/bedroom/bachelor-room/male",
                  },
                  {
                    title: "Women's Bedroom",
                    slug:
                      "/services/interior-painting/bedroom/bachelor-room/female",
                  },
               {
                    title: "Boy's Bedroom",
                    slug:
                      "/services/interior-painting/bedroom/kids-room/boy",
                  },
                  {
                    title: "Girl's Bedroom",
                    slug:
                      "/services/interior-painting/bedroom/kids-room/girl",
                  },
                  {
                    title: "Master Bedroom",
                    slug:
                      "/services/interior-painting/bedroom/master-bedroom",
                  },

                  {
                    title: "Wall Designs",
                    slug: "/services/wall-designs",
                  },

                ].map((item) => (
                  <Link
                    key={item.title}
                    href={item.slug}
                    className="group neu-surface rounded-[28px] p-6 transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="mb-1 text-xs font-bold text-[#9a9b78]">
                          Explore
                        </p>

                        <h3 className="font-display text-lg font-extrabold text-[#414637]">
                          {item.title}
                        </h3>
                      </div>

                      <div className="flex h-11 w-11 items-center justify-center rounded-xl text-[#687052] transition group-hover:bg-[#687052] group-hover:text-[#fffdf5]">
                        <ArrowRight size={18} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

/* =========================================================
   SERVICE CARD
========================================================= */

function SearchServiceCard({
  service,
}: {
  service: ServiceItem;
}) {
  return (
    <article className="group neu-surface overflow-hidden rounded-[32px] p-4 transition-all duration-300 hover:-translate-y-1">

      {/* Image */}
      <div className="relative overflow-hidden rounded-[24px]">

        <img
          src={service.image}
          alt={service.title}
          className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#414637]/30 via-transparent to-transparent opacity-70" />

        {service.popular && (
          <div className="absolute left-4 top-4 rounded-full bg-[#687052] px-3 py-2 text-[11px] font-extrabold text-[#fffdf5] shadow-[3px_3px_7px_rgba(65,70,55,0.3)]">
            Popular
            {service.rank
              ? ` #${service.rank}`
              : ""}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-2 pb-2 pt-5">

        <h3 className="font-display text-xl font-extrabold tracking-tight text-[#414637]">
          {service.title}
        </h3>

        <p className="mt-2 min-h-[48px] text-sm leading-6 text-[#777868]">
          {service.description}
        </p>

        <div className="soft-divider my-5" />

        <div className="flex items-end justify-between gap-3">

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#9a9b78]">
              Starting from
            </p>

            <p className="mt-1 font-display text-xl font-extrabold text-[#687052]">
              ৳{service.price.toLocaleString()}
            </p>

            <p className="text-xs font-semibold text-[#777868]">
              / {service.unit}
            </p>
          </div>

          <Link
            href={getCategoryPath(service.categorySlug)}
            className="neu-button neu-button-primary min-h-11 shrink-0"
          >
            View
            <ArrowRight size={16} />
          </Link>

        </div>
      </div>
    </article>
  );
}