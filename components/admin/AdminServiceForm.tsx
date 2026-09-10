"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ImagePlus,
  Save,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import {
  serviceCategories,
  defaultServices,
  type ServiceItem,
} from "@/lib/services";
import {
  getStoredServices,
  saveStoredServices,
} from "@/lib/service-storage";

type Props = {
  serviceId?: string;
};

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

async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();

      img.onload = () => {
        const maxWidth = 1000;
        const scale = Math.min(
          1,
          maxWidth / img.width
        );

        const canvas = document.createElement("canvas");

        canvas.width = Math.round(
          img.width * scale
        );

        canvas.height = Math.round(
          img.height * scale
        );

        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Canvas unavailable"));
          return;
        }

        ctx.drawImage(
          img,
          0,
          0,
          canvas.width,
          canvas.height
        );

        resolve(
          canvas.toDataURL("image/jpeg", 0.75)
        );
      };

      img.onerror = () =>
        reject(new Error("Invalid image"));

      img.src = reader.result as string;
    };

    reader.onerror = () =>
      reject(new Error("Could not read image"));

    reader.readAsDataURL(file);
  });
}

export default function AdminServiceForm({
  serviceId,
}: Props) {
  const router = useRouter();

  const editingService = serviceId
    ? getStoredServices().find(
        (service) => service.id === serviceId
      ) ??
      defaultServices.find(
        (service) => service.id === serviceId
      )
    : null;

  const [title, setTitle] = useState(
    editingService?.title ?? ""
  );

  const [description, setDescription] = useState(
    editingService?.description ?? ""
  );

  const [price, setPrice] = useState(
    editingService?.price?.toString() ?? ""
  );

  const [unit, setUnit] = useState(
    editingService?.unit ?? "room"
  );

  const [categorySlug, setCategorySlug] = useState(
    editingService?.categorySlug ?? "wall-designs"
  );

  const [image, setImage] = useState(
    editingService?.image ?? ""
  );

  const [popular, setPopular] = useState(
    editingService?.popular ?? false
  );

  const [rank, setRank] = useState(
    editingService?.rank?.toString() ?? "1"
  );

  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");

  const handleImage = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      const compressed = await compressImage(file);

      setImage(compressed);
    } catch {
      setMessage("Image could not be uploaded.");
    }
  };

  const handleSave = () => {
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

    setSaving(true);

    const currentServices = getStoredServices();

    const service: ServiceItem = {
      id: serviceId ?? createId(title),
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      unit: unit.trim() || "room",
      categorySlug,
      image:
        image ||
        "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&w=1200&q=80",
      popular,
      rank: Number(rank) || 999,
    };

    const updatedServices = serviceId
      ? currentServices.map((item) =>
          item.id === serviceId
            ? service
            : item
        )
      : [...currentServices, service];

    saveStoredServices(updatedServices);

    setMessage("Service saved successfully.");

    setTimeout(() => {
      router.push("/admin/services");
      router.refresh();
    }, 500);
  };

  const handleDelete = () => {
    if (!serviceId) return;

    const confirmed = window.confirm(
      "Delete this service?"
    );

    if (!confirmed) return;

    const currentServices = getStoredServices();

    saveStoredServices(
      currentServices.filter(
        (item) => item.id !== serviceId
      )
    );

    router.push("/admin/services");
  };

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
                  setTitle(e.target.value)
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
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
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
                  setPrice(e.target.value)
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
                  setUnit(e.target.value)
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
                value={categorySlug}
                onChange={(e) =>
                  setCategorySlug(e.target.value)
                }
                className="neu-select"
              >
                {serviceCategories.map(
                  (category) => (
                    <option
                      key={category.slug}
                      value={category.slug}
                    >
                      {category.title}
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
                  setRank(e.target.value)
                }
                placeholder="1"
                className="neu-input"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-3 block text-sm font-bold">
                Service Image
              </label>

              <label className="neu-surface-small flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-[24px] p-6 text-center transition-transform hover:-translate-y-1">
                {image ? (
                  <img
                    src={image}
                    alt="Service preview"
                    className="h-48 w-full rounded-[20px] object-cover"
                  />
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
                  </>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImage}
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
                    setPopular(e.target.checked)
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
              onClick={handleSave}
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
                onClick={handleDelete}
                className="neu-button neu-button-danger"
              >
                <Trash2 size={18} />
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}