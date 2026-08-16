import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProduct, resolveImageUrl, listReviews, createReview } from "../api/products";
import { useCart } from "../context/CartContext";
import "./ProductDetail.css";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ name: "", comment: "" });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getProduct(id)
      .then((data) => {
        setProduct(data);
        setActiveImage(0);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    listReviews(id).then(setReviews).catch(() => setReviews([]));
  }, [id]);

  const handleAdd = async () => {
    setAdding(true);
    setAdded(false);
    try {
      await addItem(product.id, qty);
      setAdded(true);
    } catch {
      // surfaced via cart context error banner
    } finally {
      setAdding(false);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setReviewSubmitting(true);
    setReviewError(null);
    try {
      const created = await createReview(id, reviewForm);
      setReviews((prev) => [created, ...prev]);
      setReviewForm({ name: "", comment: "" });
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container product-detail">
        <div className="skeleton" style={{ aspectRatio: "3/4", maxWidth: 520 }} />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container product-detail-empty">
        <p>{error || "This piece couldn't be found."}</p>
        <button className="btn btn-outline" onClick={() => navigate("/")}>
          Back to catalog
        </button>
      </div>
    );
  }

  const images = product.images || [];
  const outOfStock = product.stock_quantity <= 0;

  return (
    <div className="container product-detail">
      <div className="product-detail-grid">
        <div className="product-gallery">
          <div className="product-gallery-main">
            {images.length > 0 ? (
              <img src={resolveImageUrl(images[activeImage]?.image)} alt={product.name} />
            ) : (
              <div className="product-card-placeholder">No image yet</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="product-gallery-thumbs">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  className={i === activeImage ? "active" : ""}
                  onClick={() => setActiveImage(i)}
                  aria-label={`View image ${i + 1}`}
                >
                  <img src={resolveImageUrl(img.image)} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="product-info">
          <span className="eyebrow">Kaltun's Abaya Shop</span>
          <h1>{product.name}</h1>
          <span className="price product-price">KSh {Number(product.price).toLocaleString()}</span>

          <p className="product-description">{product.descprition}</p>

          <div className="product-stock">
            {outOfStock ? (
              <span className="badge badge-rosewood">Sold out</span>
            ) : product.stock_quantity <= 5 ? (
              <span className="badge badge-gold">Only {product.stock_quantity} left</span>
            ) : (
              <span className="badge badge-green">In stock</span>
            )}
          </div>

          <div className="product-add">
            <div className="qty-stepper">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={outOfStock}>
                −
              </button>
              <span>{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(product.stock_quantity, q + 1))}
                disabled={outOfStock}
              >
                +
              </button>
            </div>
            <button
              className="btn btn-gold btn-block"
              onClick={handleAdd}
              disabled={outOfStock || adding}
            >
              {outOfStock ? "Sold out" : adding ? "Adding…" : added ? "Added ✓" : "Add to bag"}
            </button>
          </div>
        </div>
      </div>

      <hr className="hairline" />

      <section className="product-reviews">
        <h2>Notes from customers</h2>

        {reviews.length === 0 ? (
          <p className="form-note">No notes yet — be the first to share how it fit.</p>
        ) : (
          <ul className="review-list">
            {reviews.map((r) => (
              <li key={r.id}>
                <strong>{r.name}</strong>
                <p>{r.comment}</p>
              </li>
            ))}
          </ul>
        )}

        <form className="review-form" onSubmit={submitReview}>
          <h3>Leave a note</h3>
          <div className="field">
            <label htmlFor="review-name">Name</label>
            <input
              id="review-name"
              value={reviewForm.name}
              onChange={(e) => setReviewForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="review-comment">Note</label>
            <textarea
              id="review-comment"
              rows={3}
              value={reviewForm.comment}
              onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
              required
            />
          </div>
          {reviewError && <p className="form-error">{reviewError}</p>}
          <button className="btn btn-outline" disabled={reviewSubmitting}>
            {reviewSubmitting ? "Posting…" : "Post note"}
          </button>
        </form>
      </section>
    </div>
  );
}
