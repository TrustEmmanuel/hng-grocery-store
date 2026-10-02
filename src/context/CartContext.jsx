import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { subtotalOf } from "../lib/pricing";

const STORAGE_KEY = "tajmart.cart";
const CartContext = createContext(null);

function readCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item?.id && item.quantity > 0);
  } catch {
    return [];
  }
}

function maxFor(product) {
  const stock = Number(product.stock_quantity);
  const cap = Number.isFinite(stock) ? stock : 12;
  return Math.max(0, Math.min(12, cap));
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const api = useMemo(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);

    function addItem(product, quantity = 1) {
      const limit = maxFor(product);
      if (limit <= 0) return false;
      const existing = items.find((item) => item.id === product.id);
      if ((existing?.quantity || 0) + quantity > limit) return false;
      setItems((current) => {
        const found = current.find((item) => item.id === product.id);
        const nextQty = Math.min(limit, (found?.quantity || 0) + quantity);
        if ((found?.quantity || 0) >= limit) return current;
        const line = {
          id: product.id,
          name: product.name,
          price: Number(product.price),
          category: product.category,
          image_url: product.image_url,
          stock_quantity: limit,
          quantity: nextQty,
        };
        if (!found) return [...current, line];
        return current.map((item) => (item.id === product.id ? line : item));
      });
      return true;
    }

    function setQty(id, quantity) {
      setItems((current) =>
        current.flatMap((item) => {
          if (item.id !== id) return [item];
          const limit = item.stock_quantity || 12;
          const next = Math.max(0, Math.min(limit, quantity));
          if (next === 0) return [];
          return [{ ...item, quantity: next }];
        }),
      );
    }

    function remove(id) {
      setItems((current) => current.filter((item) => item.id !== id));
    }

    function clear() {
      setItems([]);
    }

    return {
      items,
      count,
      subtotal: subtotalOf(items),
      addItem,
      setQty,
      remove,
      clear,
    };
  }, [items]);

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
