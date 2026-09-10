"use client";

import { useEffect, useState } from "react";
import { defaultSettings, getSettings, type WalloraSettings } from "@/lib/admin";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] =
    useState<WalloraSettings>(defaultSettings);

  useEffect(() => {
    setMounted(true);

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

  function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setSent(true);

    setTimeout(() => {
      setSent(false);
    }, 3000);
  }

  return (
    <section className="page-container section-padding">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#687052]">
            Contact Wallora
          </p>

          <h1 className="heading-xl mt-3">
            Let&apos;s color your world.
          </h1>

          <p className="mt-4 max-w-2xl text-[#777868]">
            Have a question about painting, wall designs, or your
            next home project? Send us a message and our team will
            get back to you.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">

          {/* Contact Information */}
          <div className="neu-surface rounded-[32px] p-8">
            <h2 className="heading-md">
              Get in touch
            </h2>

            <div className="mt-6 space-y-6 text-[#777868]">

              {/* Phone */}
              <div>
                <strong className="text-[#414637]">
                  Phone
                </strong>

                <p className="mt-1 break-words">
                  {mounted
                    ? settings.phone
                    : defaultSettings.phone}
                </p>
              </div>

              {/* Email */}
              <div>
                <strong className="text-[#414637]">
                  Email
                </strong>

                <p className="mt-1 break-words">
                  {mounted
                    ? settings.email
                    : defaultSettings.email}
                </p>
              </div>

              {/* Service */}
              <div>
                <strong className="text-[#414637]">
                  Service
                </strong>

                <p className="mt-1">
                  Home painting &amp; wall decoration
                </p>
              </div>

            </div>
          </div>

          {/* Contact Form */}
          <form
            onSubmit={handleSubmit}
            className="neu-surface space-y-5 rounded-[32px] p-8"
          >
            <input
              required
              name="name"
              placeholder="Your name"
              className="neu-input w-full"
            />

            <input
              required
              type="email"
              name="email"
              placeholder="Your email"
              className="neu-input w-full"
            />

            <textarea
              required
              name="message"
              placeholder="Your message"
              rows={6}
              className="neu-textarea w-full"
            />

            <button
              type="submit"
              className="neu-button neu-button-primary w-full"
            >
              {sent ? "Message Sent ✓" : "Send Message"}
            </button>
          </form>

        </div>
      </div>
    </section>
  );
}