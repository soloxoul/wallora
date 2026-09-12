"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Phone,
  User,
  QrCode,
  CreditCard,
  Clock3,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  getCart,
  clearCart,
  type CartItem,
} from "@/lib/cart";
import { supabase } from "@/lib/supabase";

type ServiceMode = "fast" | "flexible";

type PaymentMethod =
  | "bKash"
  | "Nagad"
  | "Rocket"
  | "Upay"
  | "SureCash"
  | "Tap"
  | "Bank Transfer"
  | "Debit/Credit Card"
  | "Cash Payment"
  | "Other";

const paymentMethods: PaymentMethod[] = [
  "bKash",
  "Nagad",
  "Rocket",
  "Upay",
  "SureCash",
  "Tap",
  "Bank Transfer",
  "Debit/Credit Card",
  "Cash Payment",
  "Other",
];

export default function CustomerDetailsClient() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [mapsLink, setMapsLink] = useState("");

  const [mode, setMode] =
    useState<ServiceMode>("fast");

  const [total, setTotal] = useState(0);
  const [originalTotal, setOriginalTotal] =
    useState(0);
  const [discount, setDiscount] =
    useState(0);
  const [advance, setAdvance] = useState(0);

  const [couponCode, setCouponCode] =
    useState("");

  const [paymentQr, setPaymentQr] =
    useState("");

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

  /* =========================================================
     PAYMENT STATE
  ========================================================= */

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("bKash");

  const [transactionId, setTransactionId] =
    useState("");

  const [paymentAmount, setPaymentAmount] =
    useState("");

  const [paymentSubmitted, setPaymentSubmitted] =
    useState(false);

  const [paymentSubmitting, setPaymentSubmitting] =
    useState(false);

  const [paymentError, setPaymentError] =
    useState("");

  const [paymentStatus, setPaymentStatus] =
    useState("not_submitted");

  const dueAfterWork =
    Math.max(0, total - advance);

  /* =========================================================
     READ BOOKING INFORMATION + PAYMENT QR
  ========================================================= */

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    const selectedMode =
      params.get("mode") === "flexible"
        ? "flexible"
        : "fast";

    const finalTotal = Number(
      params.get("total") ?? 0
    );

    const oldTotal = Number(
      params.get("originalTotal") ??
        finalTotal
    );

    const couponDiscount = Number(
      params.get("discount") ?? 0
    );

    const selectedAdvance = Number(
      params.get("advance") ?? 0
    );

    setMode(selectedMode);

    setTotal(finalTotal);

    setOriginalTotal(oldTotal);

    setDiscount(couponDiscount);

    setCouponCode(
      params.get("couponCode") ?? ""
    );

    setAdvance(selectedAdvance);

    setPaymentAmount(
      selectedAdvance.toString()
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

    loadPaymentQr();
  }, []);

  /* =========================================================
     LOAD PAYMENT QR FROM ADMIN SETTINGS
  ========================================================= */

  const loadPaymentQr = async () => {
    const { data, error } =
      await supabase
        .from("wallora_settings")
        .select("payment_qr")
        .limit(1)
        .maybeSingle();

    if (error) {
      console.error(
        "Payment QR loading failed:",
        error
      );

      return;
    }

    setPaymentQr(
      data?.payment_qr ?? ""
    );
  };

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
      ------------------------------------------------------- */

      const newOrderId =
        "WAL-" +
        Date.now()
          .toString()
          .slice(-8);

      /* -------------------------------------------------------
         CREATE MAIN ORDER
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

          payment_method:
            "",

          transaction_id:
            "",

          payment_amount:
            0,

          payment_status:
            "not_submitted",

          payment_submitted_at:
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
         SAVE ORDER ITEMS
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
     SUBMIT PAYMENT INFORMATION
  ========================================================= */

  const submitPayment = async () => {
    setPaymentError("");

    if (!orderId) {
      setPaymentError(
        "Order ID is missing. Please contact Wallora support."
      );

      return;
    }

    if (!paymentMethod) {
      setPaymentError(
        "Please select your payment method."
      );

      return;
    }

    const amount = Number(
      paymentAmount
    );

    if (!amount || amount <= 0) {
      setPaymentError(
        "Please enter a valid payment amount."
      );

      return;
    }

    if (amount !== advance) {
      setPaymentError(
        `Please enter the exact advance amount: ৳${advance.toLocaleString()}.`
      );

      return;
    }

    /*
     * Cash Payment does not require
     * a transaction ID.
     */

    if (
      paymentMethod !== "Cash Payment" &&
      !transactionId.trim()
    ) {
      setPaymentError(
        "Please enter your transaction/reference ID."
      );

      return;
    }

    setPaymentSubmitting(true);

    try {
      const {
        error: updateError,
      } = await supabase
        .from("wallora_orders")
        .update({
          payment_method:
            paymentMethod,

          transaction_id:
            transactionId.trim(),

          payment_amount:
            amount,

          payment_status:
            "pending",

          payment_submitted_at:
            new Date().toISOString(),
        })
        .eq("id", orderId);

      if (updateError) {
        console.error(
          "Payment submission failed:",
          updateError
        );

        throw new Error(
          `Payment submission failed: ${updateError.message}`
        );
      }

      setPaymentStatus(
        "pending"
      );

      setPaymentSubmitted(true);

      window.dispatchEvent(
        new Event(
          "wallora-orders-updated"
        )
      );
    } catch (err) {
      console.error(
        "Payment submission error:",
        err
      );

      setPaymentError(
        err instanceof Error
          ? err.message
          : "Something went wrong while submitting your payment information."
      );
    } finally {
      setPaymentSubmitting(false);
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

            {/* SUCCESS ICON */}

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

            {/* ORDER ID */}

            <div className="neu-inset mt-7 rounded-[24px] p-5">

              <p className="text-sm text-[var(--muted)]">
                Order ID
              </p>

              <p className="mt-1 font-display text-2xl font-bold text-[var(--primary)]">
                {orderId}
              </p>

              <p className="mt-2 text-xs text-[var(--muted)]">
                Keep this Order ID for tracking
                your service and payment.
              </p>

            </div>

            {/* ORDER SUMMARY */}

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

              {discount > 0 && (
                <>
                  <div className="flex justify-between gap-5">

                    <span className="text-[var(--muted)]">
                      Original Total
                    </span>

                    <strong>
                      ৳
                      {originalTotal.toLocaleString()}
                    </strong>

                  </div>

                  <div className="flex justify-between gap-5">

                    <span className="text-[var(--muted)]">
                      Coupon Discount
                    </span>

                    <strong className="text-[var(--primary)]">
                      -৳
                      {discount.toLocaleString()}
                    </strong>

                  </div>

                  {couponCode && (
                    <div className="flex justify-between gap-5">

                      <span className="text-[var(--muted)]">
                        Coupon
                      </span>

                      <strong>
                        {couponCode}
                      </strong>

                    </div>
                  )}
                </>
              )}

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
                  ৳
                  {dueAfterWork.toLocaleString()}
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

            {/* =================================================
               FAST SERVICE PAYMENT
            ================================================= */}

            {mode === "fast" && (
              <div className="neu-inset mt-8 rounded-[24px] p-6 text-left">

                <div className="flex items-center justify-center gap-2">

                  <QrCode
                    size={20}
                    className="text-[var(--primary)]"
                  />

                  <h2 className="font-display font-bold">
                    Advance Payment
                  </h2>

                </div>

                <p className="mt-3 text-center text-sm leading-6 text-[var(--muted)]">
                  Complete the 50% advance payment
                  and submit your payment information
                  below.
                </p>

                {/* QR */}

                <div className="mt-5 flex justify-center">

                  {paymentQr ? (
                    <img
                      src={paymentQr}
                      alt="Wallora payment QR"
                      className="h-56 w-56 rounded-[20px] object-contain neu-surface p-3"
                    />
                  ) : (
                    <div className="neu-surface flex h-56 w-56 items-center justify-center rounded-[20px] p-6 text-center">

                      <p className="text-sm text-[var(--muted)]">
                        Payment QR has not been
                        configured yet.
                      </p>

                    </div>
                  )}

                </div>

                {/* AMOUNT */}

                <div className="mt-5 text-center">

                  <p className="text-sm text-[var(--muted)]">
                    Required Advance
                  </p>

                  <p className="mt-1 font-display text-2xl font-extrabold text-[var(--primary)]">
                    ৳
                    {advance.toLocaleString()}
                  </p>

                </div>

                {/* =================================================
                   PAYMENT FORM
                ================================================= */}

                {!paymentSubmitted ? (
                  <div className="mt-7 space-y-5">

                    <div className="soft-divider" />

                    <h3 className="font-display text-base font-bold">
                      Submit Payment Information
                    </h3>

                    {/* PAYMENT METHOD */}

                    <div>

                      <label className="mb-2 block text-sm font-bold">
                        Payment Method
                      </label>

                      <select
                        value={paymentMethod}
                        onChange={(event) =>
                          setPaymentMethod(
                            event.target.value as PaymentMethod
                          )
                        }
                        className="neu-input w-full"
                      >
                        {paymentMethods.map(
                          (method) => (
                            <option
                              key={method}
                              value={method}
                            >
                              {method}
                            </option>
                          )
                        )}
                      </select>

                    </div>

                    {/* PAYMENT AMOUNT */}

                    <div>

                      <label className="mb-2 block text-sm font-bold">
                        Payment Amount
                      </label>

                      <input
                        type="number"
                        min="1"
                        value={paymentAmount}
                        onChange={(event) =>
                          setPaymentAmount(
                            event.target.value
                          )
                        }
                        placeholder="Enter payment amount"
                        className="neu-input w-full"
                      />

                      <p className="mt-2 text-xs text-[var(--muted)]">
                        Enter exactly ৳
                        {advance.toLocaleString()}
                        {" "}for this advance payment.
                      </p>

                    </div>

                    {/* TRANSACTION ID */}

                    {paymentMethod !==
                      "Cash Payment" && (
                      <div>

                        <label className="mb-2 block text-sm font-bold">
                          Transaction / Reference ID
                        </label>

                        <input
                          type="text"
                          value={transactionId}
                          onChange={(event) =>
                            setTransactionId(
                              event.target.value
                            )
                          }
                          placeholder="Enter transaction or reference ID"
                          className="neu-input w-full"
                        />

                        <p className="mt-2 text-xs text-[var(--muted)]">
                          Use the transaction/reference
                          number shown by your payment
                          provider.
                        </p>

                      </div>
                    )}

                    {/* CASH NOTE */}

                    {paymentMethod ===
                      "Cash Payment" && (
                      <div className="neu-surface rounded-[18px] p-4">

                        <p className="text-sm font-semibold">
                          Cash Payment
                        </p>

                        <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                          No transaction ID is required.
                          Wallora staff will confirm the
                          cash payment separately.
                        </p>

                      </div>
                    )}

                    {/* PAYMENT ERROR */}

                    {paymentError && (
                      <div className="neu-inset rounded-[18px] p-4">

                        <p className="text-sm font-semibold text-[var(--danger)]">
                          {paymentError}
                        </p>

                      </div>
                    )}

                    {/* SUBMIT PAYMENT */}

                    <button
                      type="button"
                      onClick={submitPayment}
                      disabled={
                        paymentSubmitting
                      }
                      className="neu-button neu-button-primary w-full"
                    >

                      {paymentSubmitting
                        ? "Submitting Payment..."
                        : "Submit Payment"}

                      {!paymentSubmitting && (
                        <ArrowRight
                          size={18}
                        />
                      )}

                    </button>

                  </div>
                ) : (
                  /* =================================================
                     PAYMENT SUBMITTED
                  ================================================= */

                  <div className="mt-7">

                    <div className="soft-divider" />

                    <div className="mt-6 text-center">

                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full neu-inset">

                        <Clock3
                          size={30}
                          className="text-[var(--primary)]"
                        />

                      </div>

                      <h3 className="mt-5 font-display text-lg font-extrabold">
                        Payment Submitted
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                        Your payment information has
                        been submitted successfully.
                        Wallora will verify your payment
                        shortly.
                      </p>

                    </div>

                    {/* PAYMENT DETAILS */}

                    <div className="neu-surface mt-6 rounded-[20px] p-5">

                      <div className="flex justify-between gap-5">

                        <span className="text-sm text-[var(--muted)]">
                          Method
                        </span>

                        <strong className="text-sm">
                          {paymentMethod}
                        </strong>

                      </div>

                      <div className="mt-3 flex justify-between gap-5">

                        <span className="text-sm text-[var(--muted)]">
                          Amount
                        </span>

                        <strong className="text-sm text-[var(--primary)]">
                          ৳
                          {Number(
                            paymentAmount
                          ).toLocaleString()}
                        </strong>

                      </div>

                      {transactionId && (
                        <div className="mt-3 flex justify-between gap-5">

                          <span className="text-sm text-[var(--muted)]">
                            Reference
                          </span>

                          <strong className="max-w-[55%] break-all text-right text-sm">
                            {transactionId}
                          </strong>

                        </div>
                      )}

                      <div className="mt-4 soft-divider" />

                      <div className="mt-4 flex items-center justify-between gap-4">

                        <span className="text-sm text-[var(--muted)]">
                          Payment Status
                        </span>

                        <span className="rounded-full neu-surface px-3 py-2 text-xs font-bold text-[var(--primary)]">
                          Pending Verification
                        </span>

                      </div>

                    </div>

                  </div>
                )}

              </div>
            )}

            {/* =================================================
               FLEXIBLE SERVICE
            ================================================= */}

            {mode === "flexible" && (
              <div className="neu-inset mt-8 rounded-[24px] p-5">

                <div className="flex items-center justify-center gap-2">

                  <CreditCard
                    size={20}
                    className="text-[var(--primary)]"
                  />

                  <h2 className="font-display font-bold">
                    No Advance Payment
                  </h2>

                </div>

                <p className="mt-3 text-center text-sm leading-6 text-[var(--muted)]">
                  No payment is required now.
                  Wallora will review your preferred
                  date range and assign an available
                  service date.
                </p>

              </div>
            )}

            {/* FINAL MESSAGE */}

            <p className="mt-8 text-sm leading-6 text-[var(--muted)]">

              {mode === "fast"
                ? paymentSubmitted
                  ? "Your payment information is now pending verification. Please keep your Order ID for future reference."
                  : "After completing the advance payment, submit your payment information above so Wallora can identify and verify your payment."
                : "Our team will review your preferred date range and assign an available service date."}

            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">

              <Link
                href="/services"
                className="neu-button neu-button-primary inline-flex"
              >
                Explore More Services
                <ArrowRight size={18} />
              </Link>

              <Link
                href="/track-order"
                className="neu-button neu-button-secondary inline-flex"
              >
                Track Order
              </Link>

            </div>

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

        {/* =====================================================
           CUSTOMER FORM
        ===================================================== */}

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

        {/* =====================================================
           BOOKING SUMMARY
        ===================================================== */}

        <aside>

          <div className="neu-surface p-7 lg:sticky lg:top-28">

            <h2 className="heading-md">
              Booking Summary
            </h2>

            <div className="mt-6 space-y-5">

              {/* SERVICE TYPE */}

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

              {/* FAST DATE */}

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

              {/* FLEXIBLE DATE */}

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

              {/* SUBTOTAL */}

              {discount > 0 && (
                <div className="flex justify-between gap-5">

                  <span className="text-[var(--muted)]">
                    Subtotal
                  </span>

                  <strong>
                    ৳
                    {originalTotal.toLocaleString()}
                  </strong>

                </div>
              )}

              {/* DISCOUNT */}

              {discount > 0 && (
                <div className="flex justify-between gap-5">

                  <span className="text-[var(--muted)]">
                    Coupon Discount
                  </span>

                  <strong className="text-[var(--primary)]">
                    -৳
                    {discount.toLocaleString()}
                  </strong>

                </div>
              )}

              {/* COUPON */}

              {couponCode && (
                <div className="flex justify-between gap-5">

                  <span className="text-[var(--muted)]">
                    Coupon
                  </span>

                  <strong>
                    {couponCode}
                  </strong>

                </div>
              )}

              {/* TOTAL */}

              <div className="flex justify-between gap-5">

                <span className="text-[var(--muted)]">
                  Total
                </span>

                <strong className="font-display text-lg text-[var(--primary)]">
                  ৳
                  {total.toLocaleString()}
                </strong>

              </div>

              {/* ADVANCE */}

              <div className="flex justify-between gap-5">

                <span className="text-[var(--muted)]">
                  Advance
                </span>

                <strong className="text-[var(--primary)]">
                  ৳
                  {advance.toLocaleString()}
                </strong>

              </div>

              {/* AFTER WORK */}

              <div className="flex justify-between gap-5">

                <span className="text-[var(--muted)]">
                  Pay After Work
                </span>

                <strong>
                  ৳
                  {dueAfterWork.toLocaleString()}
                </strong>

              </div>

              {/* PAYMENT NOTE */}

              {mode === "fast" && (
                <div className="neu-inset rounded-[18px] p-4">

                  <p className="text-sm font-semibold">
                    50% advance required
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                    After confirming the service
                    request, you will be able to
                    submit your advance payment
                    information.
                  </p>

                </div>
              )}

              {mode === "flexible" && (
                <div className="neu-inset rounded-[18px] p-4">

                  <p className="text-sm font-semibold">
                    No advance payment
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                    Wallora will assign an available
                    service date within your preferred
                    range.
                  </p>

                </div>
              )}

            </div>

          </div>

        </aside>

      </div>

    </section>
  );
}