export type CartItem = {
  serviceId: string;
  title: string;
  price: number;
  unit: string;
  image: string;
  quantity: number;
};

export const CART_STORAGE_KEY = "wallora_cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function saveCart(cart: CartItem[]) {
  if (typeof window === "undefined") return;

  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));

  window.dispatchEvent(new Event("wallora-cart-updated"));
}

export function addToCart(item: CartItem) {
  const cart = getCart();

  const existing = cart.find(
    (cartItem) => cartItem.serviceId === item.serviceId
  );

  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.push(item);
  }

  saveCart(cart);
}

export function updateCartQuantity(
  serviceId: string,
  quantity: number
) {
  const cart = getCart();

  const item = cart.find(
    (cartItem) => cartItem.serviceId === serviceId
  );

  if (!item) return;

  if (quantity <= 0) {
    removeFromCart(serviceId);
    return;
  }

  item.quantity = quantity;

  saveCart(cart);
}

export function removeFromCart(serviceId: string) {
  const cart = getCart().filter(
    (item) => item.serviceId !== serviceId
  );

  saveCart(cart);
}

export function clearCart() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(CART_STORAGE_KEY);

  window.dispatchEvent(new Event("wallora-cart-updated"));
}

export function getCartTotal(cart: CartItem[]) {
  return cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
}