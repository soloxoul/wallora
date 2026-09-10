"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  serviceCategories,
  type ServiceItem,
} from "@/lib/services";
import {
  getStoredServices,
  saveStoredServices,
} from "@/lib/service-storage";

export default function AdminServicesClient() {
  const [services, setServices] = useState<
    ServiceItem[]
  >([]);

  useEffect(() => {
    setServices(getStoredServices());
  }, []);

  const removeService = (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this service?"
    );

    if (!confirmed) return;

    const updated = services.filter(
      (service) => service.id !== id
    );

    setServices(updated);
    saveStoredServices(updated);
  };

  const togglePopular = (id: string) => {
    const updated = services.map((service) =>
      service.id === id
        ? {
            ...service,
            popular: !service.popular,
          }
        : service
    );

    setServices(updated);
    saveStoredServices(updated);
  };

  const getCategoryName = (
    slug: string
  ) => {
    return (
      serviceCategories.find(
        (category) =>
          category.slug === slug
      )?.title ?? slug
    );
  };

  return (
    <section className="section-padding page-container">
      <div className="mb-8">
        <Link
          href="/admin"
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--muted)]"
        >
          <ArrowLeft size={16} />
          Dashboard
        </Link>

        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--primary)]">
              Admin Portal
            </p>

            <h1 className="heading-xl mt-2">
              Manage Services
            </h1>

            <p className="mt-3 text-[var(--muted)]">
              Add, edit, rank and manage Wallora
              services.
            </p>
          </div>

          <Link
            href="/admin/services/new"
            className="neu-button neu-button-primary"
          >
            <Plus size={18} />
            Add Service
          </Link>
        </div>
      </div>

      {services.length === 0 ? (
        <div className="neu-surface p-10 text-center">
          <h2 className="heading-md">
            No services
          </h2>

          <Link
            href="/admin/services/new"
            className="neu-button neu-button-primary mt-6 inline-flex"
          >
            <Plus size={18} />
            Add First Service
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
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
                  <div className="neu-surface-small absolute left-4 top-4 rounded-full px-3 py-2 text-xs font-bold text-[var(--primary)]">
                    Popular #{service.rank ?? ""}
                  </div>
                )}
              </div>

              <div className="p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                  {getCategoryName(
                    service.categorySlug
                  )}
                </p>

                <h2 className="font-display mt-2 text-xl font-bold text-[var(--text)]">
                  {service.title}
                </h2>

                <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--muted)]">
                  {service.description}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-xl font-bold text-[var(--primary)]">
                      ৳
                      {service.price.toLocaleString()}
                    </p>

                    <p className="text-xs text-[var(--muted)]">
                      {service.unit}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      togglePopular(service.id)
                    }
                    className="neu-icon-button"
                    aria-label="Toggle popular"
                  >
                    <Star
                      size={19}
                      fill={
                        service.popular
                          ? "currentColor"
                          : "none"
                      }
                    />
                  </button>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <Link
                    href={`/admin/services/edit/${service.id}`}
                    className="neu-button neu-button-secondary"
                  >
                    <Pencil size={17} />
                    Edit
                  </Link>

                  <button
                    type="button"
                    onClick={() =>
                      removeService(service.id)
                    }
                    className="neu-button neu-button-danger"
                  >
                    <Trash2 size={17} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}