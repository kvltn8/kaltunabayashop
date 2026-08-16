import { useState } from "react";
import { pushStkPayment, normalizeKenyanPhone, isValidKenyanPhone } from "../api/payflow";
import "./PayForm.css";

// status: idle -> sending -> pushed -> error
// "pushed" means the STK prompt was sent to the phone — PayFlow doesn't
// expose a status-polling endpoint here, so we ask the shopper to confirm
// once they've approved it on their handset.
export default function PayForm({ amount, onConfirmed }) {
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  const pay = async (e) => {
    e.preventDefault();
    setError(null);

    if (!isValidKenyanPhone(phone)) {
      setError("Enter a valid Safaricom number, e.g. 0712345678.");
      return;
    }

    setStatus("sending");
    try {
      await pushStkPayment(normalizeKenyanPhone(phone));
      setStatus("pushed");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  };

  if (status === "pushed") {
    return (
      <div className="payform-pushed">
        <span className="eyebrow">STK prompt sent</span>
        <p>
          Check <strong>{normalizeKenyanPhone(phone)}</strong> and enter your M-Pesa PIN to
          finish paying{amount ? ` KSh ${Number(amount).toLocaleString()}` : ""}.
        </p>
        <div className="payform-pushed-actions">
          <button className="btn btn-gold btn-block" onClick={() => onConfirmed?.()}>
            I've completed payment
          </button>
          <button className="btn btn-outline btn-block" onClick={() => setStatus("idle")}>
            Send prompt again
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={pay} className="payform">
      {amount != null && (
        <div className="payform-amount">
          <span className="eyebrow">Amount due</span>
          <span className="payform-amount-value">KSh {Number(amount).toLocaleString()}</span>
        </div>
      )}

      <div className="field">
        <label htmlFor="mpesa-phone">M-Pesa number</label>
        <input
          id="mpesa-phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="07XXXXXXXX"
          inputMode="tel"
          required
        />
      </div>

      {error && <p className="form-error">{error}</p>}

      <button type="submit" className="btn btn-gold btn-block" disabled={status === "sending"}>
        {status === "sending" ? "Sending prompt…" : "Pay with M-Pesa"}
      </button>
      <p className="form-note">You'll get a prompt on your phone to enter your PIN.</p>
    </form>
  );
}
