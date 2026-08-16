import { apiFetch } from "./client";

// Sends the cart forward to become an order. Note: as of this build,
// OrdersViewSet doesn't yet call OrderService to convert a cart into
// order items server-side — see the frontend README for what the
// endpoint needs to accept for this to work end to end.
export function createOrder(cartId) {
  return apiFetch(`/orders/`, {
    method: "POST",
    auth: "required",
    body: { cart_id: cartId },
  });
}

export function getOrder(orderId) {
  return apiFetch(`/orders/${orderId}/`, { auth: "required" });
}
