export const ADMIN_AUTH_KEY = "wallora_admin_authenticated";
export const ADMIN_PASSWORD_KEY = "wallora_admin_password";

export const DEFAULT_ADMIN_PASSWORD = "wallora123";

export type HeroSlide = {
  id: string;
  image: string;
  eyebrow: string;
  title: string;
  description: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
};

export type WalloraSettings = {
  phone: string;
  email: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  aboutText: string;
  logo: string;

  paymentQr: string;

  couponEnabled: boolean;
  couponCode: string;
  couponDiscountPercent: number;

  heroSlides: HeroSlide[];
};

export const defaultHeroSlides: HeroSlide[] = [
  {
    id: "hero-1",
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1800&q=85",
    eyebrow: "Modern Home Transformation",
    title: "Turn your walls into something beautiful.",
    description:
      "Premium painting and creative wall decoration services designed to make your home feel more personal, peaceful and uniquely yours.",
    primaryButtonText: "Explore Services",
    primaryButtonLink: "/services",
    secondaryButtonText: "Start an Order",
    secondaryButtonLink: "/order",
  },
  {
    id: "hero-2",
    image:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1800&q=85",
    eyebrow: "Designed Around You",
    title: "A better room starts with better walls.",
    description:
      "From bedrooms to living spaces, Wallora helps you create interiors that match your lifestyle, personality and taste.",
    primaryButtonText: "Explore Services",
    primaryButtonLink: "/services",
    secondaryButtonText: "Start an Order",
    secondaryButtonLink: "/order",
  },
  {
    id: "hero-3",
    image:
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1800&q=85",
    eyebrow: "Paint. Decorate. Transform.",
    title: "Give every room its own character.",
    description:
      "Explore thoughtful colour combinations, wall designs and decoration ideas for every corner of your home.",
    primaryButtonText: "Explore Services",
    primaryButtonLink: "/services",
    secondaryButtonText: "Start an Order",
    secondaryButtonLink: "/order",
  },
];

export const defaultSettings: WalloraSettings = {
  phone: "+880 1XXXXXXXXX",
  email: "hello@wallora.com",

  facebook: "https://facebook.com",
  instagram: "https://instagram.com",
  linkedin: "https://linkedin.com",

  aboutText:
    "Wallora transforms ordinary spaces into beautiful, comfortable and personalized homes through modern painting and wall decoration services.",

  logo: "",

    paymentQr: "",
  couponEnabled: false,
  couponCode: "",
  couponDiscountPercent: 0,

  heroSlides: defaultHeroSlides,
};

export function getAdminPassword(): string {
  if (typeof window === "undefined") {
    return DEFAULT_ADMIN_PASSWORD;
  }

  return (
    localStorage.getItem(ADMIN_PASSWORD_KEY) ??
    DEFAULT_ADMIN_PASSWORD
  );
}

export function setAdminPassword(password: string) {
  localStorage.setItem(ADMIN_PASSWORD_KEY, password);
}

export function isAdminAuthenticated(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return localStorage.getItem(ADMIN_AUTH_KEY) === "true";
}

export function loginAdmin(password: string): boolean {
  if (password !== getAdminPassword()) {
    return false;
  }

  localStorage.setItem(ADMIN_AUTH_KEY, "true");

  return true;
}

export function logoutAdmin() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(ADMIN_AUTH_KEY);
}

export function getSettings(): WalloraSettings {
  if (typeof window === "undefined") {
    return defaultSettings;
  }

  try {
    const saved = localStorage.getItem("wallora_settings");

    if (!saved) {
      return defaultSettings;
    }

    const parsed = JSON.parse(saved);

    return {
      ...defaultSettings,
      ...parsed,
      heroSlides:
        Array.isArray(parsed.heroSlides) && parsed.heroSlides.length > 0
          ? parsed.heroSlides
          : defaultHeroSlides,
    };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: WalloraSettings) {
  localStorage.setItem(
    "wallora_settings",
    JSON.stringify(settings)
  );

  window.dispatchEvent(
    new Event("wallora-settings-updated")
  );
}