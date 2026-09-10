"use client";

import { FormEvent, useState } from "react";
import { LockKeyhole, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  loginAdmin,
} from "@/lib/admin";

export default function AdminLoginClient() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (event: FormEvent) => {
    event.preventDefault();

    setError("");

    if (!loginAdmin(password)) {
      setError("Incorrect admin password.");
      return;
    }

    router.push("/admin");
  };

  return (
    <section className="section-padding page-container">
      <div className="mx-auto max-w-md">
        <div className="neu-surface p-8 md:p-10">
          <div className="mx-auto neu-icon-button">
            <LockKeyhole size={22} />
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--primary)]">
              Wallora
            </p>

            <h1 className="heading-lg mt-2">
              Admin Portal
            </h1>

            <p className="mt-3 text-sm text-[var(--muted)]">
              Sign in to manage Wallora.
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="mt-8"
          >
            <label className="mb-2 block text-sm font-bold">
              Admin Password
            </label>

            <input
              required
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter password"
              className="neu-input w-full"
            />

            {error && (
              <p className="mt-3 text-sm font-semibold text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="neu-button neu-button-primary mt-6 w-full"
            >
              Sign In
              <ArrowRight size={18} />
            </button>
          </form>

          
        </div>
      </div>
    </section>
  );
}