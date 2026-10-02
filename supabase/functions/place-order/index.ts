import { escapeHtml, json, optionsResponse } from "../_shared/http.ts";
import { adminClient, upsertUser, verifyGoogleIdToken } from "../_shared/google.ts";
import { deliveryFee } from "../_shared/pricing.ts";

type IncomingItem = { id?: string; quantity?: number };

function normalizePhone(input: string) {
  const compact = String(input || "").replace(/[\s-]/g, "");
  if (!/^(\+234|0)[789]\d{9}$/.test(compact)) {
    throw new Error("Enter a valid Nigerian phone number");
  }
  return compact;
}

function naira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

async function sendOrderEmail(options: {
  to: string;
  name: string;
  orderId: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  delivery: number;
  address: string;
  phone: string;
}) {
  const apiKey = Deno.env.get("MAILGUN_API_KEY");
  const domain = Deno.env.get("MAILGUN_DOMAIN");
  if (!apiKey || !domain) {
    throw new Error("Mailgun is not configured");
  }

  const from = Deno.env.get("MAILGUN_FROM") || `TajMart <orders@${domain}>`;
  const base = (Deno.env.get("MAILGUN_API_BASE") || "https://api.mailgun.net").replace(/\/$/, "");
  const shortId = options.orderId.slice(0, 8).toUpperCase();
  const subtotal = options.total - options.delivery;

  const rows = options.items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #E4DACC;">${escapeHtml(item.name)} × ${item.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #E4DACC;text-align:right;">${escapeHtml(naira(item.price * item.quantity))}</td>
        </tr>`,
    )
    .join("");

  const html = `
    <div style="font-family:Georgia,serif;background:#F3EEE6;padding:24px;">
      <div style="max-width:520px;margin:0 auto;background:#FFFCF7;border:1px solid #E4DACC;border-radius:12px;padding:24px;color:#1C1915;">
        <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#A68445;">TajMart</p>
        <h1 style="font-size:22px;font-weight:500;margin:8px 0 8px;">Thank you, ${escapeHtml(options.name.split(" ")[0])}.</h1>
        <p style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5;color:#3A352F;">
          Your neighborhood grocery is packing order ${escapeHtml(shortId)}. We’ll bring it to the address below. Have transfer or cash ready when the bag arrives.
        </p>
        <table style="width:100%;border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px;margin-top:16px;">${rows}</table>
        <p style="font-family:Arial,sans-serif;font-size:14px;margin:12px 0 0;">Subtotal ${escapeHtml(naira(subtotal))}<br/>Delivery ${options.delivery === 0 ? "Free" : escapeHtml(naira(options.delivery))}<br/><strong>Total ${escapeHtml(naira(options.total))}</strong></p>
        <p style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5;white-space:pre-line;"><strong>Deliver to</strong><br/>${escapeHtml(options.address)}<br/>${escapeHtml(options.phone)}</p>
        <p style="font-family:Arial,sans-serif;font-size:13px;color:#6F675E;">Thank you for shopping at TajMart.</p>
      </div>
    </div>`;

  const text = [
    `Thank you, ${options.name}.`,
    `TajMart order ${shortId} is confirmed.`,
    ``,
    ...options.items.map((item) => `${item.name} × ${item.quantity} — ${naira(item.price * item.quantity)}`),
    ``,
    `Subtotal ${naira(subtotal)}`,
    `Delivery ${options.delivery === 0 ? "Free" : naira(options.delivery)}`,
    `Total ${naira(options.total)}`,
    ``,
    `Deliver to:`,
    options.address,
    options.phone,
    ``,
    `Thank you for shopping at TajMart.`,
  ].join("\n");

  const form = new FormData();
  form.append("from", from);
  form.append("to", options.to);
  form.append("subject", `TajMart order ${shortId}`);
  form.append("html", html);
  form.append("text", text);

  const response = await fetch(`${base}/v3/${domain}/messages`, {
    method: "POST",
    headers: { Authorization: `Basic ${btoa(`api:${apiKey}`)}` },
    body: form,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail.slice(0, 180) || "Mailgun rejected the email");
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return optionsResponse();
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json();
    const credential = String(body.credential || "");
    const address = String(body.delivery_address || "").trim();
    const phone = normalizePhone(body.phone);
    const incoming = (Array.isArray(body.items) ? body.items : []) as IncomingItem[];

    if (address.length < 8 || address.length > 500) {
      throw new Error("Add a complete delivery address");
    }
    if (incoming.length === 0 || incoming.length > 30) {
      throw new Error("The basket is empty");
    }

    const profile = await verifyGoogleIdToken(credential);
    const admin = adminClient();
    const user = await upsertUser(admin, profile);

    const ids = [...new Set(incoming.map((item) => item.id).filter(Boolean))] as string[];
    const { data: products, error: productError } = await admin
      .from("products")
      .select("id, name, price, stock_quantity")
      .in("id", ids);

    if (productError) throw new Error(productError.message);

    const lines = incoming.map((item) => {
      const product = products?.find((row) => row.id === item.id);
      const quantity = Math.floor(Number(item.quantity));
      if (!product) throw new Error("One of those products is no longer on the shelf");
      if (!Number.isFinite(quantity) || quantity < 1 || quantity > 12) {
        throw new Error(`Check the quantity for ${product.name}`);
      }
      if (product.stock_quantity < quantity) {
        throw new Error(`${product.name} doesn’t have enough stock`);
      }
      return {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        stock_quantity: product.stock_quantity,
      };
    });

    const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
    const delivery = deliveryFee(subtotal);
    const total = subtotal + delivery;

    const { data: order, error: orderError } = await admin
      .from("orders")
      .insert({
        user_id: user.id,
        items: lines.map(({ id, name, price, quantity }) => ({ id, name, price, quantity })),
        total,
        delivery_address: address,
        phone,
        status: "confirmed",
      })
      .select("id, user_id, items, total, delivery_address, phone, status, created_at")
      .single();

    if (orderError) throw new Error(orderError.message);

    for (const line of lines) {
      await admin
        .from("products")
        .update({ stock_quantity: line.stock_quantity - line.quantity })
        .eq("id", line.id);
    }

    let emailSent = false;
    let emailError: string | null = null;
    try {
      await sendOrderEmail({
        to: user.email,
        name: user.name,
        orderId: order.id,
        items: lines,
        total,
        delivery,
        address,
        phone,
      });
      emailSent = true;
    } catch (error) {
      emailError = error instanceof Error ? error.message : "Email failed";
    }

    return json({ order, emailSent, emailError });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not place the order";
    return json({ error: message }, 400);
  }
});
