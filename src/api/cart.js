import { apiFetch } from "./client";

export function createCart() {
  return apiFetch(`/carts/`, { method: "POST", auth: false, body: {} });
}

export function getCart(cartId) {
  return apiFetch(`/carts/${cartId}/`, { auth: false });
}

export function addCartItem(cartId, productId, quantity) {
  return apiFetch(`/carts/${cartId}/cartitems/`, {
    method: "POST",
    auth: false,
    body: { product_id: productId, quantity },
  });
}

export function updateCartItem(cartId, itemId, quantity) {
  return apiFetch(`/carts/${cartId}/cartitems/${itemId}/`, {
    method: "PATCH",
    auth: false,
    body: { quantity },
  });
}

export function removeCartItem(cartId, itemId) {
  return apiFetch(`/carts/${cartId}/cartitems/${itemId}/`, {
    method: "DELETE",
    auth: false,
  });
}
