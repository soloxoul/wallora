"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  Search,
  ShoppingBag,
  ChevronDown,
} from "lucide-react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [logo, setLogo] = useState("");

  useEffect(() => {
    const loadLogo = () => {
      try {
        const saved = localStorage.getItem("wallora_settings");

        if (!saved) {
          setLogo("");
          return;
        }

        const settings = JSON.parse(saved);
        setLogo(settings.logo || "");
      } catch {
        setLogo("");
      }
    };

    loadLogo();

    window.addEventListener(
      "wallora-settings-updated",
      loadLogo
    );

    window.addEventListener("storage", loadLogo);

    return () => {
      window.removeEventListener(
        "wallora-settings-updated",
        loadLogo
      );

      window.removeEventListener("storage", loadLogo);
    };
  }, []);

  return (
    <header className="sticky top-4 z-50 px-3 sm:px-5">
      <nav className="neu-surface mx-auto max-w-6xl px-4 py-3 sm:px-6">
        <div className="flex min-h-[52px] items-center justify-between gap-4">

         {/* ==================== LOGO ==================== */}
<Link
  href="/"
  className="flex min-h-11 items-center gap-3 rounded-xl px-1"
  onClick={(e) => {
    setMobileOpen(false);
    setServicesOpen(false);

    if (window.location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }}
>
  <div className="flex items-center gap-3">
    {logo ? (
      <img
        src={logo}
        alt="Wallora logo"
        className="h-11 w-auto max-w-[150px] object-contain"
      />
    ) : (
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#687052] text-lg font-extrabold text-[#fffdf5] shadow-[3px_3px_7px_rgba(151,146,129,0.4),-3px_-3px_7px_rgba(255,252,242,0.65)]">
        W
      </span>
    )}

    <span className="font-display text-xl font-extrabold tracking-tight text-[#414637]">
      Wallora
    </span>
  </div>
</Link>
          {/* ==================== DESKTOP NAV ==================== */}
          <div className="hidden items-center gap-1 lg:flex">

            <NavLink href="/">
              Home
            </NavLink>

            {/* Services Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setServicesOpen((prev) => !prev)
                }
                className="flex min-h-11 items-center gap-1 rounded-xl px-4 text-sm font-bold text-[#414637] transition hover:bg-[#e1dccd]"
              >
                Services

                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    servicesOpen
                      ? "rotate-180"
                      : ""
                  }`}
                />
              </button>

              {servicesOpen && (
                <div className="absolute left-0 top-[calc(100%+12px)] w-72 rounded-2xl bg-[#e9e4d5] p-3 shadow-[9px_9px_16px_rgba(151,146,129,0.45),-9px_-9px_16px_rgba(255,252,242,0.75)]">

                  <Link
                    href="/services"
                    onClick={() =>
                      setServicesOpen(false)
                    }
                    className="block rounded-xl px-4 py-3 text-sm font-bold text-[#414637] transition hover:bg-[#dfdacb]"
                  >
                    All Services
                  </Link>

                  <Link
                    href="/services/wall-designs"
                    onClick={() =>
                      setServicesOpen(false)
                    }
                    className="block rounded-xl px-4 py-3 text-sm font-semibold text-[#777868] transition hover:bg-[#dfdacb] hover:text-[#414637]"
                  >
                    Wall Designs
                  </Link>

                  <Link
                    href="/services/home-painting-decoration"
                    onClick={() =>
                      setServicesOpen(false)
                    }
                    className="block rounded-xl px-4 py-3 text-sm font-semibold text-[#777868] transition hover:bg-[#dfdacb] hover:text-[#414637]"
                  >
                    Home Painting & Decoration
                  </Link>
                </div>
              )}
            </div>

            <NavLink href="/contact">
              Contact
            </NavLink>

            <NavLink href="/about">
              About Us
            </NavLink>

            {/* Search */}
            <Link
              href="/search"
              className="neu-icon-button ml-2"
              aria-label="Search"
            >
              <Search size={19} />
            </Link>

            {/* Order */}
            <Link
              href="/order"
              className="neu-button neu-button-primary ml-2"
            >
              <ShoppingBag size={18} />
              Order
            </Link>
          </div>

          {/* ==================== MOBILE CONTROLS ==================== */}
          <div className="flex items-center gap-2 lg:hidden">

            <Link
              href="/search"
              className="neu-icon-button"
              aria-label="Search"
            >
              <Search size={18} />
            </Link>

            <button
              type="button"
              className="neu-icon-button"
              aria-label={
                mobileOpen
                  ? "Close menu"
                  : "Open menu"
              }
              onClick={() =>
                setMobileOpen((prev) => !prev)
              }
            >
              {mobileOpen ? (
                <X size={20} />
              ) : (
                <Menu size={20} />
              )}
            </button>
          </div>
        </div>

        {/* ==================== MOBILE MENU ==================== */}
        {mobileOpen && (
          <div className="mt-4 border-t border-[#414637]/10 pt-4 lg:hidden">
            <div className="flex flex-col gap-2">

              <MobileLink
                href="/"
                onClick={() =>
                  setMobileOpen(false)
                }
              >
                Home
              </MobileLink>

              {/* Mobile Services */}
              <button
                type="button"
                onClick={() =>
                  setServicesOpen((prev) => !prev)
                }
                className="flex min-h-12 items-center justify-between rounded-xl px-4 text-left text-sm font-bold text-[#414637] transition hover:bg-[#dfdacb]"
              >
                <span>
                  Services
                </span>

                <ChevronDown
                  size={17}
                  className={`transition-transform ${
                    servicesOpen
                      ? "rotate-180"
                      : ""
                  }`}
                />
              </button>

              {servicesOpen && (
                <div className="ml-3 flex flex-col gap-1 rounded-2xl bg-[#e9e4d5] p-2 shadow-[inset_4px_4px_8px_rgba(151,146,129,0.3),inset_-4px_-4px_8px_rgba(255,252,242,0.7)]">

                  <MobileLink
                    href="/services"
                    onClick={() =>
                      setMobileOpen(false)
                    }
                  >
                    All Services
                  </MobileLink>

                  <MobileLink
                    href="/services/wall-designs"
                    onClick={() =>
                      setMobileOpen(false)
                    }
                  >
                    Wall Designs
                  </MobileLink>

                  <MobileLink
                    href="/services/home-painting-decoration"
                    onClick={() =>
                      setMobileOpen(false)
                    }
                  >
                    Home Painting & Decoration
                  </MobileLink>
                </div>
              )}

              <MobileLink
                href="/contact"
                onClick={() =>
                  setMobileOpen(false)
                }
              >
                Contact
              </MobileLink>

              <MobileLink
                href="/about"
                onClick={() =>
                  setMobileOpen(false)
                }
              >
                About Us
              </MobileLink>

              {/* Mobile Order */}
              <Link
                href="/order"
                onClick={() =>
                  setMobileOpen(false)
                }
                className="neu-button neu-button-primary mt-2 w-full"
              >
                <ShoppingBag size={18} />
                Order Service
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

/* ==================== DESKTOP NAV LINK ==================== */

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex min-h-11 items-center rounded-xl px-4 text-sm font-bold capitalize text-[#414637] transition hover:bg-[#dfdacb]"
    >
      {children}
    </Link>
  );
}

/* ==================== MOBILE NAV LINK ==================== */

function MobileLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex min-h-12 items-center rounded-xl px-4 text-sm font-bold text-[#414637] transition hover:bg-[#dfdacb]"
    >
      {children}
    </Link>
  );
}