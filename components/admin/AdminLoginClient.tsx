"use client";

import { FormEvent, useState } from "react";
import { LockKeyhole, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ADMIN_AUTH_KEY } from "@/lib/admin";

export default function AdminLoginClient() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const { data, error: verifyError } = await supabase.rpc(
        "verify_wallora_admin_password",
        {
          input_password: password,
        }
      );

      if (verifyError) {
        console.error("Admin login error:", verifyError);
        setError("Unable to verify password. Please try again.");
        return;
      }

      if (!data) {
        setError("Incorrect admin password.");
        return;
      }

      localStorage.setItem(ADMIN_AUTH_KEY, "true");

      router.push("/admin");
    } catch (err) {
      console.error("Admin login error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
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
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
              className="neu-input w-full"
              disabled={loading}
            />

            {error && (
              <p className="mt-3 text-sm font-semibold text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="neu-button neu-button-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing In..." : "Sign In"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}