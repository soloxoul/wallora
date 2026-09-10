"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ImagePlus,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  serviceCategories,
  type ServiceItem,
} from "@/lib/services";
import { supabase } from "@/lib/supabase";

type Props = {
  serviceId?: string;
};

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&w=1200&q=80";

function createId(title: string) {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") +
    "-" +
    Date.now().toString().slice(-5)
  );
}

/**
 * Compress image in browser.
 *
 * Important:
 * We return a Blob instead of base64.
 * The Blob is uploaded to Supabase Storage.
 */
async function compressImage(
  file: File
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();

      img.onload = () => {
        const maxWidth = 1200;

        const scale = Math.min(
          1,
          maxWidth / img.width
        );

        const canvas = document.createElement(
          "canvas"
        );

        canvas.width = Math.round(
          img.width * scale
        );

        canvas.height = Math.round(
          img.height * scale
        );

        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(
            new Error("Canvas unavailable")
          );
          return;
        }

        ctx.drawImage(
          img,
          0,
          0,
          canvas.width,
          canvas.height
        );

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(
                new Error(
                  "Could not compress image"
                )
              );
              return;
            }

            resolve(blob);
          },
          "image/webp",
          0.78
        );
      };

      img.onerror = () =>
        reject(
          new Error("Invalid image")
        );

      img.src = reader.result as string;
    };

    reader.onerror = () =>
      reject(
        new Error(
          "Could not read image"
        )
      );

    reader.readAsDataURL(file);
  });
}

/**
 * Extract Storage object path from a public Supabase URL.
 *
 * Example:
 * https://project.supabase.co/storage/v1/object/public/service-images/foo.webp
 *
 * returns:
 * foo.webp
 */
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

/**
 * Delete an image from Supabase Storage.
 *
 * If the image is an old Unsplash URL or another
 * external URL, nothing happens.
 */
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

export default function AdminServiceForm({
  serviceId,
}: Props) {
  const router = useRouter();

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [price, setPrice] =
    useState("");

  const [unit, setUnit] =
    useState("room");

  const [categorySlug, setCategorySlug] =
    useState("wall-designs");

  const [image, setImage] =
    useState("");

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [popular, setPopular] =
    useState(false);

  const [rank, setRank] =
    useState("1");

  const [loading, setLoading] =
    useState(Boolean(serviceId));

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    if (!serviceId) return;

    async function loadService() {
      try {
        const { data, error } =
          await supabase
            .from("wallora_services")
            .select("*")
            .eq("id", serviceId)
            .maybeSingle();

        if (error) {
          console.error(
            "Failed to load service:",
            error
          );

          setMessage(
            `Could not load service: ${error.message}`
          );

          return;
        }

        if (!data) {
          setMessage(
            "Service not found."
          );
          return;
        }

        setTitle(
          data.title ?? ""
        );

        setDescription(
          data.description ?? ""
        );

        setPrice(
          data.price != null
            ? String(data.price)
            : ""
        );

        setUnit(
          data.unit ?? "room"
        );

        /**
         * Current database schema:
         * category
         *
         * We map it to categorySlug
         * inside React.
         */
        setCategorySlug(
          data.category ??
            "wall-designs"
        );

        setImage(
          data.image ?? ""
        );

        setPopular(
          Boolean(data.popular)
        );

        /**
         * Current database schema:
         * popular_rank
         */
        setRank(
          data.popular_rank != null
            ? String(
                data.popular_rank
              )
            : "1"
        );
      } catch (err) {
        console.error(
          "Failed to load service:",
          err
        );

        setMessage(
          "Something went wrong while loading the service."
        );
      } finally {
        setLoading(false);
      }
    }

    loadService();
  }, [serviceId]);

  const handleImage = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    /**
     * Basic file size protection.
     *
     * We compress before uploading.
     */
    if (file.size > 10 * 1024 * 1024) {
      setMessage(
        "Please choose an image smaller than 10 MB."
      );

      event.target.value = "";
      return;
    }

    try {
      setMessage("");

      /**
       * Store the original File temporarily.
       * Actual upload happens only when Save Service
       * is clicked.
       */
      setSelectedFile(file);

      /**
       * Create local preview.
       */
      const previewUrl =
        URL.createObjectURL(file);

      setImage(previewUrl);
    } catch (err) {
      console.error(
        "Image selection error:",
        err
      );

      setMessage(
        "Image could not be selected."
      );
    }
  };

  const uploadServiceImage =
    async (
      file: File,
      serviceIdToSave: string
    ): Promise<string> => {
      const compressed =
        await compressImage(file);

      const fileName =
        `${serviceIdToSave}-${Date.now()}.webp`;

      const filePath =
        `${serviceIdToSave}/${fileName}`;

      const { error } =
        await supabase.storage
          .from("service-images")
          .upload(
            filePath,
            compressed,
            {
              contentType:
                "image/webp",
              cacheControl:
                "31536000",
              upsert: false,
            }
          );

      if (error) {
        throw new Error(
          `Image upload failed: ${error.message}`
        );
      }

      const {
        data: publicUrlData,
      } =
        supabase.storage
          .from("service-images")
          .getPublicUrl(
            filePath
          );

      if (
        !publicUrlData.publicUrl
      ) {
        throw new Error(
          "Could not generate image URL."
        );
      }

      return publicUrlData.publicUrl;
    };

  const handleSave = async () => {
    if (
      !title.trim() ||
      !description.trim() ||
      !price ||
      !categorySlug
    ) {
      setMessage(
        "Please complete all required fields."
      );
      return;
    }

    if (
      Number(price) < 0
    ) {
      setMessage(
        "Price cannot be negative."
      );
      return;
    }

    setSaving(true);
    setMessage("");

    const serviceIdToSave =
      serviceId ??
      createId(title);

    let oldImage = "";

    try {
      /**
       * If editing, first get current image URL.
       * We need it so that we can delete the old
       * Storage image after successful replacement.
       */
      if (serviceId) {
        const { data, error } =
          await supabase
            .from("wallora_services")
            .select("image")
            .eq("id", serviceId)
            .maybeSingle();

        if (error) {
          throw new Error(
            `Could not read current service image: ${error.message}`
          );
        }

        oldImage =
          data?.image ?? "";
      }

      let imageUrl =
        image || DEFAULT_IMAGE;

      /**
       * If a new file was selected,
       * upload it to Storage.
       */
      if (selectedFile) {
        imageUrl =
          await uploadServiceImage(
            selectedFile,
            serviceIdToSave
          );
      }

      const service: ServiceItem =
        {
          id: serviceIdToSave,
          title: title.trim(),
          description:
            description.trim(),
          price: Number(price),
          unit:
            unit.trim() || "room",
          categorySlug,
          image: imageUrl,
          popular,
          rank:
            Number(rank) || 999,
        };

      /**
       * Current database schema:
       *
       * category
       * popular
       * popular_rank
       */
      if (serviceId) {
        const { error } =
          await supabase
            .from(
              "wallora_services"
            )
            .update({
              title:
                service.title,

              description:
                service.description,

              price:
                service.price,

              unit:
                service.unit,

              category:
                service.categorySlug,

              image:
                service.image,

              popular:
                service.popular,

              popular_rank:
                service.rank,

              updated_at:
                new Date().toISOString(),
            })
            .eq(
              "id",
              serviceId
            );

        if (error) {
          throw new Error(
            `Service save failed: ${error.message}`
          );
        }
      } else {
        const { error } =
          await supabase
            .from(
              "wallora_services"
            )
            .insert({
              id:
                service.id,

              title:
                service.title,

              description:
                service.description,

              price:
                service.price,

              unit:
                service.unit,

              category:
                service.categorySlug,

              image:
                service.image,

              popular:
                service.popular,

              popular_rank:
                service.rank,

              sort_order: 0,

              active: true,

              updated_at:
                new Date().toISOString(),
            });

        if (error) {
          /**
           * If database insert fails after
           * uploading the image, clean up the
           * newly uploaded Storage image.
           */
          if (
            selectedFile &&
            imageUrl !== DEFAULT_IMAGE
          ) {
            await deleteStorageImage(
              imageUrl
            );
          }

          throw new Error(
            `Service save failed: ${error.message}`
          );
        }
      }

      /**
       * Delete old Storage image only AFTER
       * database successfully points to the new one.
       */
      if (
        serviceId &&
        selectedFile &&
        oldImage &&
        oldImage !== imageUrl
      ) {
        await deleteStorageImage(
          oldImage
        );
      }

      window.dispatchEvent(
        new Event(
          "wallora-services-updated"
        )
      );

      setMessage(
        "Service saved successfully."
      );

      setSelectedFile(null);

      setTimeout(() => {
        router.push(
          "/admin/services"
        );
        router.refresh();
      }, 500);
    } catch (err) {
      console.error(
        "Service save error:",
        err
      );

      setMessage(
        err instanceof Error
          ? err.message
          : "Something went wrong while saving."
      );

      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!serviceId) return;

    const confirmed =
      window.confirm(
        "Delete this service? The service image will also be removed from Storage."
      );

    if (!confirmed) return;

    try {
      setSaving(true);
      setMessage("");

      /**
       * Get current image before deleting row.
       */
      const { data, error:
        imageReadError } =
        await supabase
          .from(
            "wallora_services"
          )
          .select("image")
          .eq(
            "id",
            serviceId
          )
          .maybeSingle();

      if (imageReadError) {
        throw new Error(
          `Could not read service image: ${imageReadError.message}`
        );
      }

      const oldImage =
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
            serviceId
          );

      if (error) {
        throw new Error(
          `Delete failed: ${error.message}`
        );
      }

      /**
       * Delete Storage image after
       * database row is successfully removed.
       */
      if (oldImage) {
        await deleteStorageImage(
          oldImage
        );
      }

      window.dispatchEvent(
        new Event(
          "wallora-services-updated"
        )
      );

      router.push(
        "/admin/services"
      );

      router.refresh();
    } catch (err) {
      console.error(
        "Delete error:",
        err
      );

      setMessage(
        err instanceof Error
          ? err.message
          : "Something went wrong while deleting."
      );

      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="section-padding page-container">
        <div className="mx-auto max-w-4xl">
          <div className="neu-surface p-10 text-center">
            <p className="font-semibold text-[var(--muted)]">
              Loading service...
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding page-container">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/admin/services"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--muted)]"
        >
          <ArrowLeft size={16} />
          Back to Services
        </Link>

        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--primary)]">
            Admin Portal
          </p>

          <h1 className="heading-xl mt-2">
            {serviceId
              ? "Edit Service"
              : "Add New Service"}
          </h1>

          <p className="mt-3 text-[var(--muted)]">
            Manage the service information customers
            will see on Wallora.
          </p>
        </div>

        <div className="neu-surface p-6 sm:p-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-bold">
                Service Title *
              </label>

              <input
                value={title}
                onChange={(e) =>
                  setTitle(
                    e.target.value
                  )
                }
                placeholder="e.g. Premium Bedroom Painting"
                className="neu-input"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-bold">
                Description *
              </label>

              <textarea
                value={
                  description
                }
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
                placeholder="Describe this service..."
                className="neu-textarea min-h-[140px]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold">
                Price (৳) *
              </label>

              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) =>
                  setPrice(
                    e.target.value
                  )
                }
                placeholder="8500"
                className="neu-input"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold">
                Unit
              </label>

              <input
                value={unit}
                onChange={(e) =>
                  setUnit(
                    e.target.value
                  )
                }
                placeholder="room"
                className="neu-input"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold">
                Service Category *
              </label>

              <select
                value={
                  categorySlug
                }
                onChange={(e) =>
                  setCategorySlug(
                    e.target.value
                  )
                }
                className="neu-select"
              >
                {serviceCategories.map(
                  (category) => (
                    <option
                      key={
                        category.slug
                      }
                      value={
                        category.slug
                      }
                    >
                      {
                        category.title
                      }
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold">
                Popular Ranking
              </label>

              <input
                type="number"
                min="1"
                value={rank}
                onChange={(e) =>
                  setRank(
                    e.target.value
                  )
                }
                placeholder="1"
                className="neu-input"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-3 block text-sm font-bold">
                Service Image
              </label>

              <label className="neu-surface-small flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-[24px] p-6 text-center transition-transform hover:-translate-y-1">
                {image ? (
                  <div className="w-full">
                    <img
                      src={image}
                      alt="Service preview"
                      className="h-52 w-full rounded-[20px] object-cover"
                    />

                    {selectedFile && (
                      <div className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)]">
                        <Upload
                          size={16}
                        />
                        New image selected
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <ImagePlus
                      size={38}
                      className="text-[var(--primary)]"
                    />

                    <p className="mt-3 font-bold">
                      Upload Service Image
                    </p>

                    <p className="mt-1 text-sm text-[var(--muted)]">
                      JPG, PNG or WebP
                    </p>

                    <p className="mt-1 text-xs text-[var(--muted)]">
                      Image will be compressed and stored in Supabase Storage
                    </p>
                  </>
                )}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/*"
                  onChange={
                    handleImage
                  }
                  className="hidden"
                />
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="mb-3 flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={popular}
                  onChange={(e) =>
                    setPopular(
                      e.target.checked
                    )
                  }
                  className="h-5 w-5 accent-[var(--primary)]"
                />

                <span className="font-bold">
                  Mark as Popular Service
                </span>
              </label>

              <p className="text-sm text-[var(--muted)]">
                Popular services can be highlighted
                on the customer-facing website.
              </p>
            </div>
          </div>

          {message && (
            <div className="neu-inset mt-6 rounded-[16px] p-4 text-sm font-semibold text-[var(--primary)]">
              <Check
                size={17}
                className="mr-2 inline"
              />
              {message}
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={
                handleSave
              }
              disabled={saving}
              className="neu-button neu-button-primary flex-1"
            >
              <Save size={18} />

              {saving
                ? "Saving..."
                : "Save Service"}
            </button>

            {serviceId && (
              <button
                type="button"
                onClick={
                  handleDelete
                }
                disabled={saving}
                className="neu-button neu-button-danger"
              >
                <Trash2
                  size={18}
                />
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}