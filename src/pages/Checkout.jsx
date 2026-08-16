import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { getMyProfile, updateProfile } from "../api/customers";
import { createOrder } from "../api/orders";
import PayForm from "../components/PayForm";
import "./Checkout.css";

const STEPS = { DETAILS: "details", PAY: "pay", DONE: "done" };

export default function Checkout() {
  const { user } = useAuth();
  const { cart, items, subtotal, clearLocalCart } = useCart();
  const navigate = useNavigate();

  const [step, setStep] = useState(STEPS.DETAILS);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ phone_number: "", delivery_address: "", city: "", country: "Kenya" });
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [order, setOrder] = useState(null);
  // Captured before the order is placed, since a cart-consuming order
  // endpoint would otherwise leave nothing to compute a total from.
  const [amountDue, setAmountDue] = useState(0);

  useEffect(() => {
    if (!user) return;
    getMyProfile(user.id).then((p) => {
      if (!p) return;
      setProfile(p);
      setForm({
        phone_number: p.phone_number || "",
        delivery_address: p.delivery_address || "",
        city: p.city || "",
        country: p.country || "Kenya",
      });
    });
  }, [user]);

  if (items.length === 0 && step === STEPS.DETAILS) {
    return <Navigate to="/cart" replace />;
  }

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const placeOrder = async (e) => {
    e.preventDefault();
    setPlacingOrder(true);
    setOrderError(null);
    try {
      if (profile) {
        await updateProfile(profile.id, form);
      }
      setAmountDue(subtotal);
      const created = await createOrder(cart.id);
      setOrder(created);
      setStep(STEPS.PAY);
    } catch (err) {
      setOrderError(err.message);
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleConfirmedPayment = () => {
    clearLocalCart();
    setStep(STEPS.DONE);
  };

  return (
    <div className="container checkout-page">
      <h1>Checkout</h1>

      <ol className="checkout-steps">
        <li className={step !== STEPS.DETAILS ? "done" : "active"}>Delivery</li>
        <li className={step === STEPS.PAY ? "active" : step === STEPS.DONE ? "done" : ""}>Payment</li>
        <li className={step === STEPS.DONE ? "active" : ""}>Confirmed</li>
      </ol>

      {step === STEPS.DETAILS && (
        <div className="checkout-layout">
          <form className="checkout-form" onSubmit={placeOrder}>
            <h2>Delivery details</h2>
            <div className="field">
              <label htmlFor="phone_number">Phone number</label>
              <input
                id="phone_number"
                value={form.phone_number}
                onChange={update("phone_number")}
                placeholder="0712345678"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="delivery_address">Delivery address</label>
              <textarea
                id="delivery_address"
                rows={2}
                value={form.delivery_address}
                onChange={update("delivery_address")}
                placeholder="Street, building, apartment"
                required
              />
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="city">City</label>
                <input id="city" value={form.city} onChange={update("city")} required />
              </div>
              <div className="field">
                <label htmlFor="country">Country</label>
                <input id="country" value={form.country} onChange={update("country")} required />
              </div>
            </div>
            {orderError && <p className="form-error">{orderError}</p>}
            <button className="btn btn-gold btn-block" disabled={placingOrder}>
              {placingOrder ? "Placing order…" : "Continue to payment"}
            </button>
          </form>

          <OrderSummary items={items} subtotal={subtotal} />
        </div>
      )}

      {step === STEPS.PAY && (
        <div className="checkout-layout">
          <PayForm amount={order?.items?.length ? order.total : amountDue} onConfirmed={handleConfirmedPayment} />
          <OrderSummary items={items} subtotal={subtotal} />
        </div>
      )}

      {step === STEPS.DONE && (
        <div className="checkout-done">
          <span className="eyebrow">Order placed</span>
          <h2>Thank you{user?.first_name ? `, ${user.first_name}` : ""}.</h2>
          <p>
            We've sent your M-Pesa prompt and logged your order
            {order?.id ? (
              <>
                {" "}
                as <span className="price">#{order.id}</span>
              </>
            ) : null}
            . We'll be in touch to confirm delivery.
          </p>
          <button className="btn btn-outline" onClick={() => navigate("/")}>
            Back to catalog
          </button>
        </div>
      )}
    </div>
  );
}

function OrderSummary({ items, subtotal }) {
  return (
    <aside className="checkout-summary">
      <h2>Order summary</h2>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <span>
              {item.product?.name} <span className="form-note">× {item.quantity}</span>
            </span>
            <span className="price">
              KSh {(item.quantity * Number(item.product?.price || 0)).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
      <div className="checkout-summary-total">
        <span>Total</span>
        <span className="price">KSh {subtotal.toLocaleString()}</span>
      </div>
    </aside>
  );
}
