import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatNaira } from "../lib/money";
import { deliveryFee } from "../lib/pricing";
import { ProductVisual } from "./ProductVisual";
import { Qty } from "./Qty";

export function BasketLines({ items, editable = false }) {
  const { setQty, remove } = useCart();

  return (
    <ul className="lines">
      {items.map((item) => (
        <li key={item.id} className="line">
          <Link to={`/product/${item.id}`} className="line-art" aria-label={item.name}>
            <ProductVisual product={item} />
          </Link>
          <div className="line-copy">
            <Link to={`/product/${item.id}`}>{item.name}</Link>
            <p>{formatNaira(item.price)}</p>
            {editable ? (
              <div className="line-actions">
                <Qty
                  value={item.quantity}
                  max={item.stock_quantity || 12}
                  onChange={(quantity) => setQty(item.id, quantity)}
                />
                <button type="button" className="text-btn" onClick={() => remove(item.id)}>
                  Remove
                </button>
              </div>
            ) : (
              <p className="muted">Qty {item.quantity}</p>
            )}
          </div>
          <strong className="line-total">{formatNaira(item.price * item.quantity)}</strong>
        </li>
      ))}
    </ul>
  );
}

export function Totals({ subtotal }) {
  const delivery = deliveryFee(subtotal);
  const total = subtotal + delivery;
  return (
    <dl className="totals">
      <div>
        <dt>Subtotal</dt>
        <dd>{formatNaira(subtotal)}</dd>
      </div>
      <div>
        <dt>Delivery</dt>
        <dd>{delivery === 0 ? "Free" : formatNaira(delivery)}</dd>
      </div>
      <div className="grand">
        <dt>Total</dt>
        <dd>{formatNaira(total)}</dd>
      </div>
      <p className="delivery-note">Free delivery on baskets from ₦15,000. Otherwise ₦1,200 across Lagos.</p>
    </dl>
  );
}
