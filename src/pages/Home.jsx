import { Link } from "react-router-dom";
import { ProductCard } from "../components/ProductCard";
import { ProductVisual } from "../components/ProductVisual";
import { categories, pickFeatured } from "../data/products";
import { useCatalog } from "../context/CatalogContext";
import { formatNaira } from "../lib/money";
import { useTitle } from "../lib/useTitle";

const aisleLabel = {
  staples: "Staples",
  drinks: "Drinks",
  bakery: "Bakery",
  household: "Household",
};

export function Home() {
  useTitle("");
  const { products, loading } = useCatalog();
  const featured = pickFeatured(products);
  const heroProduct = products.find((product) => product.name === "Agege Bread") || featured[0];

  return (
    <div className="wrap">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Yaba · order before 4pm</p>
          <h1>Groceries for the way Lagos cooks.</h1>
          <p className="lede">
            Garri, palm oil, Maggi, and Agege bread on the same run as Coke and Peak. Same-day across Lagos. Pay when the bag arrives.
          </p>
          <div className="hero-actions">
            <Link to="/shop" className="btn">
              Shop the shelf
            </Link>
            <Link to="/shop?category=staples" className="btn btn-line">
              Nigerian staples
            </Link>
          </div>
        </div>
        <div className="hero-stage">
          {loading || !heroProduct ? (
            <div className="hero-skeleton" />
          ) : (
            <Link to={`/product/${heroProduct.id}`} className="hero-feature">
              <ProductVisual product={heroProduct} />
              <span className="hero-caption">
                <span>{heroProduct.name}</span>
                <strong>{formatNaira(heroProduct.price)}</strong>
              </span>
            </Link>
          )}
        </div>
      </section>

      <section className="aisles" aria-label="Categories">
        {categories.map((category) => (
          <Link key={category.slug} to={`/shop?category=${category.slug}`} className={`aisle aisle-${category.slug}`}>
            <strong>{aisleLabel[category.slug]}</strong>
            <em>{category.blurb}</em>
          </Link>
        ))}
      </section>

      <section className="shelf">
        <div className="section-head">
          <div>
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
          <p>Add what the kitchen is short on. Sign in and the same basket is there on the next device.</p>
        </article>
        <article>
          <span>02</span>
          <h2>Sign in with Google</h2>
          <p>Browsing is open. Google is how the basket stays attached to you, and how the receipt finds you.</p>
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
