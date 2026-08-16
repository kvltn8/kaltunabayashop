import { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as cartApi from "../api/cart";

const CartContext = createContext(null);
const CART_ID_KEY = "abaya_cart_id";

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCart = useCallback(async (cartId) => {
    try {
      const data = await cartApi.getCart(cartId);
      setCart(data);
      return data;
    } catch {
      // stored cart id is stale (e.g. already checked out) — start fresh
      localStorage.removeItem(CART_ID_KEY);
      setCart(null);
      return null;
    }
  }, []);

  useEffect(() => {
    const existingId = localStorage.getItem(CART_ID_KEY);
    (async () => {
      if (existingId) await loadCart(existingId);
      setLoading(false);
    })();
  }, [loadCart]);

  const ensureCart = useCallback(async () => {
    if (cart) return cart;
    const existingId = localStorage.getItem(CART_ID_KEY);
    if (existingId) {
      const loaded = await loadCart(existingId);
      if (loaded) return loaded;
    }
    const created = await cartApi.createCart();
    localStorage.setItem(CART_ID_KEY, created.id);
    setCart(created);
    return created;
  }, [cart, loadCart]);

  const addItem = useCallback(
    async (productId, quantity = 1) => {
      setError(null);
      try {
        const active = await ensureCart();
        await cartApi.addCartItem(active.id, productId, quantity);
        await loadCart(active.id);
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [ensureCart, loadCart]
  );

  const updateItem = useCallback(
    async (itemId, quantity) => {
      if (!cart) return;
      setError(null);
      try {
        await cartApi.updateCartItem(cart.id, itemId, quantity);
        await loadCart(cart.id);
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [cart, loadCart]
  );

  const removeItem = useCallback(
    async (itemId) => {
      if (!cart) return;
      setError(null);
      try {
        await cartApi.removeCartItem(cart.id, itemId);
        await loadCart(cart.id);
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [cart, loadCart]
  );

  // Called after a successful order — the cart is consumed server-side,
  // so the frontend just forgets its local reference.
  const clearLocalCart = useCallback(() => {
    localStorage.removeItem(CART_ID_KEY);
    setCart(null);
  }, []);

  const items = cart?.items || [];
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * Number(item.product?.price || 0),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        items,
        itemCount,
        subtotal,
        loading,
        error,
        ensureCart,
        addItem,
        updateItem,
        removeItem,
        clearLocalCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
