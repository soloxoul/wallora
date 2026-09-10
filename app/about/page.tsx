"use client";

import { useEffect, useState } from "react";
import {
  getSettings,
  type WalloraSettings,
} from "@/lib/admin";

export default function AboutPage() {
  const [settings, setSettings] =
    useState<WalloraSettings>(getSettings());

  useEffect(() => {
    const loadSettings = () => {
      setSettings(getSettings());
    };

    loadSettings();

    window.addEventListener(
      "wallora-settings-updated",
      loadSettings
    );

    window.addEventListener("storage", loadSettings);

    return () => {
      window.removeEventListener(
        "wallora-settings-updated",
        loadSettings
      );

      window.removeEventListener("storage", loadSettings);
    };
  }, []);

  return (
    <section className="page-container section-padding">
      <div className="mx-auto max-w-5xl">

        <div className="neu-surface rounded-[32px] p-8 md:p-12">

          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#687052]">
            About Wallora
          </p>

          <h1 className="heading-xl mt-3">
            We transform ordinary walls into beautiful spaces.
          </h1>

          <p className="mt-6 text-lg leading-8 text-[#777868]">
            {settings.aboutText}
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">

            <div className="neu-surface-small rounded-[24px] p-6">
              <h2 className="heading-md">
                Creative
              </h2>

              <p className="mt-2 text-[#777868]">
                Modern colors, textures and wall designs for every
                room.
              </p>
            </div>

            <div className="neu-surface-small rounded-[24px] p-6">
              <h2 className="heading-md">
                Affordable
              </h2>

              <p className="mt-2 text-[#777868]">
                Beautiful solutions designed around practical
                budgets.
              </p>
            </div>

            <div className="neu-surface-small rounded-[24px] p-6">
              <h2 className="heading-md">
                Personal
              </h2>

              <p className="mt-2 text-[#777868]">
                Services tailored to your home, style and
                schedule.
              </p>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}