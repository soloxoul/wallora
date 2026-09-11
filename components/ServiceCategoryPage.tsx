"use client";

import Link from "next/link";
import { ArrowRight, Minus, Plus, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import {
  serviceCategories,
  type ServiceItem,
} from "@/lib/services";

import { addToCart } from "@/lib/cart";
import { supabase } from "@/lib/supabase";

type Props = {
  slug: string;
};

export function getCategoryPath(slug: string): string {
  const category = serviceCategories.find(
    (item) => item.slug === slug
  );

  if (!category) return "/services";

  if (!category.parent) {
    return `/services/${category.slug}`;
  }

  return `${getCategoryPath(category.parent)}/${category.slug}`;
}

export default function ServiceCategoryPage({
  slug,
}: Props) {
  const category = serviceCategories.find(
    (item) => item.slug === slug
  );

  const [services, setServices] =
    useState<ServiceItem[]>([]);

  const [quantities, setQuantities] =
    useState<Record<string, number>>({});

  const [categoryImages, setCategoryImages] =
    useState<Record<string, string>>({});

  /* ================= SERVICES ================= */

  useEffect(() => {
    const loadServices = async () => {
      try {
        const { data, error } = await supabase
          .from("wallora_services")
          .select(
            "id, title, description, price, unit, image, category, popular, popular_rank, active"
          )
          .eq("active", true);

        if (error) {
          console.error(
            "Failed to load services:",
            error
          );
          return;
        }

        const mappedServices: ServiceItem[] =
          (data ?? []).map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description ?? "",
            price: Number(item.price) || 0,
            unit: item.unit ?? "per service",
            image: item.image ?? "",
            categorySlug: item.category ?? "",
            popular: Boolean(item.popular),
            rank:
              item.popular_rank !== null &&
              item.popular_rank !== undefined
                ? Number(item.popular_rank)
                : undefined,
          }));

        setServices(mappedServices);
      } catch (error) {
        console.error(
          "Failed to load services:",
          error
        );
      }
    };

    loadServices();

    const refreshServices = () => {
      loadServices();
    };

    window.addEventListener(
      "wallora-services-updated",
      refreshServices
    );

    return () => {
      window.removeEventListener(
        "wallora-services-updated",
        refreshServices
      );
    };
  }, []);

  /* ================= CATEGORY IMAGES ================= */

  useEffect(() => {
    const loadCategoryImages = async () => {
      try {
        const { data, error } = await supabase
          .from("wallora_service_categories")
          .select("id, image")
          .eq("active", true);

        if (error) {
          console.error(
            "Failed to load category images:",
            error
          );
          return;
        }

        const imageMap: Record<string, string> = {};

        (data ?? []).forEach((item) => {
          if (item.image) {
            imageMap[item.id] = item.image;
          }
        });

        setCategoryImages(imageMap);
      } catch (error) {
        console.error(
          "Failed to load category images:",
          error
        );
      }
    };

    loadCategoryImages();

    const refreshCategoryImages = () => {
      loadCategoryImages();
    };

    window.addEventListener(
      "wallora-category-images-updated",
      refreshCategoryImages
    );

    return () => {
      window.removeEventListener(
        "wallora-category-images-updated",
        refreshCategoryImages
      );
    };
  }, []);

  /* ================= CATEGORY CHECK ================= */

  if (!category) {
    return (
      <section className="section-padding page-container">
        <div className="neu-surface p-10 text-center">
          <h1 className="heading-lg">
            Service not found
          </h1>

          <Link
            href="/services"
            className="neu-button neu-button-primary mt-6 inline-flex"
          >
            Back to Services
          </Link>
        </div>
      </section>
    );
  }

  /* ================= CHILD CATEGORIES ================= */

  const children = serviceCategories.filter(
    (item) => item.parent === slug
  );

  /* ================= CATEGORY SERVICES ================= */

  const categoryServices = services
    .filter(
      (service) =>
        service.categorySlug === slug
    )
    .sort(
      (a, b) =>
        (a.rank ?? 999) -
        (b.rank ?? 999)
    );

  /* ================= QUANTITY ================= */

  const changeQuantity = (
    serviceId: string,
    change: number
  ) => {
    setQuantities((previous) => ({
      ...previous,
      [serviceId]: Math.max(
        1,
        (previous[serviceId] ?? 1) + change
      ),
    }));
  };

  /* ================= REQUEST SERVICE ================= */

  const requestService = (
    service: ServiceItem
  ) => {
    const quantity =
      quantities[service.id] ?? 1;

    addToCart({
      serviceId: service.id,
      title: service.title,
      price: service.price,
      unit: service.unit,
      image: service.image,
      quantity,
    });

    window.location.href = "/order";
  };

  return (
    <section className="section-padding page-container">
      <div className="mb-12 max-w-3xl">
        <Link
          href="/services"
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--muted)]"
        >
          Services
          <ArrowRight size={16} />
        </Link>

        <div className="mb-4 flex items-center gap-3">
          <div className="neu-icon-button">
            <Sparkles size={20} />
          </div>

          <span className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--primary)]">
            Wallora Services
          </span>
        </div>

        <h1 className="heading-xl">
          {category.title}
        </h1>

        <p className="mt-5 text-lg leading-8 text-[var(--muted)]">
          {category.description}
        </p>
      </div>

      {/* ================= CHILD CATEGORIES ================= */}

      {children.length > 0 && (
        <div className="mb-14">
          <h2 className="heading-lg mb-6">
            Explore {category.title}
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {children.map((child) => (
              <Link
                key={child.slug}
                href={getCategoryPath(child.slug)}
                className="neu-surface group overflow-hidden p-4 transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="aspect-[16/10] overflow-hidden rounded-[24px]">
                  <img
                    src={
                      categoryImages[child.slug] ||
                      child.image
                    }
                    alt={child.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-display text-xl font-bold text-[var(--text)]">
                      {child.title}
                    </h3>

                    <ArrowRight
                      size={20}
                      className="text-[var(--primary)] transition-transform group-hover:translate-x-1"
                    />
                  </div>

                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    {child.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ================= SERVICES ================= */}

      {categoryServices.length > 0 && (
        <div>
          <div className="mb-6">
            <h2 className="heading-lg">
              Available Services
            </h2>

            <p className="mt-2 text-[var(--muted)]">
              Choose a service and request it from
              Wallora.
            </p>
          </div>

          <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {categoryServices.map((service) => {
              const quantity =
                quantities[service.id] ?? 1;

              return (
                <div
                  key={service.id}
                  className="neu-surface overflow-hidden p-4"
                >
                  <div className="relative aspect-[16/10] overflow-hidden rounded-[24px]">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="h-full w-full object-cover"
                    />

                    {service.popular && (
                      <div className="neu-surface-small absolute left-4 top-4 rounded-full px-4 py-2 text-xs font-bold text-[var(--primary)]">
                        Popular
                        {service.rank
                          ? ` #${service.rank}`
                          : ""}
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-display text-xl font-bold text-[var(--text)]">
                      {service.title}
                    </h3>

                    <p className="mt-2 min-h-[72px] text-sm leading-6 text-[var(--muted)]">
                      {service.description}
                    </p>

                    <div className="mt-5 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-2xl font-bold text-[var(--primary)]">
                          ৳
                          {service.price.toLocaleString()}
                        </p>

                        <p className="text-xs text-[var(--muted)]">
                          {service.unit}
                        </p>
                      </div>

                      <div className="neu-inset flex items-center gap-2 rounded-full p-1">
                        <button
                          type="button"
                          onClick={() =>
                            changeQuantity(
                              service.id,
                              -1
                            )
                          }
                          className="neu-icon-button h-10 w-10"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={16} />
                        </button>

                        <span className="w-7 text-center font-bold">
                          {quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            changeQuantity(
                              service.id,
                              1
                            )
                          }
                          className="neu-icon-button h-10 w-10"
                          aria-label="Increase quantity"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        requestService(service)
                      }
                      className="neu-button neu-button-primary mt-6 w-full"
                    >
                      Request Services
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= EMPTY STATE ================= */}

      {categoryServices.length === 0 &&
        children.length === 0 && (
          <div className="neu-surface p-10 text-center">
            <h2 className="heading-md">
              Coming Soon
            </h2>

            <p className="mt-3 text-[var(--muted)]">
              Wallora will add services to this
              category from the Admin Portal.
            </p>
          </div>
        )}
    </section>
  );
}