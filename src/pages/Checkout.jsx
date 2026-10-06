import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BasketLines, Totals } from "../components/Basket";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { placeOrder } from "../lib/api";
import { formatNaira } from "../lib/money";
import { deliveryFee } from "../lib/pricing";
import { useTitle } from "../lib/useTitle";

const emptyForm = {
  recipient: "",
  phone: "",
  street: "",
  area: "",
  city: "Lagos",
  note: "",
};

function validPhone(value) {
  const compact = value.replace(/[\s-]/g, "");
  return /^(\+234|0)[789]\d{9}$/.test(compact);
}

function composeAddress(form) {
  return [
    form.recipient.trim(),
    [form.street.trim(), form.area.trim(), form.city.trim()].filter(Boolean).join(", "),
    form.note.trim() ? `Note: ${form.note.trim()}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function Checkout() {
  useTitle("Checkout");
  const navigate = useNavigate();
  const { user, openSignIn } = useAuth();
  const { items, subtotal, clear, isLoading, error: cartError } = useCart();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function validate() {
    const next = {};
    if (form.recipient.trim().length < 2) next.recipient = "Add the recipient’s name.";
    if (!validPhone(form.phone)) next.phone = "Use a Nigerian number, like 0803 000 0000 or +234…";
    if (form.street.trim().length < 4) next.street = "Add a street address.";
    if (form.area.trim().length < 2) next.area = "Add the area, such as Yaba or Lekki.";
    if (form.city.trim().length < 2) next.city = "Add a city.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(event) {
    event.preventDefault();
    setSubmitError("");
    if (!user) {
      openSignIn();
      return;
    }
    if (!validate()) return;

    setSubmitting(true);
    try {
      const result = await placeOrder({
        credential: user.credential,
        items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
        delivery_address: composeAddress(form),
        phone: form.phone.replace(/[\s-]/g, ""),
      });
      const order = result.order;
      sessionStorage.setItem(`tajmart.order.${order.id}`, JSON.stringify({ ...result, order }));
      await clear();
      navigate(`/order/${order.id}`);
    } catch (error) {
      setSubmitError(error.message || "Could not place the order.");
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="wrap">
        <p className="muted">Loading the basket…</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="wrap empty">
        <h1>Nothing to check out.</h1>
        <Link to="/shop" className="btn">
          Shop the shelf
        </Link>
      </div>
    );
  }

  const total = subtotal + deliveryFee(subtotal);

  return (
    <div className="wrap">
      <header className="section-head">
        <div>
          <p className="kicker">Checkout</p>
          <h1>Where should we bring it?</h1>
        </div>
      </header>

      {!user && (
        <div className="gate">
          <div>
            <h2>Sign in to place the order</h2>
            <p>Sign in with Google so this basket is saved to your account and the receipt has somewhere to go.</p>
          </div>
          <button type="button" className="btn" onClick={openSignIn}>
            Sign in with Google
          </button>
        </div>
      )}

      <div className="checkout">
        <form onSubmit={onSubmit} className="checkout-form">
          {user && (
            <p className="signed-in">
              Signed in as <strong>{user.name}</strong> · {user.email}
            </p>
          )}
          <Field label="Recipient" error={errors.recipient}>
            <input
              value={form.recipient}
              onChange={(event) => update("recipient", event.target.value)}
              autoComplete="name"
              placeholder={user?.name || "Name on the bag"}
            />
          </Field>
          <Field label="Phone" error={errors.phone}>
            <input
              value={form.phone}
              onChange={(event) => update("phone", event.target.value)}
              inputMode="tel"
              autoComplete="tel"
              placeholder="0803 000 0000"
            />
          </Field>
          <Field label="Street address" error={errors.street}>
            <input
              value={form.street}
              onChange={(event) => update("street", event.target.value)}
              autoComplete="street-address"
              placeholder="14 Market Lane"
            />
          </Field>
          <div className="split">
            <Field label="Area" error={errors.area}>
              <input
                value={form.area}
                onChange={(event) => update("area", event.target.value)}
                placeholder="Yaba"
              />
            </Field>
            <Field label="City" error={errors.city}>
              <input
                value={form.city}
                onChange={(event) => update("city", event.target.value)}
                autoComplete="address-level2"
              />
            </Field>
          </div>
          <Field label="Note for the rider" optional>
            <textarea
              rows={3}
              value={form.note}
              onChange={(event) => update("note", event.target.value)}
              placeholder="Gate code, landmark, or when to call"
            />
          </Field>
          <p className="muted">Payment is transfer or cash when the bag arrives. We don’t take card details here.</p>
          {cartError && <p className="form-error">{cartError}</p>}
          {submitError && <p className="form-error">{submitError}</p>}
          <button type="submit" className="btn" disabled={submitting || !user}>
            {submitting ? "Placing order…" : user ? `Place order · ${formatNaira(total)}` : "Sign in to place order"}
          </button>
        </form>
        <aside className="summary">
          <h2>Order summary</h2>
          <BasketLines items={items} />
          <Totals subtotal={subtotal} />
        </aside>
      </div>
    </div>
  );
}

function Field({ label, error, optional, children }) {
  return (
    <label className="field">
      <span>
        {label}
        {optional && <em>Optional</em>}
      </span>
      {children}
      {error && <small>{error}</small>}
    </label>
  );
}
