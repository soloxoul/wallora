"use client";

import Link from "next/link";
import {
  ClipboardList,
  Settings,
  Sparkles,
  ImageIcon,
  LogOut,
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { logoutAdmin } from "@/lib/admin";

export default function AdminDashboard() {
  const router = useRouter();

  const logout = () => {
    logoutAdmin();
    router.push("/admin/login");
  };

  return (
    <section className="section-padding page-container">
      <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--primary)]">
            Wallora Management
          </p>

          <h1 className="heading-xl mt-2">
            Admin Dashboard
          </h1>

          <p className="mt-3 text-[var(--muted)]">
            Manage services, orders and website settings.
          </p>
        </div>

        <button
          onClick={logout}
          className="neu-button neu-button-secondary"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

      <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-4">
        {/* Services */}

        <Link
          href="/admin/services"
          className="neu-surface group p-7 transition-transform hover:-translate-y-1"
        >
          <div className="neu-icon-button">
            <Sparkles size={21} />
          </div>

          <h2 className="heading-md mt-6">
            Services
          </h2>

          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Add, edit and remove services. Set price,
            images, popular ranking and categories.
          </p>

          <div className="mt-6 flex items-center gap-2 font-bold text-[var(--primary)]">
            Manage Services
            <ArrowRight size={17} />
          </div>
        </Link>

        {/* Orders */}

        <Link
          href="/admin/orders"
          className="neu-surface group p-7 transition-transform hover:-translate-y-1"
        >
          <div className="neu-icon-button">
            <ClipboardList size={21} />
          </div>

          <h2 className="heading-md mt-6">
            Orders
          </h2>

          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            View customer requests, service types,
            payment information and assigned dates.
          </p>

          <div className="mt-6 flex items-center gap-2 font-bold text-[var(--primary)]">
            View Orders
            <ArrowRight size={17} />
          </div>
        </Link>

        {/* Category Images */}

        <Link
          href="/admin/category-images"
          className="neu-surface group p-7 transition-transform hover:-translate-y-1"
        >
          <div className="neu-icon-button">
            <ImageIcon size={21} />
          </div>

          <h2 className="heading-md mt-6">
            Category Images
          </h2>

          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Change the main images for Bedroom, Kids Room,
            Boy, Girl, Living Room and other service categories.
          </p>

          <div className="mt-6 flex items-center gap-2 font-bold text-[var(--primary)]">
            Change Images
            <ArrowRight size={17} />
          </div>
        </Link>

        {/* Settings */}

        <Link
          href="/admin/settings"
          className="neu-surface group p-7 transition-transform hover:-translate-y-1"
        >
          <div className="neu-icon-button">
            <Settings size={21} />
          </div>

          <h2 className="heading-md mt-6">
            Settings
          </h2>

          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Manage contact information, social links and
            About Us content.
          </p>

          <div className="mt-6 flex items-center gap-2 font-bold text-[var(--primary)]">
            Open Settings
            <ArrowRight size={17} />
          </div>
        </Link>
      </div>
    </section>
  );
}