import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { resolveImageUrl } from "../api/products";
import "./Cart.css";

export default function Cart() {
  const { items, subtotal, loading, error, updateItem, removeItem } = useCart();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="container cart-page">
        <div className="skeleton" style={{ height: 200 }} />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container cart-empty">
        <h1>Your bag is empty</h1>
        <p>Pieces you add will sit here until you're ready to check out.</p>
        <Link to="/" className="btn btn-gold">
          Browse the catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="container cart-page">
      <h1>Your Bag</h1>
      {error && <p className="form-error">{error}</p>}

      <div className="cart-layout">
        <ul className="cart-list">
          {items.map((item) => {
            const cover = item.product?.images?.[0]?.image;
            return (
              <li key={item.id} className="cart-item">
                <div className="cart-item-thumb">
                  {cover ? (
                    <img src={resolveImageUrl(cover)} alt="" />
                  ) : (
                    <span className="cart-item-thumb-empty" aria-hidden="true" />
                  )}
                </div>

                <div className="cart-item-body">
                  <h3>{item.product?.name}</h3>
                  <span className="price">KSh {Number(item.product?.price || 0).toLocaleString()}</span>
                  <div className="cart-item-controls">
                    <div className="qty-stepper">
                      <button onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))}>
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateItem(item.id, item.quantity + 1)}>+</button>
                    </div>
                    <button className="cart-item-remove" onClick={() => removeItem(item.id)}>
                      Remove
                    </button>
                  </div>
                </div>
                <div className="cart-item-total price">
                  KSh {(item.quantity * Number(item.product?.price || 0)).toLocaleString()}
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="cart-summary">
          <h2>Summary</h2>
          <div className="cart-summary-row">
            <span>Subtotal</span>
            <span className="price">KSh {subtotal.toLocaleString()}</span>
          </div>
          <p className="form-note">Delivery is arranged after checkout.</p>
          <button className="btn btn-gold btn-block" onClick={() => navigate("/checkout")}>
            Proceed to checkout
          </button>
        </aside>
      </div>
    </div>
  );
}
