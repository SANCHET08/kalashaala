import { ArrowLeft, Bell, CalendarDays, CreditCard, Mail, Palette, Sparkles, WalletCards } from "lucide-react";
import { createElement, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const subscriptionOptions = [
  {
    id: "art-lover",
    title: "Art Lover",
    price: "Rs. 99/month",
    description: "Monthly art updates, early gallery previews, and saved inspiration lists.",
    icon: Palette,
  },
  {
    id: "event-access",
    title: "Event Access",
    price: "Rs. 199/month",
    description: "Workshop reminders, priority event alerts, and discounted registration notices.",
    icon: CalendarDays,
  },
  {
    id: "artist-pro",
    title: "Artist Pro",
    price: "Rs. 299/month",
    description: "Artist opportunity alerts, buyer request updates, and portfolio promotion support.",
    icon: Sparkles,
  },
];

const paymentMethods = [
  {
    id: "razorpay",
    title: "Razorpay Checkout",
    description: "UPI, wallet, net banking, and cards in the Razorpay popup.",
    icon: WalletCards,
  },
  {
    id: "card",
    title: "Credit / Debit Card",
    description: "Card payment opens securely inside Razorpay Checkout.",
    icon: CreditCard,
  },
];

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function SubscribePage() {
  const [selected, setSelected] = useState(subscriptionOptions[0]);
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0]);
  const [email, setEmail] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!email.trim()) return;
    setDone(false);
    setStatusMessage("Creating payment order...");

    try {
      const response = await fetch(`${API_BASE_URL}/custom_auth/payments/razorpay-order/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_id: selected.id,
          email,
          payment_method: paymentMethod.id,
        }),
      });
      const order = await response.json();

      if (!response.ok) {
        throw new Error(order.error || "Unable to create payment order");
      }

      if (!order.configured) {
        setStatusMessage(order.message || "Add Razorpay keys in backend .env to accept real payments.");
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Unable to load Razorpay Checkout.");
      }

      const checkout = new window.Razorpay({
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: "KalaShaala",
        description: `${selected.title} subscription`,
        order_id: order.order_id,
        prefill: { email },
        method: paymentMethod.id === "card"
          ? { card: true, netbanking: false, wallet: false, upi: false }
          : { card: true, netbanking: true, wallet: true, upi: true },
        handler: () => {
          setDone(true);
          setStatusMessage(`${selected.title} payment completed.`);
        },
        modal: {
          ondismiss: () => setStatusMessage("Payment was closed before completion."),
        },
        theme: { color: "#d94f1f" },
      });

      checkout.open();
      setStatusMessage("Razorpay Checkout opened.");
    } catch (error) {
      setStatusMessage(error.message || "Payment failed. Please try again.");
    }
  }

  return (
    <main className="subscribe-page">
      <section className="subscribe-card">
        <Link className="subscribe-back" to="/">
          <ArrowLeft size={18} />
          Home
        </Link>

        <div className="subscribe-heading">
          <span className="eyebrow">
            <Bell size={16} />
            Paid Subscription Plans
          </span>
          <h1>Choose a KalaShaala paid plan</h1>
          <p>Select a monthly plan, choose Razorpay or card, and continue to secure payment.</p>
        </div>

        <div className="subscribe-options" role="radiogroup" aria-label="Subscription options">
          {subscriptionOptions.map((option) => (
            <button
              key={option.title}
              type="button"
              className={selected.title === option.title ? "active" : ""}
              onClick={() => {
                setSelected(option);
                setDone(false);
              }}
              role="radio"
              aria-checked={selected.title === option.title}
            >
              {createElement(option.icon, { size: 24 })}
              <span>{option.title}</span>
              <strong>{option.price}</strong>
              <small>{option.description}</small>
            </button>
          ))}
        </div>

        <div className="payment-methods" role="radiogroup" aria-label="Payment methods">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              type="button"
              className={paymentMethod.id === method.id ? "active" : ""}
              onClick={() => {
                setPaymentMethod(method);
                setDone(false);
                setStatusMessage("");
              }}
              role="radio"
              aria-checked={paymentMethod.id === method.id}
            >
              {createElement(method.icon, { size: 21 })}
              <span>{method.title}</span>
              <small>{method.description}</small>
            </button>
          ))}
        </div>

        <form className="subscribe-form" onSubmit={handleSubmit}>
          <label htmlFor="subscribe-email">
            <CreditCard size={18} />
            Payment details
          </label>
          <div>
            <input
              id="subscribe-email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setDone(false);
              }}
              placeholder="you@example.com"
              required
            />
            <button type="submit">{done ? "Paid" : "Proceed to Payment"}</button>
          </div>
          <p>
            {done
              ? `${selected.title} payment received through ${paymentMethod.title}.`
              : `Selected: ${selected.title} / ${selected.price} / ${paymentMethod.title}`}
          </p>
          {statusMessage && <p className="subscribe-status">{statusMessage}</p>}
          <p className="subscribe-note">
            <Mail size={15} />
            Card details are collected only by Razorpay Checkout, not stored by KalaShaala.
          </p>
        </form>
      </section>
    </main>
  );
}
