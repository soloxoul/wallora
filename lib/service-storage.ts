import {
  defaultServices,
  type ServiceItem,
} from "@/lib/services";

export const SERVICE_STORAGE_KEY = "wallora_services";

export function getStoredServices(): ServiceItem[] {
  if (typeof window === "undefined") {
    return defaultServices;
  }

  try {
    const saved = localStorage.getItem(SERVICE_STORAGE_KEY);

    if (!saved) {
      return defaultServices;
    }

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed)
      ? parsed
      : defaultServices;
  } catch {
    return defaultServices;
  }
}

export function saveStoredServices(
  services: ServiceItem[]
): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    SERVICE_STORAGE_KEY,
    JSON.stringify(services)
  );

  window.dispatchEvent(
    new Event("wallora-services-updated")
  );
}