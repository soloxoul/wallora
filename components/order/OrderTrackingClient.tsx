"use client";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  MapPin,
  PackageCheck,
  Search,
  User,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";

type OrderItem = {
  id: number;
  service_id: string;
  title: string;
  price: number;
  unit: string;
  image: string;
  quantity: number;
};

type Order = {
  id: string;
  customer_name: string;
  phone: string;
  address: string;
  maps_link: string;
  service_mode: string;
  service_date: string | null;
  from_date: string | null;
  to_date: string | null;
  total: number;
  advance: number;

  payment_method: string | null;
  transaction_id: string | null;
  payment_amount: number | null;
  payment_status: string | null;
  payment_submitted_at: string | null;

  status: string;
  assigned_date: string | null;
  created_at: string;
  wallora_order_items: OrderItem[];
};

function formatDate(date: string | null) {
  if (!date) return "Not assigned";

  return new Date(`${date}T00:00:00`).toLocaleDateString(
    "en-BD",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
}

function formatDateTime(date: string | null) {
  if (!date) return "Not submitted";

  return new Date(date).toLocaleString("en-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function normalizeStatus(status: string) {
  return status.trim().toLowerCase();
}

function getProgress(status: string) {
  const normalized = normalizeStatus(status);

  if (
    normalized === "completed" ||
    normalized === "complete"
  ) {
    return 4;
  }

  if (
    normalized === "confirmed" ||
    normalized === "assigned"
  ) {
    return 3;
  }

  if (
    normalized === "processing" ||
    normalized === "in progress"
  ) {
    return 3;
  }

  return 1;
}

function getStatusLabel(status: string) {
  const normalized = normalizeStatus(status);

  if (normalized === "pending") return "Pending";
  if (normalized === "confirmed") return "Confirmed";
  if (normalized === "assigned") return "Service Assigned";
  if (normalized === "processing") return "In Progress";

  if (
    normalized === "completed" ||
    normalized === "complete"
  ) {
    return "Completed";
  }

  return status || "Pending";
}

function getPaymentStatusLabel(status: string | null) {
  const normalized = normalizeStatus(status || "");

  if (
    normalized === "verified" ||
    normalized === "paid"
  ) {
    return "Payment Verified";
  }

  if (
    normalized === "payment_submitted" ||
    normalized === "submitted"
  ) {
    return "Payment Submitted";
  }

  if (normalized === "rejected") {
    return "Payment Rejected";
  }

  if (
    normalized === "not_required" ||
    normalized === "not required"
  ) {
    return "No Advance Required";
  }

  return "Payment Pending";
}

function getPaymentStatusClass(status: string | null) {
  const normalized = normalizeStatus(status || "");

  if (
    normalized === "verified" ||
    normalized === "paid"
  ) {
    return "text-[var(--primary)]";
  }

  if (normalized === "rejected") {
    return "text-[var(--dark)]";
  }

  return "text-[var(--muted)]";
}

export default function OrderTrackingClient() {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const searchOrder = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const cleanOrderId = orderId.trim();

    if (!cleanOrderId) {
      setErrorMessage("Please enter your Order ID.");
      setOrder(null);
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setOrder(null);

    try {
      const { data, error } = await supabase
        .from("wallora_orders")
        .select(`
          id,
          customer_name,
          phone,
          address,
          maps_link,
          service_mode,
          service_date,
          from_date,
          to_date,
          total,
          advance,
          payment_method,
          transaction_id,
          payment_amount,
          payment_status,
          payment_submitted_at,
          status,
          assigned_date,
          created_at,
          wallora_order_items (
            id,
            service_id,
            title,
            price,
            unit,
            image,
            quantity
          )
        `)
        .eq("id", cleanOrderId)
        .maybeSingle();

      if (error) {
        console.error("Order tracking failed:", error);
        throw new Error(error.message);
      }

      if (!data) {
        setErrorMessage(
          "No order found with this Order ID. Please check the ID and try again."
        );
        return;
      }

      setOrder(data as Order);
    } catch (error) {
      console.error(error);

      setErrorMessage(
        "Unable to load your order right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const progress = order
    ? getProgress(order.status)
    : 0;

  return (
    <section className="section-padding page-container">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--muted)]"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>

          <h1 className="heading-xl mt-5">
            Track Your Order
          </h1>

          <p className="mt-3 max-w-2xl text-[var(--muted)]">
            Enter your Wallora Order ID to check your
            service status, schedule and payment details.
          </p>
        </div>

        {/* Search */}
        <form
          onSubmit={searchOrder}
          className="neu-surface p-5 md:p-7"
        >
          <label
            htmlFor="order-id"
            className="mb-3 block text-sm font-bold"
          >
            Wallora Order ID
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                size={19}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]"
              />

              <input
                id="order-id"
                type="text"
                value={orderId}
                onChange={(event) =>
                  setOrderId(event.target.value)
                }
                placeholder="Example: WAL-8F3A21BC"
                className="neu-input w-full pl-12"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="neu-button neu-button-primary min-h-[52px] sm:min-w-[150px]"
            >
              {loading ? "Searching..." : "Track Order"}

              {!loading && <Search size={18} />}
            </button>
          </div>

          {errorMessage && (
            <div className="neu-inset mt-5 rounded-[16px] p-4 text-sm font-semibold text-[var(--dark)]">
              {errorMessage}
            </div>
          )}
        </form>

        {/* Order Result */}
        {order && (
          <div className="mt-8 space-y-7">

            {/* Order Header */}
            <div className="neu-surface p-6 md:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[var(--muted)]">
                    Order ID
                  </p>

                  <h2 className="mt-1 break-all font-display text-2xl font-extrabold text-[var(--dark)]">
                    {order.id}
                  </h2>
                </div>

                <div className="neu-inset rounded-full px-5 py-3">
                  <span className="text-sm font-bold text-[var(--primary)]">
                    {getStatusLabel(order.status)}
                  </span>
                </div>
              </div>

              {/* Progress */}
              <div className="mt-8">
                <div className="grid grid-cols-4 gap-2">
                  {[
                    {
                      label: "Received",
                      icon: PackageCheck,
                    },
                    {
                      label: "Confirmed",
                      icon: CheckCircle2,
                    },
                    {
                      label: "Scheduled",
                      icon: CalendarDays,
                    },
                    {
                      label: "Completed",
                      icon: CheckCircle2,
                    },
                  ].map((step, index) => {
                    const stepNumber = index + 1;
                    const active =
                      progress >= stepNumber;

                    const Icon = step.icon;

                    return (
                      <div
                        key={step.label}
                        className="text-center"
                      >
                        <div
                          className={`mx-auto flex h-11 w-11 items-center justify-center rounded-full ${
                            active
                              ? "neu-button-primary"
                              : "neu-surface-small"
                          }`}
                        >
                          <Icon size={18} />
                        </div>

                        <p
                          className={`mt-2 text-[10px] font-bold sm:text-xs ${
                            active
                              ? "text-[var(--primary)]"
                              : "text-[var(--muted)]"
                          }`}
                        >
                          {step.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Customer + Schedule */}
            <div className="grid gap-7 lg:grid-cols-2">

              {/* Customer */}
              <div className="neu-surface p-6 md:p-7">
                <div className="flex items-center gap-3">
                  <div className="neu-icon-button">
                    <User size={20} />
                  </div>

                  <h2 className="heading-md">
                    Customer Details
                  </h2>
                </div>

                <div className="mt-6 space-y-4">

                  <div>
                    <p className="text-xs font-semibold text-[var(--muted)]">
                      Name
                    </p>

                    <p className="mt-1 font-bold">
                      {order.customer_name}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-[var(--muted)]">
                      Phone
                    </p>

                    <p className="mt-1 font-bold">
                      {order.phone}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-[var(--muted)]">
                      Address
                    </p>

                    <p className="mt-1 font-bold leading-6">
                      {order.address}
                    </p>
                  </div>

                  {order.maps_link && (
                    <a
                      href={order.maps_link}
                      target="_blank"
                      rel="noreferrer"
                      className="neu-button neu-button-secondary inline-flex"
                    >
                      <MapPin size={17} />
                      Open Maps
                    </a>
                  )}
                </div>
              </div>

              {/* Schedule */}
              <div className="neu-surface p-6 md:p-7">
                <div className="flex items-center gap-3">
                  <div className="neu-icon-button">
                    <CalendarDays size={20} />
                  </div>

                  <h2 className="heading-md">
                    Service Schedule
                  </h2>
                </div>

                <div className="mt-6 space-y-4">

                  <div>
                    <p className="text-xs font-semibold text-[var(--muted)]">
                      Service Type
                    </p>

                    <p className="mt-1 font-bold">
                      {order.service_mode === "fast"
                        ? "Fast Service"
                        : "Flexible Service"}
                    </p>
                  </div>

                  {order.service_mode === "fast" ? (
                    <div>
                      <p className="text-xs font-semibold text-[var(--muted)]">
                        Requested Service Date
                      </p>

                      <p className="mt-1 font-bold text-[var(--primary)]">
                        {formatDate(order.service_date)}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-semibold text-[var(--muted)]">
                        Preferred Date Range
                      </p>

                      <p className="mt-1 font-bold">
                        {formatDate(order.from_date)}
                        {" — "}
                        {formatDate(order.to_date)}
                      </p>
                    </div>
                  )}

                  <div className="neu-inset rounded-[18px] p-4">
                    <div className="flex items-start gap-3">
                      <Clock3
                        size={19}
                        className="mt-0.5 shrink-0 text-[var(--primary)]"
                      />

                      <div>
                        <p className="text-xs font-semibold text-[var(--muted)]">
                          Assigned Service Date
                        </p>

                        <p className="mt-1 font-bold">
                          {order.assigned_date
                            ? formatDate(order.assigned_date)
                            : "Not assigned yet"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="neu-surface p-6 md:p-8">
              <h2 className="heading-md">
                Ordered Services
              </h2>

              <div className="mt-6 space-y-4">
                {order.wallora_order_items?.map(
                  (item) => (
                    <div
                      key={item.id}
                      className="neu-surface-small flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-20 w-full rounded-[18px] object-cover sm:w-28"
                        />
                      )}

                      <div className="flex-1">
                        <h3 className="font-display font-bold">
                          {item.title}
                        </h3>

                        <p className="mt-1 text-sm text-[var(--muted)]">
                          ৳
                          {Number(
                            item.price
                          ).toLocaleString()}{" "}
                          {item.unit}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-5 sm:flex-col sm:items-end">
                        <span className="neu-inset rounded-full px-4 py-2 text-sm font-bold">
                          × {item.quantity}
                        </span>

                        <span className="font-display text-lg font-extrabold text-[var(--primary)]">
                          ৳
                          {(
                            Number(item.price) *
                            item.quantity
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Payment */}
            <div className="neu-surface p-6 md:p-8">
              <div className="flex items-center gap-3">
                <div className="neu-icon-button">
                  <CreditCard size={20} />
                </div>

                <h2 className="heading-md">
                  Payment Summary
                </h2>
              </div>

              {/* Amount Summary */}
              <div className="mt-6 grid gap-4 sm:grid-cols-3">

                <div className="neu-surface-small p-5">
                  <p className="text-xs font-semibold text-[var(--muted)]">
                    Total
                  </p>

                  <p className="mt-2 font-display text-xl font-extrabold">
                    ৳
                    {Number(
                      order.total
                    ).toLocaleString()}
                  </p>
                </div>

                <div className="neu-surface-small p-5">
                  <p className="text-xs font-semibold text-[var(--muted)]">
                    Advance
                  </p>

                  <p className="mt-2 font-display text-xl font-extrabold text-[var(--primary)]">
                    ৳
                    {Number(
                      order.advance
                    ).toLocaleString()}
                  </p>
                </div>

                <div className="neu-surface-small p-5">
                  <p className="text-xs font-semibold text-[var(--muted)]">
                    Remaining
                  </p>

                  <p className="mt-2 font-display text-xl font-extrabold">
                    ৳
                    {(
                      Number(order.total) -
                      Number(order.advance)
                    ).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Payment Information */}
              {Number(order.advance) > 0 ? (
                <div className="mt-6 grid gap-4 md:grid-cols-2">

                  <div className="neu-inset rounded-[18px] p-5">
                    <p className="text-xs font-semibold text-[var(--muted)]">
                      Payment Method
                    </p>

                    <p className="mt-2 font-bold">
                      {order.payment_method
                        ? order.payment_method
                        : "Not submitted"}
                    </p>
                  </div>

                  <div className="neu-inset rounded-[18px] p-5">
                    <p className="text-xs font-semibold text-[var(--muted)]">
                      Payment Status
                    </p>

                    <p
                      className={`mt-2 font-bold ${getPaymentStatusClass(
                        order.payment_status
                      )}`}
                    >
                      {getPaymentStatusLabel(
                        order.payment_status
                      )}
                    </p>
                  </div>

                  <div className="neu-inset rounded-[18px] p-5">
                    <p className="text-xs font-semibold text-[var(--muted)]">
                      Transaction ID
                    </p>

                    <p className="mt-2 break-all font-bold">
                      {order.transaction_id
                        ? order.transaction_id
                        : "Not submitted"}
                    </p>
                  </div>

                  <div className="neu-inset rounded-[18px] p-5">
                    <p className="text-xs font-semibold text-[var(--muted)]">
                      Submitted Amount
                    </p>

                    <p className="mt-2 font-display text-lg font-extrabold">
                      {order.payment_amount
                        ? `৳${Number(
                            order.payment_amount
                          ).toLocaleString()}`
                        : "Not submitted"}
                    </p>
                  </div>

                  <div className="neu-inset rounded-[18px] p-5 md:col-span-2">
                    <p className="text-xs font-semibold text-[var(--muted)]">
                      Payment Submitted
                    </p>

                    <p className="mt-2 font-bold">
                      {formatDateTime(
                        order.payment_submitted_at
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="neu-inset mt-6 rounded-[18px] p-5">
                  <p className="text-sm font-semibold text-[var(--muted)]">
                    Payment Status
                  </p>

                  <p className="mt-2 font-bold text-[var(--primary)]">
                    No advance payment required
                  </p>
                </div>
              )}

              {/* Payment Notice */}
              <div className="neu-inset mt-5 rounded-[18px] p-4">
                <p className="text-sm leading-6 text-[var(--muted)]">
                  {Number(order.advance) > 0
                    ? "Your advance payment information is linked to this order. Wallora will verify the transaction before marking the payment as verified."
                    : "No advance payment was required for this service. The full amount is due after service completion."}
                </p>
              </div>
            </div>

            {/* Order Date */}
            <div className="text-center">
              <p className="text-xs text-[var(--muted)]">
                Order placed on{" "}
                {new Date(
                  order.created_at
                ).toLocaleDateString("en-BD", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

          </div>
        )}
      </div>
    </section>
  );
}