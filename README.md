# TajMart

Neighborhood Nigerian grocery store. Shop the shelf, keep a basket on this device, sign in with Google, and place a delivery order. Prices are in naira.

The site runs without keys, using the sample shelf in `src/data/products.js`. Live products, saved users, saved orders, and receipt emails need the services below.

## Run it

```bash
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173.

## Where each integration lives

| Piece | Files |
| --- | --- |
| Supabase browser client (public read of products) | `src/lib/supabase.js`, `src/context/CatalogContext.jsx` |
| Google sign-in | `src/lib/google.js`, `src/context/AuthContext.jsx`, `src/components/SignInDialog.jsx` |
| Saving the Google user | `supabase/functions/google-signin/index.ts` |
| Saving the order and sending Mailgun email | `supabase/functions/place-order/index.ts` |
| Table definitions | `supabase/schema.sql` |
| Basket on this device | `src/context/CartContext.jsx` |

The Mailgun API key is read with `Deno.env.get` inside `place-order`. It is not a `VITE_` variable, so Vite never puts it in the browser bundle.

## 1. Supabase

1. Create a project.
2. Paste `supabase/schema.sql` into the SQL editor and run it.
3. Copy the project URL and anon key into `.env` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

Row Level Security lets anonymous visitors read `products` only. There is no insert policy on `users` or `orders`, so the browser cannot write those tables. The Edge Functions use the service role, which bypasses RLS.

## 2. Google sign-in

1. In Google Cloud Console, create an OAuth client ID of type **Web application**.
2. Add `http://localhost:5173` and `http://127.0.0.1:5173` (and your production URL) under **Authorized JavaScript origins**. The origin must match the address in the browser exactly.
3. Put the client ID in `.env` as `VITE_GOOGLE_CLIENT_ID`. This value is public by design.
4. Set the same client ID as a function secret (next section) so the server can check the token audience.

The button uses Google Identity Services. The browser receives an ID token. `google-signin` checks it with Google’s `tokeninfo` endpoint, then upserts `users` (`google_id`, `name`, `email`). Checkout sends that same token to `place-order`, which checks it again before writing the order. Prices are taken from the database, not from the browser.

## 3. Mailgun

From the project folder, with the [Supabase CLI](https://supabase.com/docs/guides/cli) logged in:

```bash
supabase secrets set GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
supabase secrets set MAILGUN_API_KEY=key-xxxxxxxx
supabase secrets set MAILGUN_DOMAIN=mg.yourdomain.com
supabase secrets set MAILGUN_FROM="TajMart <orders@mg.yourdomain.com>"
supabase functions deploy google-signin
supabase functions deploy place-order
```

EU Mailgun accounts also need:

```bash
supabase secrets set MAILGUN_API_BASE=https://api.eu.mailgun.net
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are already available inside Edge Functions. Do not copy the service role into `.env`.

After a successful insert, `place-order` emails the signed-in address with the items, total, delivery address, and a short thank-you. If Mailgun fails, the order still stays saved and the confirmation page says the email did not send.

## Checkout rules

Delivery is ₦1,200 across Lagos, and free from ₦15,000. The same numbers live in `src/lib/pricing.js` and `supabase/functions/_shared/pricing.ts`. Payment is transfer or cash on delivery — the site does not collect cards.
