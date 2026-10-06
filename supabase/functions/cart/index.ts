import { json, optionsResponse } from "../_shared/http.ts";
import { adminClient, upsertUser, verifyGoogleIdToken } from "../_shared/google.ts";
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const MAX_LINE = 12;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type ProductRow = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  stock_quantity: number;
  category: string;
};

type CartRow = {
  quantity: number;
  products: ProductRow | ProductRow[] | null;
};

function lineLimit(stock: number) {
  return Math.max(0, Math.min(MAX_LINE, Number(stock) || 0));
}

function productIdOf(body: { product_id?: string }) {
  const id = String(body.product_id || "");
  if (!UUID.test(id)) throw new Error("That product is not on the shelf");
  return id;
}

async function loadProduct(admin: SupabaseClient, productId: string) {
  const { data, error } = await admin
    .from("products")
    .select("id, name, price, image_url, stock_quantity, category")
    .eq("id", productId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("That product is no longer on the shelf");
  return data as ProductRow;
}

async function readCart(admin: SupabaseClient, userId: string) {
  const { data, error } = await admin
    .from("cart_items")
    .select("quantity, products(id, name, price, image_url, stock_quantity, category)")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  const items = ((data || []) as CartRow[]).flatMap((row) => {
    const product = Array.isArray(row.products) ? row.products[0] : row.products;
    if (!product) return [];
    return [
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        stock_quantity: product.stock_quantity,
        category: product.category,
        quantity: row.quantity,
      },
    ];
  });

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { items, subtotal };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return optionsResponse();
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json();
    const action = String(body.action || "");
    const profile = await verifyGoogleIdToken(String(body.credential || ""));
    const admin = adminClient();
    const user = await upsertUser(admin, profile);

    if (action === "get") {
      return json(await readCart(admin, user.id));
    }

    if (action === "add") {
      const productId = productIdOf(body);
      const adding = Math.floor(Number(body.quantity ?? 1));
      if (!Number.isFinite(adding) || adding < 1) throw new Error("Check the quantity");

      const product = await loadProduct(admin, productId);
      const limit = lineLimit(product.stock_quantity);
      if (limit <= 0) throw new Error(`${product.name} is out of stock`);

      const { data: existing, error: existingError } = await admin
        .from("cart_items")
        .select("quantity")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .maybeSingle();

      if (existingError) throw new Error(existingError.message);

      const current = existing?.quantity || 0;
      if (current >= limit) throw new Error(`That’s as many ${product.name} as we can pack`);

      const quantity = Math.min(limit, current + adding);
      const { error } = await admin.from("cart_items").upsert(
        { user_id: user.id, product_id: productId, quantity },
        { onConflict: "user_id,product_id" },
      );
      if (error) throw new Error(error.message);

      return json(await readCart(admin, user.id));
    }

    if (action === "set_quantity") {
      const productId = productIdOf(body);
      const requested = Math.floor(Number(body.quantity));
      if (!Number.isFinite(requested)) throw new Error("Check the quantity");

      if (requested <= 0) {
        const { error } = await admin
          .from("cart_items")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", productId);
        if (error) throw new Error(error.message);
        return json(await readCart(admin, user.id));
      }

      const product = await loadProduct(admin, productId);
      const limit = lineLimit(product.stock_quantity);
      if (limit <= 0) throw new Error(`${product.name} is out of stock`);

      const quantity = Math.min(limit, requested);
      const { error } = await admin.from("cart_items").upsert(
        { user_id: user.id, product_id: productId, quantity },
        { onConflict: "user_id,product_id" },
      );
      if (error) throw new Error(error.message);

      return json(await readCart(admin, user.id));
    }

    if (action === "remove") {
      const productId = productIdOf(body);
      const { error } = await admin
        .from("cart_items")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);
      if (error) throw new Error(error.message);
      return json(await readCart(admin, user.id));
    }

    if (action === "clear") {
      const { error } = await admin.from("cart_items").delete().eq("user_id", user.id);
      if (error) throw new Error(error.message);
      return json(await readCart(admin, user.id));
    }

    throw new Error("Unknown cart action");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update the basket";
    return json({ error: message }, 400);
  }
});
