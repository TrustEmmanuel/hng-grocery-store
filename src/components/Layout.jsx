import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { categories } from "../data/products";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { IconBag, IconClose, IconMenu, IconSearch } from "./Icons";
import { SignInDialog } from "./SignInDialog";

const shortLabel = {
  staples: "Staples",
  drinks: "Drinks",
  bakery: "Bakery",
  household: "Household",
};

const links = [
  { to: "/shop", label: "Shop", end: true },
  ...categories.map((category) => ({
    to: `/shop?category=${category.slug}`,
    label: shortLabel[category.slug],
    slug: category.slug,
  })),
];

function hoursLabel(date = new Date()) {
  return date.getDay() === 0 ? "Open today · 10:00–16:00" : "Open today · 08:00–20:00";
}

function Brand() {
  return (
    <Link to="/" className="brand">
      TajMart
    </Link>
  );
}

export function Layout({ children }) {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const { count } = useCart();
  const { user, openSignIn, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname, search]);

  function onSearch(event) {
    event.preventDefault();
    const term = query.trim();
    navigate(term ? `/shop?q=${encodeURIComponent(term)}` : "/shop");
    setMenuOpen(false);
  }

  const params = new URLSearchParams(search);
  const activeCategory = params.get("category");

  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <div className="topbar">
        <div className="announce">
          <div className="wrap announce-inner">
            <span>Same-day Lagos delivery on orders placed before 4pm</span>
            <span className="announce-hours">{hoursLabel()}</span>
          </div>
        </div>
        <header className="header">
          <div className="wrap header-inner">
            <Brand />
            <nav className="nav" aria-label="Primary">
              {links.map((link) => {
                const onShop = pathname === "/shop";
                const active = link.slug ? onShop && activeCategory === link.slug : onShop && !activeCategory;
                return (
                  <Link key={link.to} to={link.to} className={active ? "is-active" : undefined} aria-current={active ? "page" : undefined}>
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            <div className="tools">
              <form className="search desktop-search" onSubmit={onSearch} role="search">
                <IconSearch />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search the shelf"
                  aria-label="Search products"
                />
              </form>
              {user ? (
                <button type="button" className="account" onClick={signOut} title="Sign out">
                  {user.picture ? <img src={user.picture} alt="" /> : <span>{user.name.slice(0, 1)}</span>}
                  <em>{user.name.split(" ")[0]}</em>
                </button>
              ) : (
                <button type="button" className="text-btn account-btn" onClick={openSignIn}>
                  Sign in
                </button>
              )}
              <Link to="/cart" className="cart-link" aria-label={`Basket, ${count} items`}>
                <IconBag />
                <span>Basket</span>
                {count > 0 && <i>{count}</i>}
              </Link>
              <button
                type="button"
                className="icon-btn menu-btn"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((open) => !open)}
              >
                {menuOpen ? <IconClose /> : <IconMenu />}
              </button>
            </div>
          </div>
          {menuOpen && (
            <div className="mobile-panel wrap">
              <form className="search" onSubmit={onSearch} role="search">
                <IconSearch />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search the shelf"
                  aria-label="Search products"
                />
              </form>
              <div className="mobile-links">
                {links.map((link) => (
                  <Link key={link.to} to={link.to}>
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </header>
      </div>
      <main id="main" className="page">
        {children}
      </main>
      <footer className="footer">
        <div className="wrap footer-grid">
          <div>
            <Brand />
            <p>A neighborhood grocery for Nigerian kitchens. Local brands on the same run as the bottles and bread.</p>
          </div>
          <div>
            <p className="kicker">Visit</p>
            <p>14 Market Lane, Yaba</p>
            <p>Lagos</p>
            <p>Mon–Sat 8:00–20:00</p>
            <p>Sun 10:00–16:00</p>
          </div>
          <div>
            <p className="kicker">Orders</p>
            <Link to="/shop">Shop the shelf</Link>
            <Link to="/cart">Basket</Link>
            <p>hello@tajmart.ng</p>
            <p>Pay by transfer or cash on delivery.</p>
          </div>
        </div>
        <div className="wrap foot-bottom">
          <span>© {new Date().getFullYear()} TajMart</span>
          <span>Prices in Nigerian naira</span>
          <span>Product photos via Open Food Facts, Wikimedia Commons, Unsplash, and Flickr under their free licenses.</span>
        </div>
      </footer>
      <SignInDialog />
    </>
  );
}
