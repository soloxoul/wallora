"use client";

import { useEffect, useState } from "react";
import { ImagePlus, Save, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Category = {
  id: string;
  title: string;
  image: string;
  sort_order: number;
  active: boolean;
};

export default function ServiceCategoryImages() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);

    const { data, error } = await supabase
      .from("wallora_service_categories")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error(error);
      setMessage(`Failed to load categories: ${error.message}`);
      setLoading(false);
      return;
    }

    setCategories(data || []);
    setLoading(false);
  }

  async function handleImageChange(
    categoryId: string,
    file: File
  ) {
    if (!file) return;

    const category = categories.find(
      (item) => item.id === categoryId
    );

    if (!category) return;

    setSavingId(categoryId);
    setMessage("");

    try {
      const extension =
        file.name.split(".").pop()?.toLowerCase() || "webp";

      const filePath = `categories/${categoryId}-${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("service-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const {
        data: publicUrlData,
      } = supabase.storage
        .from("service-images")
        .getPublicUrl(filePath);

      const imageUrl = publicUrlData.publicUrl;

      const { error: updateError } = await supabase
        .from("wallora_service_categories")
        .update({
          image: imageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", categoryId);

      if (updateError) {
        throw new Error(updateError.message);
      }

      setCategories((current) =>
        current.map((item) =>
          item.id === categoryId
            ? { ...item, image: imageUrl }
            : item
        )
      );

      setMessage(
        `${category.title} image updated successfully.`
      );

      window.dispatchEvent(
        new CustomEvent("wallora-category-images-updated")
      );
    } catch (error) {
      console.error(error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Image upload failed."
      );
    } finally {
      setSavingId(null);
    }
  }

  if (loading) {
    return (
      <section className="neu-surface p-6">
        <div className="flex items-center gap-3 text-[#414637]">
          <Loader2
            size={20}
            className="animate-spin"
          />
          <span className="font-semibold">
            Loading service categories...
          </span>
        </div>
      </section>
    );
  }

  return (
    <section className="neu-surface p-5 sm:p-7">
      <div className="mb-6">
        <p className="mb-1 text-sm font-bold uppercase tracking-[0.14em] text-[#9A9B78]">
          Admin Control
        </p>

        <h2 className="font-display text-2xl font-extrabold text-[#414637] sm:text-3xl">
          Service Category Images
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#777868]">
          Change the main image shown on each service category
          card. Images are stored in Supabase Storage.
        </p>
      </div>

      {message && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl bg-[#e9e4d5] px-4 py-3 text-sm font-semibold text-[#414637] shadow-[inset_4px_4px_8px_rgba(151,146,129,0.28),inset_-4px_-4px_8px_rgba(255,252,242,0.7)]">
          <CheckCircle2 size={18} />
          <span>{message}</span>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => (
          <CategoryImageCard
            key={category.id}
            category={category}
            saving={savingId === category.id}
            onImageChange={handleImageChange}
          />
        ))}
      </div>
    </section>
  );
}

function CategoryImageCard({
  category,
  saving,
  onImageChange,
}: {
  category: Category;
  saving: boolean;
  onImageChange: (
    categoryId: string,
    file: File
  ) => Promise<void>;
}) {
  return (
    <div className="neu-surface-soft overflow-hidden rounded-[28px] p-4">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[22px] bg-[#dfdacb]">
        {category.image ? (
          <img
            src={category.image}
            alt={category.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-[#777868]">
            <ImagePlus size={34} />
            <span className="text-sm font-semibold">
              No image
            </span>
          </div>
        )}

        {saving && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#414637]/40 backdrop-blur-[2px]">
            <div className="flex items-center gap-2 rounded-xl bg-[#e9e4d5] px-4 py-3 text-sm font-bold text-[#414637] shadow-[5px_5px_10px_rgba(65,70,55,0.25)]">
              <Loader2
                size={18}
                className="animate-spin"
              />
              Uploading...
            </div>
          </div>
        )}
      </div>

      <div className="mt-4">
        <h3 className="font-display text-lg font-extrabold text-[#414637]">
          {category.title}
        </h3>

        <p className="mt-1 text-xs text-[#777868]">
          ID: {category.id}
        </p>

        <label className="neu-button neu-button-secondary mt-4 flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 text-sm font-bold">
          <ImagePlus size={18} />

          {saving ? "Uploading..." : "Change Image"}

          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={saving}
            onChange={(event) => {
              const file = event.target.files?.[0];

              if (file) {
                onImageChange(category.id, file);
              }

              event.target.value = "";
            }}
          />
        </label>
      </div>
    </div>
  );
}