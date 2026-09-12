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
import { supabase } from "@/lib/supabase";

type ServiceMode = "fast" | "flexible";

type CouponSettings = {
  couponEnabled: boolean;
  couponCode: string;
  couponDiscountPercent: number;
};

const defaultCouponSettings: CouponSettings = {
  couponEnabled: false,
  couponCode: "",
  couponDiscountPercent: 0,
};

export default function OrderClient() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mode, setMode] =
    useState<ServiceMode>("fast");

  const [serviceDate, setServiceDate] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Coupon
  const [couponSettings, setCouponSettings] =
    useState<CouponSettings>(
      defaultCouponSettings
    );

  const [couponInput, setCouponInput] =
    useState("");

  const [appliedCoupon, setAppliedCoupon] =
    useState(false);

  const [couponMessage, setCouponMessage] =
    useState("");

  useEffect(() => {
    setCart(getCart());
  }, []);

  // Load coupon settings from Supabase
  useEffect(() => {
    async function loadCouponSettings() {
      const { data, error } = await supabase
        .from("wallora_settings")
        .select(
          "coupon_enabled, coupon_code, coupon_discount_percent"
        )
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error(
          "Coupon settings error:",
          error
        );
        return;
      }

      if (data) {
        setCouponSettings({
          couponEnabled:
            data.coupon_enabled ?? false,

          couponCode:
            data.coupon_code ?? "",

          couponDiscountPercent:
            Number(
              data.coupon_discount_percent ?? 0
            ),
        });
      }
    }

    loadCouponSettings();

    const handleSettingsUpdated = () => {
      loadCouponSettings();
    };

    window.addEventListener(
      "wallora-settings-updated",
      handleSettingsUpdated
    );

    window.addEventListener(
      "focus",
      loadCouponSettings
    );

    return () => {
      window.removeEventListener(
        "wallora-settings-updated",
        handleSettingsUpdated
      );

      window.removeEventListener(
        "focus",
        loadCouponSettings
      );
    };
  }, []);

  const total = useMemo(
    () => getCartTotal(cart),
    [cart]
  );

  // Coupon discount
  const discount = appliedCoupon
    ? Math.round(
        (total *
          couponSettings.couponDiscountPercent) /
          100
      )
    : 0;

  // Final amount after coupon
  const finalTotal = Math.max(
    0,
    total - discount
  );

  // Fast Service = 50% advance
  const advance =
    mode === "fast"
      ? Math.round(finalTotal * 0.5)
      : 0;

  const dueAfterWork =
    finalTotal - advance;

  const refreshCart = () => {
    setCart(getCart());
  };

  const changeQuantity = (
    serviceId: string,
    quantity: number
  ) => {
    updateCartQuantity(
      serviceId,
      quantity
    );

    refreshCart();

    // Re-check coupon after cart changes
    if (appliedCoupon) {
      setAppliedCoupon(false);
      setCouponMessage(
        "Cart changed. Please apply the coupon again."
      );
    }
  };

  const removeItem = (
    serviceId: string
  ) => {
    removeFromCart(serviceId);
    refreshCart();

    if (appliedCoupon) {
      setAppliedCoupon(false);
      setCouponMessage(
        "Cart changed. Please apply the coupon again."
      );
    }
  };

  const applyCoupon = () => {
    setCouponMessage("");

    if (!couponSettings.couponEnabled) {
      setAppliedCoupon(false);
      setCouponMessage(
        "Coupon codes are currently unavailable."
      );
      return;
    }

    const enteredCode =
      couponInput.trim().toUpperCase();

    if (!enteredCode) {
      setAppliedCoupon(false);
      setCouponMessage(
        "Please enter a coupon code."
      );
      return;
    }

    const validCode =
      couponSettings.couponCode
        .trim()
        .toUpperCase();

    if (
      !validCode ||
      enteredCode !== validCode
    ) {
      setAppliedCoupon(false);
      setCouponMessage(
        "Invalid coupon code."
      );
      return;
    }

    if (
      couponSettings.couponDiscountPercent <=
      0
    ) {
      setAppliedCoupon(false);
      setCouponMessage(
        "This coupon does not have a valid discount."
      );
      return;
    }

    setAppliedCoupon(true);

    setCouponMessage(
      `${couponSettings.couponDiscountPercent}% discount applied.`
    );
  };

  const removeCoupon = () => {
    setAppliedCoupon(false);
    setCouponInput("");
    setCouponMessage("");
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
              Choose a Wallora service first,
              then request it here.
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
          Choose how you want Wallora to
          schedule your service.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.5fr_0.8fr]">
        {/* LEFT */}
        <div className="space-y-7">

          {/* CART */}
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
                        item.price *
                        item.quantity
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
                        removeItem(
                          item.serviceId
                        )
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

          {/* SERVICE MODE */}
          <div className="neu-surface p-6 md:p-8">
            <h2 className="heading-md">
              Choose Service Type
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">

              {/* FAST */}
              <button
                type="button"
                onClick={() =>
                  setMode("fast")
                }
                className={`rounded-[28px] p-6 text-left transition-all ${
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
                  Pay 50% advance and choose
                  your exact service date.
                </p>
              </button>

              {/* FLEXIBLE */}
              <button
                type="button"
                onClick={() =>
                  setMode("flexible")
                }
                className={`rounded-[28px] p-6 text-left transition-all ${
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
                  Choose a preferred date range.
                  Wallora assigns an available
                  date within that range.
                </p>
              </button>
            </div>

            {/* DATE */}
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
                      setServiceDate(
                        event.target.value
                      )
                    }
                    className="neu-input w-full"
                  />

                  <p className="mt-2 text-xs text-[var(--muted)]">
                    Fast Service requires 50%
                    advance payment.
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
                        setFromDate(
                          event.target.value
                        )
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
                        setToDate(
                          event.target.value
                        )
                      }
                      className="neu-input w-full"
                    />
                  </div>

                  <p className="text-xs text-[var(--muted)] sm:col-span-2">
                    Wallora will assign the
                    actual service date based
                    on availability within your
                    selected range.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SUMMARY */}
        <aside>
          <div className="neu-surface sticky top-28 p-7">

            <h2 className="heading-md">
              Order Summary
            </h2>

            <div className="mt-6 space-y-4 text-sm">

              {/* SERVICE COUNT */}
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">
                  Services
                </span>

                <span className="font-bold">
                  {cart.reduce(
                    (sum, item) =>
                      sum + item.quantity,
                    0
                  )}
                </span>
              </div>

              <div className="soft-divider" />

              {/* ORIGINAL TOTAL */}
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">
                  Subtotal
                </span>

                <span className="font-bold">
                  ৳{total.toLocaleString()}
                </span>
              </div>

              {/* COUPON */}
              {couponSettings.couponEnabled && (
                <div className="neu-inset rounded-[20px] p-4">

                  <p className="text-sm font-bold text-[#414637]">
                    Have a coupon?
                  </p>

                  {!appliedCoupon ? (
                    <>
                      <div className="mt-3 flex gap-2">
                        <input
                          value={couponInput}
                          onChange={(e) => {
                            setCouponInput(
                              e.target.value.toUpperCase()
                            );
                            setCouponMessage("");
                          }}
                          placeholder="Coupon code"
                          className="neu-input min-w-0 flex-1"
                        />

                        <button
                          type="button"
                          onClick={applyCoupon}
                          className="neu-button neu-button-primary shrink-0"
                        >
                          Apply
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-[var(--primary)]">
                          {couponSettings.couponCode}
                        </p>

                        <p className="mt-1 text-xs text-[var(--muted)]">
                          {
                            couponSettings.couponDiscountPercent
                          }
                          % discount applied
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={
                          removeCoupon
                        }
                        className="text-xs font-bold text-[var(--muted)] underline"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {couponMessage && (
                    <p
                      className={`mt-3 text-xs font-semibold ${
                        appliedCoupon
                          ? "text-[var(--primary)]"
                          : "text-red-700"
                      }`}
                    >
                      {couponMessage}
                    </p>
                  )}
                </div>
              )}

              {/* DISCOUNT */}
              {appliedCoupon && (
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">
                    Discount
                  </span>

                  <span className="font-bold text-[var(--primary)]">
                    -৳{discount.toLocaleString()}
                  </span>
                </div>
              )}

              <div className="soft-divider" />

              {/* FINAL TOTAL */}
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">
                  Total
                </span>

                <span className="font-bold text-lg">
                  ৳{finalTotal.toLocaleString()}
                </span>
              </div>

              {/* ADVANCE */}
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">
                  Advance
                </span>

                <span className="font-bold text-[var(--primary)]">
                  ৳{advance.toLocaleString()}
                </span>
              </div>

              {/* DUE */}
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">
                  After completion
                </span>

                <span className="font-bold">
                  ৳{dueAfterWork.toLocaleString()}
                </span>
              </div>
            </div>

            {/* INFO */}
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

            {/* CONTINUE */}
            <Link
              href={`/order/customer?mode=${mode}&total=${finalTotal}&originalTotal=${total}&discount=${discount}&couponCode=${encodeURIComponent(
                appliedCoupon
                  ? couponSettings.couponCode
                  : ""
              )}&advance=${advance}&serviceDate=${serviceDate}&fromDate=${fromDate}&toDate=${toDate}`}
              className="neu-button neu-button-primary mt-7 w-full"
            >
              Continue
              <ArrowRight size={18} />
            </Link>

            {/* CLEAR CART */}
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