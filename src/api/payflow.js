// PayFlow ("Don't code. Just paste.") STK push integration.
// This publicId is a fixed PayFlow payment link/profile — PayFlow owns the
// amount configuration on their side, the storefront only collects the
// paying phone number and triggers the push.
const PAYFLOW_BASE = "https://payflow-d9ic.onrender.com/api/v1";
const PAYFLOW_PUBLIC_ID = "663949ec-6231-446d-af65-af64f0ba74ba";

export async function pushStkPayment(phoneNumber) {
  const res = await fetch(`${PAYFLOW_BASE}/pay/${PAYFLOW_PUBLIC_ID}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone_number: phoneNumber }),
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // PayFlow may return an empty body on some error paths
  }

  if (!res.ok) {
    const message = data?.detail || data?.message || "Couldn't reach M-Pesa. Please try again.";
    throw new Error(message);
  }
  return data;
}

// Normalizes a Kenyan phone number to the 07XXXXXXXX / 01XXXXXXXX shape
// PayFlow expects, accepting +254, 254, or local input.
export function normalizeKenyanPhone(raw) {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("254") && digits.length === 12) return `0${digits.slice(3)}`;
  if (digits.startsWith("0") && digits.length === 10) return digits;
  return digits;
}

export function isValidKenyanPhone(raw) {
  const normalized = normalizeKenyanPhone(raw);
  return /^0(7|1)\d{8}$/.test(normalized);
}
