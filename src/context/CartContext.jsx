import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { cartAction } from "../lib/api";
import { subtotalOf } from "../lib/pricing";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);
const LEGACY_KEY = "tajmart.cart";

function productIdOf(productOrId) {
  if (productOrId && typeof productOrId === "object") return productOrId.id;
  return productOrId;
}

function lineLimit(stock) {
  const value = Number(stock);
  if (!Number.isFinite(value)) return 12;
  return Math.max(0, Math.min(12, value));
}

function normalize(items) {
  if (!Array.isArray(items)) return [];
  return items
    .filter((item) => item?.id && item.quantity > 0)
    .map((item) => ({
      id: item.id,
      name: item.name,
      price: Number(item.price),
      category: item.category,
      image_url: item.image_url,
      stock_quantity: lineLimit(item.stock_quantity),
      quantity: Number(item.quantity),
    }));
}

function isLimitError(error) {
  return /as many|out of stock|quantity/i.test(error?.message || "");
}

export function CartProvider({ children }) {
  const { user, openSignIn } = useAuth();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(Boolean(user?.credential));
  const [error, setError] = useState("");
  const itemsRef = useRef([]);
  const generation = useRef(0);
  const chain = useRef(Promise.resolve());
  const inflight = useRef(0);
  const credential = user?.credential || "";

  function commit(next) {
    itemsRef.current = next;
    setItems(next);
  }

  useEffect(() => {
    localStorage.removeItem(LEGACY_KEY);
  }, []);

  useEffect(() => {
    const gen = ++generation.current;
    chain.current = Promise.resolve();
    inflight.current = 0;

    if (!credential) {
      commit([]);
      setIsLoading(false);
      setError("");
      return;
    }

    setIsLoading(true);
    setError("");
    const run = cartAction({ credential, action: "get" })
      .then((cart) => {
        if (gen !== generation.current) return;
        commit(normalize(cart.items));
      })
      .catch((err) => {
        if (gen !== generation.current) return;
        commit([]);
        setError(err.message || "Could not load the basket.");
      })
      .finally(() => {
        if (gen === generation.current) setIsLoading(false);
      });

    chain.current = run.then(
      () => undefined,
      () => undefined,
    );
  }, [credential]);

  const credentialRef = useRef(credential);
  credentialRef.current = credential;

  const refresh = useCallback(() => {
    const current = credentialRef.current;
    if (!current || inflight.current > 0) return undefined;
    const gen = generation.current;
    return cartAction({ credential: current, action: "get" })
      .then((cart) => {
        if (gen !== generation.current || inflight.current > 0) return;
        commit(normalize(cart.items));
        setError("");
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!credential) return undefined;
    function refreshIfVisible() {
      if (document.visibilityState !== "visible") return;
      refresh();
    }
    document.addEventListener("visibilitychange", refreshIfVisible);
    window.addEventListener("focus", refreshIfVisible);
    const timer = setInterval(refreshIfVisible, 10000);
    return () => {
      document.removeEventListener("visibilitychange", refreshIfVisible);
      window.removeEventListener("focus", refreshIfVisible);
      clearInterval(timer);
    };
  }, [credential, refresh]);

  const api = useMemo(() => {
    function enqueue(task) {
      const run = chain.current.then(task, task);
      chain.current = run.then(
        () => undefined,
        () => undefined,
      );
      return run;
    }

    async function run(action, fields, optimistic) {
      if (!credential) {
        openSignIn();
        return null;
      }

      const gen = generation.current;
      const snapshot = itemsRef.current;
      if (optimistic) commit(optimistic(snapshot));
      inflight.current += 1;

      try {
        const cart = await enqueue(() => cartAction({ credential, action, ...fields }));
        inflight.current -= 1;
        if (gen !== generation.current) return cart;
        if (inflight.current === 0) commit(normalize(cart.items));
        setError("");
        return cart;
      } catch (err) {
        inflight.current -= 1;
        if (gen !== generation.current) return null;
        setError(err.message || "Could not update the basket.");
        if (inflight.current === 0) {
          try {
            const cart = await enqueue(() => cartAction({ credential, action: "get" }));
            if (gen === generation.current && inflight.current === 0) commit(normalize(cart.items));
          } catch {
            if (gen === generation.current && inflight.current === 0) commit(snapshot);
          }
        }
        return isLimitError(err) ? false : null;
      }
    }

    async function addItem(productOrId, quantity = 1) {
      if (!credential) {
        openSignIn();
        return "auth";
      }

      const productId = productIdOf(productOrId);
      const adding = Math.floor(Number(quantity));
      if (!productId || !Number.isFinite(adding) || adding < 1) return false;

      const product = productOrId && typeof productOrId === "object" ? productOrId : null;
      const existing = itemsRef.current.find((item) => item.id === productId);
      const limit = lineLimit(product?.stock_quantity ?? existing?.stock_quantity ?? 12);
      if (limit <= 0 || (existing?.quantity || 0) >= limit) return false;

      const result = await run(
        "add",
        { product_id: productId, quantity: adding },
        (current) => {
          const found = current.find((item) => item.id === productId);
          const nextQty = Math.min(limit, (found?.quantity || 0) + adding);
          const line = {
            id: productId,
            name: product?.name || found?.name,
            price: Number(product?.price ?? found?.price),
            category: product?.category || found?.category,
            image_url: product?.image_url ?? found?.image_url,
            stock_quantity: limit,
            quantity: nextQty,
          };
          if (!found) return [...current, line];
          return current.map((item) => (item.id === productId ? line : item));
        },
      );

      if (result === false || result === null) return result;
      return true;
    }

    function setQty(productId, quantity) {
      const next = Math.floor(Number(quantity));
      return run("set_quantity", { product_id: productId, quantity: next }, (current) =>
        current.flatMap((item) => {
          if (item.id !== productId) return [item];
          const capped = Math.max(0, Math.min(item.stock_quantity || 12, next));
          if (capped <= 0) return [];
          return [{ ...item, quantity: capped }];
        }),
      );
    }

    function removeItem(productId) {
      return run("remove", { product_id: productId }, (current) =>
        current.filter((item) => item.id !== productId),
      );
    }

    function clearCart() {
      return run("clear", {}, () => []);
    }

    return {
      items,
      cartItems: items,
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: subtotalOf(items),
      isLoading,
      error,
      addItem,
      setQty,
      remove: removeItem,
      removeItem,
      clear: clearCart,
      clearCart,
    };
  }, [items, isLoading, error, credential, openSignIn]);

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
