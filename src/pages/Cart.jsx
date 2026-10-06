import { Link } from "react-router-dom";
import { BasketLines, Totals } from "../components/Basket";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useTitle } from "../lib/useTitle";

export function Cart() {
  useTitle("Basket");
  const { user, openSignIn } = useAuth();
  const { items, subtotal, isLoading, error } = useCart();

  return (
    <div className="wrap narrow">
      <header className="section-head">
        <div>
          <p className="kicker">Your basket</p>
          <h1>Ready when you are</h1>
        </div>
      </header>

      {isLoading ? (
        <p className="muted">Loading the basket…</p>
      ) : items.length === 0 ? (
        <div className="empty">
          <h2>The basket is empty.</h2>
          {error ? <p className="form-error">{error}</p> : null}
          <p>
            {user
              ? "The shelf is stocked — garri, drinks, bread, and the rest of the weekly run."
              : "Sign in with Google and this basket stays on your account, ready for the phone as well as this browser."}
          </p>
          {user ? (
            <Link to="/shop" className="btn">
              Shop the shelf
            </Link>
          ) : (
            <button type="button" className="btn" onClick={openSignIn}>
              Sign in with Google
            </button>
          )}
        </div>
      ) : (
        <>
          {error ? <p className="form-error">{error}</p> : null}
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
        </>
      )}
    </div>
  );
}
