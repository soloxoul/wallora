"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Minus,
  Plus,
  ShieldCheck,
  Trash2,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  clearCart,
  getCart,
  getCartTotal,
  removeFromCart,
  updateCartQuantity,
  type CartItem,
} from "@/lib/cart";

type ServiceMode = "fast" | "flexible";

export default function OrderClient() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mode, setMode] = useState<ServiceMode>("fast");

  const [serviceDate, setServiceDate] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    setCart(getCart());
  }, []);

  const total = useMemo(
    () => getCartTotal(cart),
    [cart]
  );

  const advance = mode === "fast" ? total * 0.5 : 0;
  const dueAfterWork = total - advance;

  const refreshCart = () => {
    setCart(getCart());
  };

  const changeQuantity = (
    serviceId: string,
    quantity: number
  ) => {
    updateCartQuantity(serviceId, quantity);
    refreshCart();
  };

  const removeItem = (serviceId: string) => {
    removeFromCart(serviceId);
    refreshCart();
  };

  if (cart.length === 0) {
    return (
      <section className="section-padding page-container">
        <div className="mx-auto max-w-2xl text-center">
          <div className="neu-surface p-10">
            <h1 className="heading-lg">
              Your service cart is empty
            </h1>

            <p className="mt-4 text-[var(--muted)]">
              Choose a Wallora service first, then request it
              here.
            </p>

            <Link
              href="/services"
              className="neu-button neu-button-primary mt-7 inline-flex"
            >
              Explore Services
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding page-container">
      <div className="mb-10">
        <Link
          href="/services"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--muted)]"
        >
          <ArrowLeft size={16} />
          Continue Shopping
        </Link>

        <h1 className="heading-xl mt-5">
          Request Your Service
        </h1>

        <p className="mt-3 max-w-2xl text-[var(--muted)]">
          Choose how you want Wallora to schedule your service.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.5fr_0.8fr]">
        {/* Left */}
        <div className="space-y-7">
          {/* Cart */}
          <div className="neu-surface p-6 md:p-8">
            <h2 className="heading-md mb-6">
              Selected Services
            </h2>

            <div className="space-y-5">
              {cart.map((item) => (
                <div
                  key={item.serviceId}
                  className="neu-surface-small flex flex-col gap-5 p-4 sm:flex-row sm:items-center"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-24 w-full rounded-[20px] object-cover sm:w-32"
                  />

                  <div className="flex-1">
                    <h3 className="font-display font-bold">
                      {item.title}
                    </h3>

                    <p className="mt-1 text-sm text-[var(--muted)]">
                      ৳{item.price.toLocaleString()}{" "}
                      {item.unit}
                    </p>

                    <p className="mt-2 font-bold text-[var(--primary)]">
                      ৳
                      {(
                        item.price * item.quantity
                      ).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:flex-col">
                    <div className="neu-inset flex items-center gap-2 rounded-full p-1">
                      <button
                        type="button"
                        onClick={() =>
                          changeQuantity(
                            item.serviceId,
                            item.quantity - 1
                          )
                        }
                        className="neu-icon-button h-9 w-9"
                      >
                        <Minus size={15} />
                      </button>

                      <span className="w-6 text-center font-bold">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          changeQuantity(
                            item.serviceId,
                            item.quantity + 1
                          )
                        }
                        className="neu-icon-button h-9 w-9"
                      >
                        <Plus size={15} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        removeItem(item.serviceId)
                      }
                      className="neu-icon-button"
                      aria-label="Remove service"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Service Mode */}
          <div className="neu-surface p-6 md:p-8">
            <h2 className="heading-md">
              Choose Service Type
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {/* Fast */}
              <button
                type="button"
                onClick={() => setMode("fast")}
                className={`text-left rounded-[28px] p-6 transition-all ${
                  mode === "fast"
                    ? "neu-inset"
                    : "neu-surface-small"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="neu-icon-button">
                    <Zap size={20} />
                  </div>

                  <div>
                    <h3 className="font-display text-lg font-bold">
                      Fast Service
                    </h3>

                    <p className="text-sm text-[var(--primary)]">
                      Priority scheduling
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
                  Pay 50% advance and choose your exact
                  service date.
                </p>
              </button>

              {/* Flexible */}
              <button
                type="button"
                onClick={() => setMode("flexible")}
                className={`text-left rounded-[28px] p-6 transition-all ${
                  mode === "flexible"
                    ? "neu-inset"
                    : "neu-surface-small"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="neu-icon-button">
                    <CalendarDays size={20} />
                  </div>

                  <div>
                    <h3 className="font-display text-lg font-bold">
                      Flexible Service
                    </h3>

                    <p className="text-sm text-[var(--primary)]">
                      No advance payment
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
                  Choose a preferred date range. Wallora
                  assigns an available date within that range.
                </p>
              </button>
            </div>

            {/* Date Selection */}
            <div className="mt-7">
              {mode === "fast" ? (
                <div>
                  <label className="mb-2 block text-sm font-bold">
                    Exact Service Date
                  </label>

                  <input
                    type="date"
                    value={serviceDate}
                    onChange={(event) =>
                      setServiceDate(event.target.value)
                    }
                    className="neu-input w-full"
                  />

                  <p className="mt-2 text-xs text-[var(--muted)]">
                    Fast Service requires 50% advance payment.
                  </p>
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-bold">
                      Preferred From
                    </label>

                    <input
                      type="date"
                      value={fromDate}
                      onChange={(event) =>
                        setFromDate(event.target.value)
                      }
                      className="neu-input w-full"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold">
                      Preferred To
                    </label>

                    <input
                      type="date"
                      value={toDate}
                      min={fromDate}
                      onChange={(event) =>
                        setToDate(event.target.value)
                      }
                      className="neu-input w-full"
                    />
                  </div>

                  <p className="text-xs text-[var(--muted)] sm:col-span-2">
                    Wallora will assign the actual service
                    date based on availability within your
                    selected range.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary */}
        <aside>
          <div className="neu-surface sticky top-28 p-7">
            <h2 className="heading-md">
              Order Summary
            </h2>

            <div className="mt-6 space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">
                  Services
                </span>

                <span className="font-bold">
                  {cart.reduce(
                    (sum, item) => sum + item.quantity,
                    0
                  )}
                </span>
              </div>

              <div className="soft-divider" />

              <div className="flex justify-between">
                <span className="text-[var(--muted)]">
                  Total
                </span>

                <span className="font-bold text-lg">
                  ৳{total.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[var(--muted)]">
                  Advance
                </span>

                <span className="font-bold text-[var(--primary)]">
                  ৳{advance.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[var(--muted)]">
                  After completion
                </span>

                <span className="font-bold">
                  ৳{dueAfterWork.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="neu-inset mt-6 rounded-[20px] p-4">
              <div className="flex gap-3">
                <ShieldCheck
                  size={20}
                  className="shrink-0 text-[var(--primary)]"
                />

                <p className="text-xs leading-5 text-[var(--muted)]">
                  {mode === "fast"
                    ? "Fast Service: 50% advance is required. The remaining 50% is paid after work completion."
                    : "Flexible Service: no advance payment. The full amount is paid after work completion."}
                </p>
              </div>
            </div>

            <Link
              href={`/order/customer?mode=${mode}&total=${total}&advance=${advance}&serviceDate=${serviceDate}&fromDate=${fromDate}&toDate=${toDate}`}
              className="neu-button neu-button-primary mt-7 w-full"
            >
              Continue
              <ArrowRight size={18} />
            </Link>

            <button
              type="button"
              onClick={() => {
                clearCart();
                setCart([]);
              }}
              className="mt-4 w-full text-sm font-semibold text-[var(--muted)]"
            >
              Clear Cart
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}