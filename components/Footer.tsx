"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {

  Mail,
  Phone,
} from "lucide-react";

import {
  defaultSettings,
  getSettings,
  type WalloraSettings,
} from "@/lib/admin";

export default function Footer() {
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

  const logo = mounted ? settings.logo : "";
  const phone = mounted ? settings.phone : defaultSettings.phone;
  const email = mounted ? settings.email : defaultSettings.email;
  const aboutText = mounted
    ? settings.aboutText
    : defaultSettings.aboutText;

  return (
    <footer className="mt-20 px-3 pb-5 sm:px-5">
      <div className="page-container">

        <div className="neu-surface rounded-[32px] p-6 md:p-8">

          <div className="grid gap-10 md:grid-cols-3">

            {/* Brand */}
            <div>
              <div className="mb-5 flex items-center gap-3">

                {logo ? (
                  <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl">
                    <img
                      src={logo}
                      alt="Wallora"
                      className="h-full w-full object-contain"
                    />
                  </div>
                ) : (
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#687052] font-display text-xl font-extrabold text-[#fffdf5]">
                    W
                  </span>
                )}

                <span className="font-display text-xl font-extrabold tracking-[-0.03em] text-[#414637]">
                  Wallora
                </span>

              </div>

              <p className="max-w-md text-sm leading-7 text-[#777868]">
                {aboutText}
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-display text-lg font-bold text-[#414637]">
                Quick Links
              </h3>

              <div className="mt-5 flex flex-col gap-3 text-sm text-[#777868]">

                <Link
                  href="/"
                  className="transition hover:text-[#687052]"
                >
                  Home
                </Link>

                <Link
                  href="/services"
                  className="transition hover:text-[#687052]"
                >
                  Services
                </Link>

                <Link
                  href="/about"
                  className="transition hover:text-[#687052]"
                >
                  About Us
                </Link>

                <Link
                  href="/contact"
                  className="transition hover:text-[#687052]"
                >
                  Contact
                </Link>

                <Link
                  href="/order"
                  className="transition hover:text-[#687052]"
                >
                  Order
                </Link>

                {/* Admin only in footer */}
                <Link
                  href="/admin/login"
                  className="mt-2 font-semibold text-[#687052] transition hover:text-[#414637]"
                >
                  Admin Portal
                </Link>

              </div>
            </div>

            {/* Contact + Social */}
            <div>
              <h3 className="font-display text-lg font-bold text-[#414637]">
                Connect
              </h3>

              <div className="mt-5 space-y-4">

                {/* Phone */}
                <a
                  href={`tel:${phone}`}
                  className="flex items-center gap-3 text-sm text-[#777868] transition hover:text-[#687052]"
                >
                  <span className="neu-icon-button h-10 w-10 shrink-0">
                    <Phone size={17} />
                  </span>

                  <span className="break-all">
                    {phone}
                  </span>
                </a>

                {/* Email */}
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-3 text-sm text-[#777868] transition hover:text-[#687052]"
                >
                  <span className="neu-icon-button h-10 w-10 shrink-0">
                    <Mail size={17} />
                  </span>

                  <span className="break-all">
                    {email}
                  </span>
                </a>

                {/* Social */}
              <div className="flex items-center gap-3 pt-2">
  <a
    href={mounted ? settings.facebook : "#"}
    target="_blank"
    rel="noreferrer"
    aria-label="Facebook"
    className="neu-icon-button"
  >
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-current">
      <path d="M14 8h3V4h-3c-3.3 0-5 1.7-5 5v3H6v4h3v4h4v-4h3.2l.8-4H13V9c0-.7.3-1 1-1Z" />
    </svg>
  </a>

  <a
    href={mounted ? settings.instagram : "#"}
    target="_blank"
    rel="noreferrer"
    aria-label="Instagram"
    className="neu-icon-button"
  >
    <svg
      viewBox="0 0 24 24"
      className="h-[19px] w-[19px] fill-none stroke-current"
      strokeWidth="1.8"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="1" className="fill-current stroke-none" />
    </svg>
  </a>

  <a
    href={mounted ? settings.linkedin : "#"}
    target="_blank"
    rel="noreferrer"
    aria-label="LinkedIn"
    className="neu-icon-button"
  >
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-current">
      <path d="M5 8H1V23H5V8ZM3 1C1.9 1 1 1.9 1 3s.9 2 2 2 2-.9 2-2-.9-2-2-2ZM23 14.5C23 10.4 20.8 8 17.5 8c-2 0-3.3 1.1-3.8 2V8H10V23h3.7v-7.4c0-2 .4-4 2.9-4 2.5 0 2.5 2.3 2.5 4.1V23H23v-8.5Z" />
    </svg>
  </a>
</div>

              </div>
            </div>

          </div>

          <div className="soft-divider my-8" />

          <div className="flex flex-col gap-2 text-xs text-[#777868] sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} Wallora. All rights reserved.
            </p>

            <p>
              Paint. Decorate. Transform.
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}