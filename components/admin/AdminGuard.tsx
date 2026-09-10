"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  isAdminAuthenticated,
} from "@/lib/admin";

export default function AdminGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (pathname === "/admin/login") {
      setChecking(false);
      return;
    }

    const authenticated = isAdminAuthenticated();

    if (!authenticated) {
      router.replace(
        `/admin/login?redirect=${encodeURIComponent(pathname)}`
      );
      return;
    }

    setChecking(false);
  }, [pathname, router]);

  if (checking) {
    return (
      <div className="page-container flex min-h-[60vh] items-center justify-center">
        <div className="neu-surface rounded-[28px] px-8 py-6 text-center">
          <p className="font-semibold text-[#414637]">
            Checking admin access...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}