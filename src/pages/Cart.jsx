import { Link } from "react-router-dom";
import { BasketLines, Totals } from "../components/Basket";
import { useCart } from "../context/CartContext";
import { useTitle } from "../lib/useTitle";

export function Cart() {
  useTitle("Basket");
  const { items, subtotal } = useCart();

  return (
    <div className="wrap narrow">
      <header className="section-head">
        <div>
          <p className="kicker">Your basket</p>
          <h1>Ready when you are</h1>
        </div>
      </header>

      {items.length === 0 ? (
        <div className="empty">
          <h2>The basket is empty.</h2>
          <p>The shelf is stocked — garri, drinks, bread, and the rest of the weekly run.</p>
          <Link to="/shop" className="btn">
            Shop the shelf
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <BasketLines items={items} editable />
          <aside className="summary">
            <Totals subtotal={subtotal} />
            <Link to="/checkout" className="btn btn-block">
              Checkout
            </Link>
            <Link to="/shop" className="text-link center">
              Continue shopping
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
