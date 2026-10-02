import { Link } from "react-router-dom";
import { ProductCard } from "../components/ProductCard";
import { ProductVisual } from "../components/ProductVisual";
import { categories, pickFeatured } from "../data/products";
import { useCatalog } from "../context/CatalogContext";
import { formatNaira } from "../lib/money";
import { useTitle } from "../lib/useTitle";

export function Home() {
  useTitle("");
  const { products, loading } = useCatalog();
  const featured = pickFeatured(products);
  const heroProducts = featured.slice(0, 4);

  return (
    <div className="wrap">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Your neighborhood Nigerian grocery store</p>
          <h1>Groceries for the way Lagos cooks.</h1>
          <p className="lede">
            Garri, Semovita, palm oil, and Maggi on the same shelf as Coca-Cola, Fanta, and Agege bread. Order before 4pm and we deliver the same day.
          </p>
          <div className="hero-actions">
            <Link to="/shop" className="btn btn-light">
              Shop the shelf
            </Link>
            <Link to="/shop?category=staples" className="btn btn-ghost">
              Nigerian staples
            </Link>
          </div>
          <p className="hero-meta">Pay on delivery · Lagos same-day · Sign in only at checkout</p>
        </div>
        <div className="hero-shelf" aria-label="Featured products">
          {loading
            ? Array.from({ length: 4 }, (_, index) => <div key={index} className="hero-skeleton" />)
            : heroProducts.map((product) => (
                <Link key={product.id} to={`/product/${product.id}`} className="hero-tile">
                  <ProductVisual product={product} />
                  <span className="hero-tile-name">{product.name}</span>
                  <span className="hero-tile-price">{formatNaira(product.price)}</span>
                </Link>
              ))}
        </div>
      </section>

      <section className="band" aria-label="Categories">
        {categories.map((category, index) => (
          <Link key={category.slug} to={`/shop?category=${category.slug}`} className="band-item">
            <span>0{index + 1}</span>
            <strong>{category.name}</strong>
            <em>{category.blurb}</em>
          </Link>
        ))}
      </section>

      <section className="shelf">
        <div className="section-head">
          <div>
            <p className="kicker">This week</p>
            <h2>On the shelf</h2>
          </div>
          <Link to="/shop" className="text-link">
            View the full shelf
          </Link>
        </div>
        {loading ? (
          <div className="product-grid">
            {Array.from({ length: 8 }, (_, index) => (
              <div key={index} className="skeleton" />
            ))}
          </div>
        ) : (
          <div className="product-grid">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <section className="steps">
        <article>
          <span>01</span>
          <h2>Build a basket</h2>
          <p>Add what the kitchen is short on. The basket stays on this device until you check out.</p>
        </article>
        <article>
          <span>02</span>
          <h2>Sign in with Google</h2>
          <p>Browsing is open. We ask for Google only when the order needs a name and an inbox.</p>
        </article>
        <article>
          <span>03</span>
          <h2>We cross Lagos</h2>
          <p>Leave a phone number and address. Pay by transfer or cash when the bag arrives.</p>
        </article>
      </section>
    </div>
  );
}
