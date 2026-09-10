"use client";

import { useEffect, useState } from "react";
import {
  defaultSettings,
  getSettings,
  setAdminPassword,
  type WalloraSettings,
  type HeroSlide,
} from "@/lib/admin";
import { supabase } from "@/lib/supabase";

export default function AdminSettingsClient() {
  const [settings, setSettings] =
    useState<WalloraSettings>(defaultSettings);

  const [newPassword, setNewPassword] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load settings from Supabase
  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        setError("");

        const { data: settingsData, error: settingsError } =
          await supabase
            .from("wallora_settings")
            .select("*")
            .limit(1)
            .maybeSingle();

        if (settingsError) {
          console.error(settingsError);
          throw new Error(settingsError.message);
        }

        const { data: heroData, error: heroError } =
          await supabase
            .from("wallora_hero_slides")
            .select("*")
            .order("sort_order", { ascending: true });

        if (heroError) {
          console.error(heroError);
          throw new Error(heroError.message);
        }

        // Start with current local/default settings
        const localSettings = getSettings();

        const onlineSettings: WalloraSettings = {
          ...localSettings,

          ...(settingsData
            ? {
                phone: settingsData.phone ?? localSettings.phone,
                email: settingsData.email ?? localSettings.email,
                facebook:
                  settingsData.facebook ?? localSettings.facebook,
                instagram:
                  settingsData.instagram ?? localSettings.instagram,
                linkedin:
                  settingsData.linkedin ?? localSettings.linkedin,
                aboutText:
                  settingsData.about_text ?? localSettings.aboutText,
                logo: settingsData.logo ?? localSettings.logo,
              }
            : {}),

          heroSlides:
            heroData && heroData.length > 0
              ? heroData.map((slide) => ({
                  id: slide.id,
                  image: slide.image,
                  eyebrow: slide.eyebrow,
                  title: slide.title,
                  description: slide.description,
                  primaryButtonText:
                    slide.primary_button_text,
                  primaryButtonLink:
                    slide.primary_button_link,
                  secondaryButtonText:
                    slide.secondary_button_text,
                  secondaryButtonLink:
                    slide.secondary_button_link,
                }))
              : localSettings.heroSlides,
        };

        setSettings(onlineSettings);
      } catch (err) {
        console.error("Failed to load Wallora settings:", err);

        // If online loading fails, keep local data as fallback
        setSettings(getSettings());

        setError(
          "Could not load online settings. Showing local settings instead."
        );
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  function updateField(
    field: keyof WalloraSettings,
    value: string
  ) {
    setSettings((current) => ({
      ...current,
      [field]: value,
    }));

    setSaved(false);
    setError("");
  }

  function handleLogoUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;

      if (typeof result === "string") {
        updateField("logo", result);
      }
    };

    reader.readAsDataURL(file);
  }

  function updateHeroSlide(
    id: string,
    field: keyof HeroSlide,
    value: string
  ) {
    setSettings((current) => ({
      ...current,
      heroSlides: current.heroSlides.map((slide) =>
        slide.id === id
          ? {
              ...slide,
              [field]: value,
            }
          : slide
      ),
    }));

    setSaved(false);
    setError("");
  }

  function addHeroSlide() {
    const newSlide: HeroSlide = {
      id: `hero-${Date.now()}`,
      image: "",
      eyebrow: "New Wallora Story",
      title: "Your new hero headline",
      description:
        "Add a beautiful description for this hero slide.",
      primaryButtonText: "Explore Services",
      primaryButtonLink: "/services",
      secondaryButtonText: "Start an Order",
      secondaryButtonLink: "/order",
    };

    setSettings((current) => ({
      ...current,
      heroSlides: [...current.heroSlides, newSlide],
    }));

    setSaved(false);
    setError("");
  }

  function deleteHeroSlide(id: string) {
    if (settings.heroSlides.length <= 1) {
      alert("At least one hero slide is required.");
      return;
    }

    setSettings((current) => ({
      ...current,
      heroSlides: current.heroSlides.filter(
        (slide) => slide.id !== id
      ),
    }));

    setSaved(false);
    setError("");
  }

  function handleHeroImageUpload(
    id: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;

      if (typeof result === "string") {
        updateHeroSlide(id, "image", result);
      }
    };

    reader.readAsDataURL(file);
  }

 async function handleSave() {
  try {
    setSaving(true);
    setSaved(false);
    setError("");

    // --------------------------------
    // 1. Save website settings
    // --------------------------------

    const {
      data: existingSettings,
      error: findSettingsError,
    } = await supabase
      .from("wallora_settings")
      .select("id")
      .limit(1)
      .maybeSingle();

    if (findSettingsError) {
      console.error(findSettingsError);
      throw new Error(
        `Could not find settings: ${findSettingsError.message}`
      );
    }

    let settingsError: { message: string } | null = null;

    if (existingSettings?.id) {
      const result = await supabase
        .from("wallora_settings")
        .update({
          phone: settings.phone,
          email: settings.email,
          facebook: settings.facebook,
          instagram: settings.instagram,
          linkedin: settings.linkedin,
          about_text: settings.aboutText,
          logo: settings.logo,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingSettings.id);

      settingsError = result.error;
    } else {
      const result = await supabase
        .from("wallora_settings")
        .insert({
          phone: settings.phone,
          email: settings.email,
          facebook: settings.facebook,
          instagram: settings.instagram,
          linkedin: settings.linkedin,
          about_text: settings.aboutText,
          logo: settings.logo,
          updated_at: new Date().toISOString(),
        });

      settingsError = result.error;
    }

    if (settingsError) {
      console.error(settingsError);
      throw new Error(
        `Settings save failed: ${settingsError.message}`
      );
    }

      // --------------------------------
      // 2. Remove old hero slides
      // --------------------------------

      const { error: deleteHeroError } = await supabase
        .from("wallora_hero_slides")
        .delete()
        .neq("id", "__never_delete__");

      if (deleteHeroError) {
        console.error(deleteHeroError);
        throw new Error(
          `Hero cleanup failed: ${deleteHeroError.message}`
        );
      }

      // --------------------------------
      // 3. Insert current hero slides
      // --------------------------------

      const heroRows = settings.heroSlides.map(
        (slide, index) => ({
          id: slide.id,
          image: slide.image,
          eyebrow: slide.eyebrow,
          title: slide.title,
          description: slide.description,
          primary_button_text:
            slide.primaryButtonText,
          primary_button_link:
            slide.primaryButtonLink,
          secondary_button_text:
            slide.secondaryButtonText,
          secondary_button_link:
            slide.secondaryButtonLink,
          sort_order: index,
          updated_at: new Date().toISOString(),
        })
      );

      const { error: heroInsertError } = await supabase
        .from("wallora_hero_slides")
        .insert(heroRows);

      if (heroInsertError) {
        console.error(heroInsertError);
        throw new Error(
          `Hero save failed: ${heroInsertError.message}`
        );
      }

      // --------------------------------
      // 4. Keep local copy as fallback
      // --------------------------------

      try {
        localStorage.setItem(
          "wallora_settings",
          JSON.stringify(settings)
        );
      } catch (localError) {
        console.warn(
          "Could not save local fallback:",
          localError
        );
      }

      // --------------------------------
      // 5. Password remains local
      // --------------------------------

      if (newPassword.trim()) {
        setAdminPassword(newPassword.trim());
        setNewPassword("");
      }

      // --------------------------------
      // 6. Notify website components
      // --------------------------------

      window.dispatchEvent(
        new Event("wallora-settings-updated")
      );

      setSaved(true);
    } catch (err) {
      console.error("Wallora settings save error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while saving."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="page-container section-padding">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#687052]">
            Admin Portal
          </p>

          <h1 className="heading-xl mt-2">
            Website Settings
          </h1>

          <p className="mt-3 text-[#777868]">
            Manage Wallora&apos;s logo, contact information and
            social links.
          </p>
        </div>

        {loading && (
          <div className="neu-surface mb-6 rounded-[24px] p-5 text-sm text-[#777868]">
            Loading settings from Wallora database...
          </div>
        )}

        {error && (
          <div className="neu-surface mb-6 rounded-[24px] p-5 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="neu-surface space-y-8 rounded-[32px] p-6 md:p-8">

          {/* Logo */}
          <div>
            <h2 className="heading-md">Website Logo</h2>

            <p className="mt-2 text-sm text-[#777868]">
              Upload the logo that should appear in the website
              navigation bar.
            </p>

            <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="neu-inset flex h-28 w-64 items-center justify-center rounded-[24px] p-4">
                {settings.logo ? (
                  <img
                    src={settings.logo}
                    alt="Wallora logo preview"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="text-center text-sm text-[#777868]">
                    No logo uploaded
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="logo-upload"
                  className="neu-button neu-button-primary inline-block cursor-pointer"
                >
                  Upload Logo
                </label>

                <input
                  id="logo-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleLogoUpload}
                  className="hidden"
                />

                {settings.logo && (
                  <button
                    type="button"
                    onClick={() =>
                      updateField("logo", "")
                    }
                    className="neu-button neu-button-secondary ml-2"
                  >
                    Remove
                  </button>
                )}

                <p className="mt-3 text-xs text-[#777868]">
                  PNG, JPG, WEBP or SVG recommended.
                </p>
              </div>
            </div>
          </div>

          <div className="soft-divider" />

          {/* Contact */}
          <div>
            <h2 className="heading-md">
              Contact Information
            </h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <input
                value={settings.phone}
                onChange={(e) =>
                  updateField("phone", e.target.value)
                }
                placeholder="Phone"
                className="neu-input w-full"
              />

              <input
                value={settings.email}
                onChange={(e) =>
                  updateField("email", e.target.value)
                }
                placeholder="Email"
                className="neu-input w-full"
              />
            </div>
          </div>

          <div className="soft-divider" />

          {/* Social */}
          <div>
            <h2 className="heading-md">
              Social Links
            </h2>

            <div className="mt-5 space-y-5">
              <input
                value={settings.facebook}
                onChange={(e) =>
                  updateField("facebook", e.target.value)
                }
                placeholder="Facebook URL"
                className="neu-input w-full"
              />

              <input
                value={settings.instagram}
                onChange={(e) =>
                  updateField("instagram", e.target.value)
                }
                placeholder="Instagram URL"
                className="neu-input w-full"
              />

              <input
                value={settings.linkedin}
                onChange={(e) =>
                  updateField("linkedin", e.target.value)
                }
                placeholder="LinkedIn URL"
                className="neu-input w-full"
              />
            </div>
          </div>

          <div className="soft-divider" />

          {/* About */}
          <div>
            <h2 className="heading-md">
              About Wallora
            </h2>

            <textarea
              value={settings.aboutText}
              onChange={(e) =>
                updateField("aboutText", e.target.value)
              }
              rows={5}
              className="neu-textarea mt-5 w-full"
              placeholder="About Wallora"
            />
          </div>

          <div className="soft-divider" />

          {/* Hero Slides */}
          <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="heading-md">
                  Hero Slides
                </h2>

                <p className="mt-2 text-sm text-[#777868]">
                  Change homepage hero images, text and buttons.
                  Add as many slides as you want.
                </p>
              </div>

              <button
                type="button"
                onClick={addHeroSlide}
                className="neu-button neu-button-primary"
              >
                + Add Slide
              </button>
            </div>

            <div className="mt-6 space-y-8">
              {settings.heroSlides.map(
                (slide, index) => (
                  <div
                    key={slide.id}
                    className="neu-inset rounded-[28px] p-5 md:p-6"
                  >
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#687052]">
                          Hero Slide {index + 1}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          deleteHeroSlide(slide.id)
                        }
                        className="neu-button neu-button-danger"
                      >
                        Delete
                      </button>
                    </div>

                    {/* Image */}
                    <div>
                      <label className="text-sm font-semibold text-[#414637]">
                        Hero Image
                      </label>

                      <div className="mt-3 overflow-hidden rounded-[24px]">
                        {slide.image ? (
                          <img
                            src={slide.image}
                            alt={`Hero slide ${index + 1}`}
                            className="h-56 w-full object-cover"
                          />
                        ) : (
                          <div className="neu-surface-small flex h-56 items-center justify-center text-sm text-[#777868]">
                            No image uploaded
                          </div>
                        )}
                      </div>

                      <label
                        htmlFor={`hero-image-${slide.id}`}
                        className="neu-button neu-button-secondary mt-4 inline-block cursor-pointer"
                      >
                        Upload Image
                      </label>

                      <input
                        id={`hero-image-${slide.id}`}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(e) =>
                          handleHeroImageUpload(
                            slide.id,
                            e
                          )
                        }
                        className="hidden"
                      />
                    </div>

                    {/* Text */}
                    <div className="mt-6 grid gap-5">
                      <input
                        value={slide.eyebrow}
                        onChange={(e) =>
                          updateHeroSlide(
                            slide.id,
                            "eyebrow",
                            e.target.value
                          )
                        }
                        placeholder="Eyebrow"
                        className="neu-input w-full"
                      />

                      <input
                        value={slide.title}
                        onChange={(e) =>
                          updateHeroSlide(
                            slide.id,
                            "title",
                            e.target.value
                          )
                        }
                        placeholder="Hero title"
                        className="neu-input w-full"
                      />

                      <textarea
                        value={slide.description}
                        onChange={(e) =>
                          updateHeroSlide(
                            slide.id,
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Hero description"
                        rows={4}
                        className="neu-textarea w-full"
                      />
                    </div>

                    {/* Buttons */}
                    <div className="mt-6 grid gap-5 md:grid-cols-2">
                      <input
                        value={slide.primaryButtonText}
                        onChange={(e) =>
                          updateHeroSlide(
                            slide.id,
                            "primaryButtonText",
                            e.target.value
                          )
                        }
                        placeholder="Primary button text"
                        className="neu-input w-full"
                      />

                      <input
                        value={slide.primaryButtonLink}
                        onChange={(e) =>
                          updateHeroSlide(
                            slide.id,
                            "primaryButtonLink",
                            e.target.value
                          )
                        }
                        placeholder="Primary button link e.g. /services"
                        className="neu-input w-full"
                      />

                      <input
                        value={slide.secondaryButtonText}
                        onChange={(e) =>
                          updateHeroSlide(
                            slide.id,
                            "secondaryButtonText",
                            e.target.value
                          )
                        }
                        placeholder="Secondary button text"
                        className="neu-input w-full"
                      />

                      <input
                        value={slide.secondaryButtonLink}
                        onChange={(e) =>
                          updateHeroSlide(
                            slide.id,
                            "secondaryButtonLink",
                            e.target.value
                          )
                        }
                        placeholder="Secondary button link e.g. /order"
                        className="neu-input w-full"
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="soft-divider" />

          {/* Password */}
          <div>
            <h2 className="heading-md">
              Admin Password
            </h2>

            <input
              type="password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(e.target.value)
              }
              placeholder="Enter new password"
              className="neu-input mt-5 w-full"
            />

            <p className="mt-2 text-xs text-[#777868]">
              Leave empty if you do not want to change the password.
            </p>
          </div>

          {/* Save */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loading}
              className="neu-button neu-button-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving Online..." : "Save Settings"}
            </button>

            {saved && (
              <span className="text-sm font-semibold text-[#687052]">
                Saved to database ✓
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}