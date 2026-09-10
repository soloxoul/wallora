"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  getCart,
  clearCart,
  type CartItem,
} from "@/lib/cart";
import { supabase } from "@/lib/supabase";

type ServiceMode = "fast" | "flexible";

export default function CustomerDetailsClient() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [mapsLink, setMapsLink] = useState("");

  const [mode, setMode] =
    useState<ServiceMode>("fast");

  const [total, setTotal] = useState(0);
  const [advance, setAdvance] = useState(0);

  const [serviceDate, setServiceDate] =
    useState("");

  const [fromDate, setFromDate] =
    useState("");

  const [toDate, setToDate] =
    useState("");

  const [submitted, setSubmitted] =
    useState(false);

  const [orderId, setOrderId] =
    useState("");

  const [error, setError] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const dueAfterWork =
    Math.max(0, total - advance);

  /* =========================================================
     READ BOOKING INFORMATION FROM URL
  ========================================================= */

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    const selectedMode =
      params.get("mode") === "flexible"
        ? "flexible"
        : "fast";

    setMode(selectedMode);

    setTotal(
      Number(params.get("total") ?? 0)
    );

    setAdvance(
      Number(params.get("advance") ?? 0)
    );

    setServiceDate(
      params.get("serviceDate") ?? ""
    );

    setFromDate(
      params.get("fromDate") ?? ""
    );

    setToDate(
      params.get("toDate") ?? ""
    );
  }, []);

  /* =========================================================
     SUBMIT ORDER
  ========================================================= */

  const submitOrder = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    try {
      const cart = getCart();

      /* -------------------------------------------------------
         CART VALIDATION
      ------------------------------------------------------- */

      if (!cart || cart.length === 0) {
        setError(
          "Your service cart is empty. Please select a service first."
        );
        return;
      }

      /* -------------------------------------------------------
         CUSTOMER VALIDATION
      ------------------------------------------------------- */

      if (!name.trim()) {
        setError(
          "Please enter your full name."
        );
        return;
      }

      if (!phone.trim()) {
        setError(
          "Please enter your phone number."
        );
        return;
      }

      if (!address.trim()) {
        setError(
          "Please enter your service address."
        );
        return;
      }

      /* -------------------------------------------------------
         DATE VALIDATION
      ------------------------------------------------------- */

      if (
        mode === "fast" &&
        !serviceDate
      ) {
        setError(
          "Please select your exact service date."
        );
        return;
      }

      if (
        mode === "flexible" &&
        (!fromDate || !toDate)
      ) {
        setError(
          "Please select both preferred From and To dates."
        );
        return;
      }

      if (
        mode === "flexible" &&
        fromDate &&
        toDate &&
        fromDate > toDate
      ) {
        setError(
          "Preferred To date cannot be earlier than From date."
        );
        return;
      }

      setSubmitting(true);

      /* -------------------------------------------------------
         GENERATE CUSTOMER-FACING ORDER ID

         This ID is also the primary key of wallora_orders.
      ------------------------------------------------------- */

      const newOrderId =
        "WAL-" +
        Date.now()
          .toString()
          .slice(-8);

      /* -------------------------------------------------------
         1. CREATE MAIN ORDER

         Matches current Supabase schema:
         id
         customer_name
         phone
         address
         maps_link
         service_mode
         service_date
         from_date
         to_date
         total
         advance
         status
         assigned_date
      ------------------------------------------------------- */

      const {
        data: order,
        error: orderError,
      } = await supabase
        .from("wallora_orders")
        .insert({
          id: newOrderId,

          customer_name:
            name.trim(),

          phone:
            phone.trim(),

          address:
            address.trim(),

          maps_link:
            mapsLink.trim(),

          service_mode:
            mode,

          service_date:
            mode === "fast"
              ? serviceDate
              : null,

          from_date:
            mode === "flexible"
              ? fromDate
              : null,

          to_date:
            mode === "flexible"
              ? toDate
              : null,

          total:
            total,

          advance:
            advance,

          status:
            "pending",

          assigned_date:
            null,
        })
        .select("id")
        .single();

      if (orderError) {
        console.error(
          "Order creation failed:",
          orderError
        );

        throw new Error(
          `Order creation failed: ${orderError.message}`
        );
      }

      if (!order) {
        throw new Error(
          "Order was created but no order data was returned."
        );
      }

      /* -------------------------------------------------------
         2. SAVE ORDER ITEMS

         Matches current Supabase schema:
         order_id
         service_id
         title
         price
         unit
         image
         quantity
      ------------------------------------------------------- */

      const orderItems = cart.map(
        (item: CartItem) => ({
          order_id:
            order.id,

          service_id:
            item.serviceId,

          title:
            item.title,

          price:
            item.price,

          unit:
            item.unit,

          image:
            item.image,

          quantity:
            item.quantity,
        })
      );

      const {
        error: itemsError,
      } = await supabase
        .from("wallora_order_items")
        .insert(orderItems);

      /* -------------------------------------------------------
         ROLLBACK MAIN ORDER IF ITEMS FAIL
      ------------------------------------------------------- */

      if (itemsError) {
        console.error(
          "Order items creation failed:",
          itemsError
        );

        await supabase
          .from("wallora_orders")
          .delete()
          .eq("id", order.id);

        throw new Error(
          `Order items could not be saved: ${itemsError.message}`
        );
      }

      /* -------------------------------------------------------
         EVERYTHING SUCCESSFUL
      ------------------------------------------------------- */

      clearCart();

      setOrderId(order.id);

      setSubmitted(true);

      window.dispatchEvent(
        new Event(
          "wallora-orders-updated"
        )
      );
    } catch (err) {
      console.error(
        "Wallora order submission error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while submitting your request. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================================================
     CONFIRMATION SCREEN
  ========================================================= */

  if (submitted) {
    return (
      <section className="section-padding page-container">
        <div className="mx-auto max-w-2xl text-center">
          <div className="neu-surface p-8 md:p-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full neu-inset">
              <CheckCircle2
                size={42}
                className="text-[var(--primary)]"
              />
            </div>

            <h1 className="heading-lg mt-7">
              Service Request Confirmed
            </h1>

            <p className="mt-4 leading-7 text-[var(--muted)]">
              Thank you for choosing Wallora.
              Your service request has been
              successfully submitted.
            </p>

            <div className="neu-inset mt-7 rounded-[24px] p-5">
              <p className="text-sm text-[var(--muted)]">
                Order ID
              </p>

              <p className="mt-1 font-display text-2xl font-bold text-[var(--primary)]">
                {orderId}
              </p>
            </div>

            <div className="mt-7 space-y-4 text-left">
              <div className="flex justify-between gap-5">
                <span className="text-[var(--muted)]">
                  Service Type
                </span>

                <strong>
                  {mode === "fast"
                    ? "Fast Service"
                    : "Flexible Service"}
                </strong>
              </div>

              <div className="flex justify-between gap-5">
                <span className="text-[var(--muted)]">
                  Total
                </span>

                <strong>
                  ৳{total.toLocaleString()}
                </strong>
              </div>

              <div className="flex justify-between gap-5">
                <span className="text-[var(--muted)]">
                  Advance
                </span>

                <strong className="text-[var(--primary)]">
                  ৳{advance.toLocaleString()}
                </strong>
              </div>

              <div className="flex justify-between gap-5">
                <span className="text-[var(--muted)]">
                  After Work
                </span>

                <strong>
                  ৳{dueAfterWork.toLocaleString()}
                </strong>
              </div>

              {mode === "fast" &&
                serviceDate && (
                  <div className="flex justify-between gap-5">
                    <span className="text-[var(--muted)]">
                      Requested Date
                    </span>

                    <strong>
                      {serviceDate}
                    </strong>
                  </div>
                )}

              {mode === "flexible" &&
                fromDate &&
                toDate && (
                  <div className="flex justify-between gap-5">
                    <span className="text-[var(--muted)]">
                      Preferred Range
                    </span>

                    <strong>
                      {fromDate} → {toDate}
                    </strong>
                  </div>
                )}
            </div>

            <p className="mt-8 text-sm leading-6 text-[var(--muted)]">
              {mode === "fast"
                ? "Please complete the 50% advance payment according to Wallora's payment instructions. Our team will contact you regarding the service."
                : "Our team will review your preferred date range and assign an available service date."}
            </p>

            <Link
              href="/services"
              className="neu-button neu-button-primary mt-7 inline-flex"
            >
              Explore More Services
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  /* =========================================================
     CUSTOMER DETAILS FORM
  ========================================================= */

  return (
    <section className="section-padding page-container">
      <div className="mb-10">
        <Link
          href="/order"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--muted)]"
        >
          <ArrowLeft size={16} />
          Back to Order
        </Link>

        <h1 className="heading-xl mt-5">
          Customer Details
        </h1>

        <p className="mt-3 max-w-2xl text-[var(--muted)]">
          Enter your contact and location
          information so Wallora can arrange
          your service.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.7fr]">
        <form
          onSubmit={submitOrder}
          className="neu-surface p-6 md:p-8"
        >
          <h2 className="heading-md">
            Your Information
          </h2>

          <div className="mt-7 space-y-6">
            {/* NAME */}
            <div>
              <label className="mb-2 block text-sm font-bold">
                Full Name
              </label>

              <div className="relative">
                <User
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                />

                <input
                  required
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value
                    )
                  }
                  placeholder="Enter your full name"
                  className="neu-input w-full pl-12"
                />
              </div>
            </div>

            {/* PHONE */}
            <div>
              <label className="mb-2 block text-sm font-bold">
                Phone Number
              </label>

              <div className="relative">
                <Phone
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                />

                <input
                  required
                  type="tel"
                  value={phone}
                  onChange={(event) =>
                    setPhone(
                      event.target.value
                    )
                  }
                  placeholder="01XXXXXXXXX"
                  className="neu-input w-full pl-12"
                />
              </div>
            </div>

            {/* ADDRESS */}
            <div>
              <label className="mb-2 block text-sm font-bold">
                Service Address
              </label>

              <textarea
                required
                value={address}
                onChange={(event) =>
                  setAddress(
                    event.target.value
                  )
                }
                placeholder="Enter the complete address where the service will be performed"
                className="neu-textarea min-h-[130px] w-full"
              />
            </div>

            {/* MAPS */}
            <div>
              <label className="mb-2 block text-sm font-bold">
                Google Maps Location Link
              </label>

              <div className="relative">
                <MapPin
                  size={18}
                  className="absolute left-4 top-4 text-[var(--muted)]"
                />

                <input
                  type="url"
                  value={mapsLink}
                  onChange={(event) =>
                    setMapsLink(
                      event.target.value
                    )
                  }
                  placeholder="Paste your Google Maps link"
                  className="neu-input w-full pl-12"
                />
              </div>

              <p className="mt-2 text-xs text-[var(--muted)]">
                Optional, but recommended so our
                team can easily find your location.
              </p>
            </div>

            {/* ERROR */}
            {error && (
              <div className="neu-inset rounded-[18px] p-4">
                <p className="text-sm font-semibold text-[var(--danger)]">
                  {error}
                </p>
              </div>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={submitting}
              className="neu-button neu-button-primary w-full"
            >
              {submitting
                ? "Submitting..."
                : "Confirm Service Request"}

              {!submitting && (
                <ArrowRight size={18} />
              )}
            </button>
          </div>
        </form>

        {/* BOOKING SUMMARY */}
        <aside>
          <div className="neu-surface p-7 lg:sticky lg:top-28">
            <h2 className="heading-md">
              Booking Summary
            </h2>

            <div className="mt-6 space-y-5">
              <div>
                <p className="text-sm text-[var(--muted)]">
                  Service Type
                </p>

                <p className="mt-1 font-bold">
                  {mode === "fast"
                    ? "Fast Service"
                    : "Flexible Service"}
                </p>
              </div>

              {mode === "fast" &&
                serviceDate && (
                  <div>
                    <p className="text-sm text-[var(--muted)]">
                      Requested Date
                    </p>

                    <p className="mt-1 font-bold">
                      {serviceDate}
                    </p>
                  </div>
                )}

              {mode === "flexible" &&
                fromDate &&
                toDate && (
                  <div>
                    <p className="text-sm text-[var(--muted)]">
                      Preferred Date Range
                    </p>

                    <p className="mt-1 font-bold">
                      {fromDate}
                      <br />
                      to
                      <br />
                      {toDate}
                    </p>
                  </div>
                )}

              <div className="soft-divider" />

              <div className="flex justify-between">
                <span className="text-[var(--muted)]">
                  Total
                </span>

                <strong>
                  ৳{total.toLocaleString()}
                </strong>
              </div>

              <div className="flex justify-between">
                <span className="text-[var(--muted)]">
                  Advance
                </span>

                <strong className="text-[var(--primary)]">
                  ৳{advance.toLocaleString()}
                </strong>
              </div>

              <div className="flex justify-between">
                <span className="text-[var(--muted)]">
                  Pay After Work
                </span>

                <strong>
                  ৳{dueAfterWork.toLocaleString()}
                </strong>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}