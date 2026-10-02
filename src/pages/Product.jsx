import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ProductVisual } from "../components/ProductVisual";
import { ProductCard } from "../components/ProductCard";
import { Qty } from "../components/Qty";
import { useCart } from "../context/CartContext";
import { useCatalog } from "../context/CatalogContext";
import { categories } from "../data/products";
import { formatNaira } from "../lib/money";
import { useTitle } from "../lib/useTitle";

export function Product() {
  const { id } = useParams();
  const { products, loading } = useCatalog();
  const { addItem } = useCart();
  const product = products.find((item) => item.id === id);
  const [qty, setQty] = useState(1);
  const [notice, setNotice] = useState("");

  useTitle(product?.name || "Product");

  useEffect(() => {
    setQty(1);
    setNotice("");
  }, [id]);

  if (loading) {
    return (
      <div className="wrap">
        <p className="muted">Loading the shelf…</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="wrap empty">
        <h1>That item isn’t on the shelf.</h1>
        <Link to="/shop" className="btn">
          Back to the shop
        </Link>
      </div>
    );
  }

  const max = Math.min(12, product.stock_quantity);
  const soldOut = max <= 0;
  const category = categories.find((item) => item.name === product.category);
  const related = products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 4);

  function onAdd() {
    const added = addItem(product, qty);
    setNotice(added ? "Added to the basket." : "That’s as many as we can pack.");
  }

  return (
    <div className="wrap">
      <p className="crumb">
        <Link to="/shop">Shop</Link>
        <span>/</span>
        {category ? <Link to={`/shop?category=${category.slug}`}>{product.category}</Link> : product.category}
      </p>
      <article className="detail">
        <div className="detail-media">
          <ProductVisual product={product} />
        </div>
        <div className="detail-copy">
          <p className="kicker">{product.category}</p>
          <h1>{product.name}</h1>
          <p className="detail-price">{formatNaira(product.price)}</p>
          <p className="description">{product.description}</p>
          {soldOut ? (
            <p className="form-error">Out of stock.</p>
          ) : (
            <div className="buy-row">
              <Qty value={qty} max={max} onChange={setQty} />
              <button type="button" className="btn" onClick={onAdd}>
                Add to basket
              </button>
            </div>
          )}
          {notice && <p className="notice">{notice}</p>}
          {!soldOut && product.stock_quantity < 8 && (
            <p className="stock-note">Only {product.stock_quantity} left</p>
          )}
        </div>
      </article>

      {related.length > 0 && (
        <section className="shelf related">
          <div className="section-head">
            <h2>Also in {product.category}</h2>
          </div>
          <div className="product-grid">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
