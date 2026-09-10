"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Phone,
  UserRound,
  WalletCards,
  Package,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

type OrderItem = {
  serviceId: string;
  title: string;
  price: number;
  unit: string;
  image: string;
  quantity: number;
};

type Order = {
  id: string;
  items: OrderItem[];
  total: number;
  advance: number;
  dueAfterWork: number;
  serviceMode: "fast" | "flexible";
  serviceDate: string;
  preferredFrom: string;
  preferredTo: string;
  assignedServiceDate: string;
  customer: {
    name: string;
    phone: string;
    address: string;
    mapsLink: string;
  };
  paymentStatus: "advance_pending" | "not_required";
  status: "pending" | "confirmed" | "completed";
  createdAt: string;
};

const ORDERS_KEY = "wallora_orders";

export default function AdminOrdersClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  function loadOrders() {
    try {
      const saved = localStorage.getItem(ORDERS_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setOrders(parsed);
        }
      }
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  function saveOrders(updated: Order[]) {
    setOrders(updated);
    localStorage.setItem(
      ORDERS_KEY,
      JSON.stringify(updated)
    );
  }

  function assignDate(id: string, date: string) {
    const updated = orders.map((order) =>
      order.id === id
        ? {
            ...order,
            assignedServiceDate: date,
            status: "confirmed" as const,
          }
        : order
    );

    saveOrders(updated);
  }

  function updateStatus(
    id: string,
    status: Order["status"]
  ) {
    const updated = orders.map((order) =>
      order.id === id
        ? { ...order, status }
        : order
    );

    saveOrders(updated);
  }

  function formatDate(value: string) {
    if (!value) return "Not assigned";

    try {
      return new Date(value).toLocaleDateString(
        "en-BD",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
        }
      );
    } catch {
      return value;
    }
  }

  function formatCreatedAt(value: string) {
    if (!value) return "";

    try {
      return new Date(value).toLocaleString(
        "en-BD",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }
      );
    } catch {
      return value;
    }
  }

  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter(
        (order) => order.status === "pending"
      ).length,
      confirmed: orders.filter(
        (order) => order.status === "confirmed"
      ).length,
      completed: orders.filter(
        (order) => order.status === "completed"
      ).length,
    };
  }, [orders]);

  if (loading) {
    return (
      <section className="page-container section-padding">
        <div className="neu-surface rounded-[32px] p-10 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#9a9b78]/30 border-t-[#687052]" />
          <p className="mt-4 text-sm font-bold text-[#777868]">
            Loading orders...
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="page-container section-padding">

      {/* HEADER */}
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

        <div>
          <Link
            href="/admin"
            className="mb-5 inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-bold text-[#687052] transition hover:bg-[#dfdacb]"
          >
            <ArrowLeft size={16} />
            Dashboard
          </Link>

          <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#9a9b78]">
            Admin Portal
          </p>

          <h1 className="heading-lg">
            Customer Orders
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#777868]">
            View customer requests, payment information and
            assign service dates.
          </p>
        </div>

        <div className="neu-surface-small rounded-2xl px-5 py-4">
          <p className="text-xs font-bold text-[#777868]">
            Total Orders
          </p>

          <p className="font-display text-2xl font-extrabold text-[#687052]">
            {stats.total}
          </p>
        </div>
      </div>

      {/* STATS */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <StatCard
          icon={Package}
          label="All Orders"
          value={stats.total}
        />

        <StatCard
          icon={Clock3}
          label="Pending"
          value={stats.pending}
        />

        <StatCard
          icon={CheckCircle2}
          label="Confirmed"
          value={stats.confirmed}
        />

        <StatCard
          icon={CalendarDays}
          label="Completed"
          value={stats.completed}
        />

      </div>

      {/* EMPTY */}
      {orders.length === 0 ? (
        <div className="neu-surface rounded-[36px] p-10 text-center sm:p-16">

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-[#e1dccd] text-[#687052] neu-inset">
            <Package size={32} />
          </div>

          <h2 className="heading-md mt-6">
            No orders yet
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#777868]">
            Customer orders will appear here after someone
            completes the Wallora booking process.
          </p>

        </div>
      ) : (
        <div className="space-y-5">

          {orders.map((order) => {
            const isOpen = expanded === order.id;

            return (
              <div
                key={order.id}
                className="neu-surface overflow-hidden rounded-[32px]"
              >

                {/* ORDER HEADER */}
                <button
                  type="button"
                  onClick={() =>
                    setExpanded(
                      isOpen ? null : order.id
                    )
                  }
                  className="flex w-full flex-col gap-5 p-5 text-left sm:p-7 lg:flex-row lg:items-center lg:justify-between"
                >

                  <div className="flex min-w-0 items-start gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#687052] text-[#fffdf5]">
                      <Package size={21} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">

                        <h2 className="font-display text-lg font-extrabold text-[#414637]">
                          {order.id}
                        </h2>

                        <StatusBadge
                          status={order.status}
                        />

                        <span className="rounded-full bg-[#e1dccd] px-3 py-1 text-[11px] font-extrabold text-[#687052]">
                          {order.serviceMode === "fast"
                            ? "Fast Service"
                            : "Flexible Service"}
                        </span>

                      </div>

                      <p className="mt-1 text-xs font-semibold text-[#777868]">
                        {formatCreatedAt(
                          order.createdAt
                        )}
                      </p>
                    </div>

                  </div>

                  <div className="flex items-center justify-between gap-5 sm:justify-end">

                    <div className="text-left sm:text-right">
                      <p className="text-xs font-bold text-[#777868]">
                        Order Total
                      </p>

                      <p className="font-display text-xl font-extrabold text-[#687052]">
                        ৳{order.total.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl text-[#687052]">
                      {isOpen ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </div>

                  </div>

                </button>

                {/* DETAILS */}
                {isOpen && (
                  <div className="border-t border-[#414637]/10 px-5 pb-7 pt-6 sm:px-7">

                    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">

                      {/* CUSTOMER */}
                      <div className="neu-inset rounded-[28px] p-6">

                        <div className="mb-5 flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#687052] text-[#fffdf5]">
                            <UserRound size={19} />
                          </div>

                          <div>
                            <p className="text-xs font-bold text-[#777868]">
                              Customer
                            </p>

                            <h3 className="font-display font-extrabold text-[#414637]">
                              {order.customer.name}
                            </h3>
                          </div>
                        </div>

                        <div className="space-y-4">

                          <InfoRow
                            icon={Phone}
                            label="Phone"
                            value={order.customer.phone}
                          />

                          <InfoRow
                            icon={MapPin}
                            label="Address"
                            value={order.customer.address}
                          />

                          {order.customer.mapsLink && (
                            <a
                              href={
                                order.customer.mapsLink
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#687052] px-4 text-sm font-extrabold text-[#fffdf5] transition hover:opacity-90"
                            >
                              <MapPin size={16} />
                              Open Google Maps
                            </a>
                          )}

                        </div>
                      </div>

                      {/* PAYMENT */}
                      <div className="neu-inset rounded-[28px] p-6">

                        <div className="mb-5 flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e1dccd] text-[#687052] neu-inset">
                            <WalletCards size={19} />
                          </div>

                          <div>
                            <p className="text-xs font-bold text-[#777868]">
                              Payment
                            </p>

                            <h3 className="font-display font-extrabold text-[#414637]">
                              Order Summary
                            </h3>
                          </div>
                        </div>

                        <div className="space-y-3 text-sm">

                          <SummaryRow
                            label="Total"
                            value={`৳${order.total.toLocaleString()}`}
                          />

                          <SummaryRow
                            label="Advance"
                            value={`৳${order.advance.toLocaleString()}`}
                          />

                          <SummaryRow
                            label="Due after work"
                            value={`৳${order.dueAfterWork.toLocaleString()}`}
                          />

                          <div className="soft-divider my-4" />

                          <SummaryRow
                            label="Payment status"
                            value={
                              order.paymentStatus ===
                              "advance_pending"
                                ? "Advance pending"
                                : "No advance required"
                            }
                            highlight
                          />

                        </div>
                      </div>

                    </div>

                    {/* SERVICES */}
                    <div className="mt-6">

                      <h3 className="mb-4 font-display text-lg font-extrabold text-[#414637]">
                        Ordered Services
                      </h3>

                      <div className="grid gap-3 sm:grid-cols-2">

                        {order.items.map((item) => (
                          <div
                            key={item.serviceId}
                            className="neu-surface-small flex items-center gap-4 rounded-2xl p-4"
                          >

                            <img
                              src={item.image}
                              alt={item.title}
                              className="h-16 w-16 shrink-0 rounded-xl object-cover"
                            />

                            <div className="min-w-0 flex-1">
                              <h4 className="truncate text-sm font-extrabold text-[#414637]">
                                {item.title}
                              </h4>

                              <p className="mt-1 text-xs font-semibold text-[#777868]">
                                {item.quantity} × ৳
                                {item.price.toLocaleString()}
                              </p>
                            </div>

                            <p className="font-display font-extrabold text-[#687052]">
                              ৳
                              {(
                                item.price *
                                item.quantity
                              ).toLocaleString()}
                            </p>

                          </div>
                        ))}

                      </div>
                    </div>

                    {/* SERVICE DATE */}
                    <div className="mt-6 neu-surface-small rounded-[28px] p-6">

                      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

                        <div>
                          <div className="mb-3 flex items-center gap-2">
                            <CalendarDays
                              size={19}
                              className="text-[#687052]"
                            />

                            <h3 className="font-display font-extrabold text-[#414637]">
                              Service Schedule
                            </h3>
                          </div>

                          {order.serviceMode ===
                          "fast" ? (
                            <div className="space-y-1 text-sm text-[#777868]">
                              <p>
                                Customer requested:
                                {" "}
                                <strong className="text-[#414637]">
                                  {formatDate(
                                    order.serviceDate
                                  )}
                                </strong>
                              </p>

                              <p className="text-xs">
                                Fast Service · 50% advance
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-1 text-sm text-[#777868]">
                              <p>
                                Preferred range:
                                {" "}
                                <strong className="text-[#414637]">
                                  {formatDate(
                                    order.preferredFrom
                                  )}
                                </strong>
                                {" "}
                                →{" "}
                                <strong className="text-[#414637]">
                                  {formatDate(
                                    order.preferredTo
                                  )}
                                </strong>
                              </p>

                              <p className="text-xs">
                                Flexible Service · No advance
                              </p>
                            </div>
                          )}

                          {order.assignedServiceDate && (
                            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#687052] px-4 py-2 text-xs font-extrabold text-[#fffdf5]">
                              <CheckCircle2 size={14} />
                              Assigned:{" "}
                              {formatDate(
                                order.assignedServiceDate
                              )}
                            </div>
                          )}
                        </div>

                        <div className="w-full lg:max-w-xs">

                          <label className="mb-2 block text-xs font-extrabold text-[#414637]">
                            Assign Service Date
                          </label>

                          <input
                            type="date"
                            value={
                              order.assignedServiceDate ||
                              ""
                            }
                            onChange={(e) =>
                              assignDate(
                                order.id,
                                e.target.value
                              )
                            }
                            className="neu-input w-full"
                          />

                          <p className="mt-2 text-[11px] text-[#777868]">
                            Saving a date automatically
                            confirms the order.
                          </p>

                        </div>

                      </div>
                    </div>

                    {/* STATUS */}
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                      <p className="text-xs font-semibold text-[#777868]">
                        Update order status
                      </p>

                      <div className="flex flex-wrap gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            updateStatus(
                              order.id,
                              "pending"
                            )
                          }
                          className="neu-button-secondary min-h-11"
                        >
                          Pending
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            updateStatus(
                              order.id,
                              "confirmed"
                            )
                          }
                          className="neu-button-primary min-h-11"
                        >
                          Confirmed
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            updateStatus(
                              order.id,
                              "completed"
                            )
                          }
                          className="neu-button min-h-11 bg-[#9a9b78] text-[#fffdf5]"
                        >
                          Completed
                        </button>

                      </div>
                    </div>

                  </div>
                )}

              </div>
            );
          })}

        </div>
      )}
    </section>
  );
}

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
}) {
  return (
    <div className="neu-surface rounded-[28px] p-5">

      <div className="flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e1dccd] text-[#687052] neu-inset">
          <Icon size={19} />
        </div>

        <span className="font-display text-2xl font-extrabold text-[#687052]">
          {value}
        </span>
      </div>

      <p className="mt-4 text-sm font-bold text-[#777868]">
        {label}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: Order["status"];
}) {
  const config = {
    pending: {
      text: "Pending",
      className:
        "bg-[#e1dccd] text-[#777868]",
    },
    confirmed: {
      text: "Confirmed",
      className:
        "bg-[#687052] text-[#fffdf5]",
    },
    completed: {
      text: "Completed",
      className:
        "bg-[#9a9b78] text-[#fffdf5]",
    },
  };

  const item = config[status];

  return (
    <span
      className={`rounded-full px-3 py-1 text-[11px] font-extrabold ${item.className}`}
    >
      {item.text}
    </span>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <Icon
        size={17}
        className="mt-0.5 shrink-0 text-[#687052]"
      />

      <div className="min-w-0">
        <p className="text-[11px] font-bold text-[#9a9b78]">
          {label}
        </p>

        <p className="break-words text-sm font-semibold text-[#414637]">
          {value}
        </p>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="font-semibold text-[#777868]">
        {label}
      </span>

      <span
        className={
          highlight
            ? "font-extrabold text-[#687052]"
            : "font-bold text-[#414637]"
        }
      >
        {value}
      </span>
    </div>
  );
}