"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";
import {
  serviceCategories,
  type ServiceItem,
} from "@/lib/services";
import { supabase } from "@/lib/supabase";

function getStoragePath(
  imageUrl: string
): string | null {
  const marker =
    "/storage/v1/object/public/service-images/";

  const index =
    imageUrl.indexOf(marker);

  if (index === -1) {
    return null;
  }

  return decodeURIComponent(
    imageUrl.slice(
      index + marker.length
    )
  );
}

async function deleteStorageImage(
  imageUrl: string
) {
  if (!imageUrl) return;

  const path =
    getStoragePath(imageUrl);

  if (!path) return;

  const { error } =
    await supabase.storage
      .from("service-images")
      .remove([path]);

  if (error) {
    console.error(
      "Failed to delete storage image:",
      error
    );
  }
}

export default function AdminServicesClient() {
  const [
    services,
    setServices,
  ] = useState<ServiceItem[]>(
    []
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const loadServices =
    async () => {
      try {
        setLoading(true);

        const { data, error } =
          await supabase
            .from(
              "wallora_services"
            )
            .select("*")
            .order(
              "created_at",
              {
                ascending: false,
              }
            );

        if (error) {
          console.error(
            "Failed to load services:",
            error
          );

          return;
        }

        if (data) {
          const onlineServices:
            ServiceItem[] =
            data.map(
              (service) => ({
                id:
                  service.id,

                title:
                  service.title,

                description:
                  service.description,

                price:
                  Number(
                    service.price
                  ),

                unit:
                  service.unit,

                image:
                  service.image,

                /**
                 * Current DB:
                 * category
                 */
                categorySlug:
                  service.category,

                /**
                 * Current DB:
                 * popular
                 */
                popular:
                  Boolean(
                    service.popular
                  ),

                /**
                 * Current DB:
                 * popular_rank
                 */
                rank:
                  service.popular_rank ??
                  undefined,
              })
            );

          setServices(
            onlineServices
          );
        }
      } catch (err) {
        console.error(
          "Failed to load services:",
          err
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadServices();

    const handleUpdate =
      () => {
        loadServices();
      };

    window.addEventListener(
      "wallora-services-updated",
      handleUpdate
    );

    return () => {
      window.removeEventListener(
        "wallora-services-updated",
        handleUpdate
      );
    };
  }, []);

  const removeService =
    async (
      id: string
    ) => {
      const confirmed =
        window.confirm(
          "Are you sure you want to delete this service?\n\nThe service image will also be removed from Storage."
        );

      if (!confirmed)
        return;

      try {
        /**
         * Get image URL before
         * deleting database row.
         */
        const {
          data,
          error:
            imageReadError,
        } = await supabase
          .from(
            "wallora_services"
          )
          .select("image")
          .eq(
            "id",
            id
          )
          .maybeSingle();

        if (imageReadError) {
          console.error(
            "Failed to read service image:",
            imageReadError
          );

          alert(
            `Could not read service image: ${imageReadError.message}`
          );

          return;
        }

        const imageUrl =
          data?.image ?? "";

        /**
         * Delete database row.
         */
        const { error } =
          await supabase
            .from(
              "wallora_services"
            )
            .delete()
            .eq(
              "id",
              id
            );

        if (error) {
          console.error(
            "Failed to delete service:",
            error
          );

          alert(
            `Delete failed: ${error.message}`
          );

          return;
        }

        /**
         * Delete Storage image.
         *
         * Old external images are ignored.
         */
        if (imageUrl) {
          await deleteStorageImage(
            imageUrl
          );
        }

        setServices(
          (current) =>
            current.filter(
              (service) =>
                service.id !== id
            )
        );

        window.dispatchEvent(
          new Event(
            "wallora-services-updated"
          )
        );
      } catch (err) {
        console.error(
          "Delete error:",
          err
        );

        alert(
          "Something went wrong while deleting."
        );
      }
    };

  const togglePopular =
    async (
      id: string
    ) => {
      const service =
        services.find(
          (item) =>
            item.id === id
        );

      if (!service)
        return;

      const newPopular =
        !service.popular;

      try {
        const { error } =
          await supabase
            .from(
              "wallora_services"
            )
            .update({
              popular:
                newPopular,

              updated_at:
                new Date().toISOString(),
            })
            .eq(
              "id",
              id
            );

        if (error) {
          console.error(
            "Failed to update popular status:",
            error
          );

          alert(
            `Popular update failed: ${error.message}`
          );

          return;
        }

        setServices(
          (current) =>
            current.map(
              (item) =>
                item.id === id
                  ? {
                      ...item,
                      popular:
                        newPopular,
                    }
                  : item
            )
        );

        window.dispatchEvent(
          new Event(
            "wallora-services-updated"
          )
        );
      } catch (err) {
        console.error(
          "Popular toggle error:",
          err
        );

        alert(
          "Something went wrong while updating."
        );
      }
    };

  const getCategoryName =
    (
      slug: string
    ) => {
      return (
        serviceCategories.find(
          (category) =>
            category.slug ===
            slug
        )?.title ??
        slug
      );
    };

  return (
    <section className="section-padding page-container">
      <div className="mb-8">
        <Link
          href="/admin"
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--muted)]"
        >
          <ArrowLeft
            size={16}
          />
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
            <Plus
              size={18}
            />
            Add Service
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="neu-surface p-10 text-center">
          <p className="font-semibold text-[var(--muted)]">
            Loading services...
          </p>
        </div>
      ) : services.length ===
        0 ? (
        <div className="neu-surface p-10 text-center">
          <h2 className="heading-md">
            No services
          </h2>

          <Link
            href="/admin/services/new"
            className="neu-button neu-button-primary mt-6 inline-flex"
          >
            <Plus
              size={18}
            />
            Add First Service
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map(
            (service) => (
              <div
                key={
                  service.id
                }
                className="neu-surface overflow-hidden p-4"
              >
                <div className="relative aspect-[16/10] overflow-hidden rounded-[24px]">
                  <img
                    src={
                      service.image
                    }
                    alt={
                      service.title
                    }
                    className="h-full w-full object-cover"
                  />

                  {service.popular && (
                    <div className="neu-surface-small absolute left-4 top-4 rounded-full px-3 py-2 text-xs font-bold text-[var(--primary)]">
                      Popular #
                      {service.rank ??
                        ""}
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
                    {
                      service.title
                    }
                  </h2>

                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--muted)]">
                    {
                      service.description
                    }
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-xl font-bold text-[var(--primary)]">
                        ৳
                        {service.price.toLocaleString()}
                      </p>

                      <p className="text-xs text-[var(--muted)]">
                        {
                          service.unit
                        }
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        togglePopular(
                          service.id
                        )
                      }
                      className="neu-icon-button"
                      aria-label="Toggle popular"
                    >
                      <Star
                        size={
                          19
                        }
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
                      <Pencil
                        size={
                          17
                        }
                      />
                      Edit
                    </Link>

                    <button
                      type="button"
                      onClick={() =>
                        removeService(
                          service.id
                        )
                      }
                      className="neu-button neu-button-danger"
                    >
                      <Trash2
                        size={
                          17
                        }
                      />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </section>
  );
}