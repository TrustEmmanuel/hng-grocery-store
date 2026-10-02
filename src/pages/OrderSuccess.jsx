import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Totals } from "../components/Basket";
import { formatNaira } from "../lib/money";
import { subtotalOf } from "../lib/pricing";
import { useTitle } from "../lib/useTitle";

export function OrderSuccess() {
  const { id } = useParams();
  const [record, setRecord] = useState(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(`tajmart.order.${id}`);
    if (!raw) return;
    try {
      setRecord(JSON.parse(raw));
    } catch {
      setRecord(null);
    }
  }, [id]);

  const order = record?.order;
  useTitle(order ? "Order confirmed" : "Order");

  if (!order) {
    return (
      <div className="wrap empty">
        <h1>We can’t show that order on this device.</h1>
        <p>If you just placed it, the confirmation was tied to this browser session.</p>
        <Link to="/shop" className="btn">
          Back to the shop
        </Link>
      </div>
    );
  }

  const shortId = order.id.slice(0, 8).toUpperCase();
  const subtotal = subtotalOf(order.items || []);

  return (
    <div className="wrap narrow">
      <article className="confirmation">
        <p className="kicker">Order {shortId}</p>
        <h1>Thank you. We’re packing the bag.</h1>
        <p className="lede">
          {record.emailSent
            ? "A confirmation is on its way to your inbox, with the items, total, and delivery address."
            : "The order is saved. The confirmation email could not be sent — we’ll still deliver from the address you gave."}
        </p>
        <dl className="confirm-meta">
          <div>
            <dt>Deliver to</dt>
            <dd>{order.delivery_address}</dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd>{order.phone}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd className="status">{order.status}</dd>
          </div>
        </dl>
        <ul className="confirm-items">
          {(order.items || []).map((item) => (
            <li key={item.id}>
              <span>
                {item.name}
                <em> × {item.quantity}</em>
              </span>
              <strong>{formatNaira(item.price * item.quantity)}</strong>
            </li>
          ))}
        </ul>
        <Totals subtotal={subtotal} />
        <Link to="/shop" className="btn">
          Continue shopping
        </Link>
      </article>
    </div>
  );
}
