// Keep in sync with src/lib/pricing.js.
export const DELIVERY_FEE = 1200;
export const FREE_DELIVERY_OVER = 15000;

export function deliveryFee(subtotal: number) {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_DELIVERY_OVER ? 0 : DELIVERY_FEE;
}
