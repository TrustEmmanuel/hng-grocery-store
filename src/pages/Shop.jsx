import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ProductCard } from "../components/ProductCard";
import { categories, categoryBySlug } from "../data/products";
import { useCatalog } from "../context/CatalogContext";
import { useTitle } from "../lib/useTitle";

export function Shop() {
  const [params, setParams] = useSearchParams();
  const { products, loading } = useCatalog();
  const slug = params.get("category") || "";
  const query = params.get("q") || "";
  const category = categoryBySlug(slug);

  useTitle(category?.name || (query ? `Search “${query}”` : "Shop"));

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return products.filter((product) => {
      const categoryOk = !category || product.category === category.name;
      const queryOk = !term || product.name.toLowerCase().includes(term);
      return categoryOk && queryOk;
    });
  }, [products, category, query]);

  function setCategory(next) {
    const updated = new URLSearchParams(params);
    if (next) updated.set("category", next);
    else updated.delete("category");
    setParams(updated);
  }

  function setQuery(value) {
    const updated = new URLSearchParams(params);
    if (value) updated.set("q", value);
    else updated.delete("q");
    setParams(updated, { replace: true });
  }

  return (
    <div className="wrap">
      <header className="section-head shop-head">
        <div>
          <p className="kicker">The shelf</p>
          <h1>{category?.name || "Everything in store"}</h1>
          {category && <p className="subhead">{category.blurb}</p>}
        </div>
        <p className="count">
            {loading ? "Loading" : visible.length === 1 ? "1 item" : `${visible.length} items`}
          </p>
      </header>

      <div className="toolbar">
        <div className="filters" role="tablist" aria-label="Filter by category">
          <button type="button" className={!slug ? "is-active" : ""} onClick={() => setCategory("")}>
            All
          </button>
          {categories.map((item) => (
            <button
              key={item.slug}
              type="button"
              className={slug === item.slug ? "is-active" : ""}
              onClick={() => setCategory(item.slug)}
            >
              {item.name}
            </button>
          ))}
        </div>
        <label className="shop-search">
          <span className="sr-only">Search by product name</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter by name"
          />
        </label>
      </div>

      {loading ? (
        <div className="product-grid">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="skeleton" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="empty">
          <h2>Nothing under that name.</h2>
          <p>Try garri, bread, or cola — or clear the filter.</p>
          <Link to="/shop" className="btn">
            Clear search
          </Link>
        </div>
      ) : (
        <div className="product-grid">
          {visible.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
