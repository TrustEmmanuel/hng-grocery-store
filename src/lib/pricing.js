// Keep these in sync with supabase/functions/_shared/pricing.ts.
export const DELIVERY_FEE = 1200;
export const FREE_DELIVERY_OVER = 15000;

export function subtotalOf(items) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function deliveryFee(subtotal) {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_DELIVERY_OVER ? 0 : DELIVERY_FEE;
}
