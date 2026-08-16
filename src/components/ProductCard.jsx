import { Link } from "react-router-dom";
import { resolveImageUrl } from "../api/products";
import { useCart } from "../context/CartContext";
import { useState } from "react";
import "./ProductCard.css";

export default function ProductCard({ product }) {
  const cover = product.images?.[0]?.image;
  const outOfStock = product.stock_quantity <= 0;
  const { addItem } = useCart();
  const [adding, setAdding] = useState(false);

  const quickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock || adding) return;
    setAdding(true);
    try {
      await addItem(product.id, 1);
    } catch {
      // errors surface via the cart context banner
    } finally {
      setAdding(false);
    }
  };

  return (
    <Link to={`/products/${product.id}`} className="product-card">
      <div className="product-card-frame">
        {cover ? (
          <img src={resolveImageUrl(cover)} alt={product.name} loading="lazy" />
        ) : (
          <div className="product-card-placeholder">No image yet</div>
        )}
        {outOfStock && <span className="product-card-tag">Sold out</span>}
        {!outOfStock && (
          <button className="product-card-quickadd" onClick={quickAdd} disabled={adding}>
            {adding ? "Adding…" : "+ Quick add"}
          </button>
        )}
      </div>
      <div className="product-card-body">
        <h3>{product.name}</h3>
        <span className="price">KSh {Number(product.price).toLocaleString()}</span>
      </div>
    </Link>
  );
}
