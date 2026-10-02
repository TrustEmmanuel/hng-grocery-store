import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatNaira } from "../lib/money";
import { ProductVisual } from "./ProductVisual";

export function ProductCard({ product }) {
  const { addItem } = useCart();
  const [label, setLabel] = useState("Add");
  const soldOut = product.stock_quantity <= 0;

  function onAdd(event) {
    event.preventDefault();
    const added = addItem(product, 1);
    setLabel(added ? "Added" : "Max");
    window.setTimeout(() => setLabel("Add"), 900);
  }

  return (
    <article className="card">
      <Link to={`/product/${product.id}`} className="card-media" aria-label={product.name}>
        <ProductVisual product={product} />
      </Link>
      <div className="card-body">
        <p className="kicker">{product.category}</p>
        <h3>
          <Link to={`/product/${product.id}`}>{product.name}</Link>
        </h3>
        <div className="card-row">
          <span className="price">{formatNaira(product.price)}</span>
          <button type="button" className="btn btn-small" onClick={onAdd} disabled={soldOut}>
            {soldOut ? "Out" : label}
          </button>
        </div>
        {product.stock_quantity > 0 && product.stock_quantity < 8 && (
          <p className="stock-note">Only {product.stock_quantity} left</p>
        )}
      </div>
    </article>
  );
}
