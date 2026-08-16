import { useEffect, useState } from "react";
import { listProducts } from "../api/products";
import ProductCard from "../components/ProductCard";
import "./Home.css";

export default function Home() {
  const [state, setState] = useState({ loading: true, error: null, data: null });
  const [ordering, setOrdering] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true }));
    listProducts({ page, ordering })
      .then((data) => {
        if (!cancelled) setState({ loading: false, error: null, data });
      })
      .catch((err) => {
        if (!cancelled) setState({ loading: false, error: err.message, data: null });
      });
    return () => {
      cancelled = true;
    };
  }, [page, ordering]);

  return (
    <div className="home">
      <section className="hero">
        <div className="container hero-inner">
          <span className="eyebrow">Nairobi, Kenya</span>
          <h1>
            Modest tailoring,
            <br />
            <em>made to move.</em>
          </h1>
          <p className="hero-copy">
            Abayas cut for everyday wear — breathable fabric, considered detailing, delivered
            across the city and paid for with a tap of M-Pesa.
          </p>
        </div>
      </section>

      <section className="container catalog">
        <div className="catalog-head">
          <h2>The Catalog</h2>
          <select value={ordering} onChange={(e) => setOrdering(e.target.value)} aria-label="Sort by price">
            <option value="">Sort: Newest</option>
            <option value="price">Price: Low to High</option>
            <option value="-price">Price: High to Low</option>
          </select>
        </div>

        {state.error && <p className="form-error">{state.error}</p>}

        {state.loading && (
          <div className="catalog-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ aspectRatio: "3/4.6" }} />
            ))}
          </div>
        )}

        {!state.loading && state.data?.results?.length === 0 && (
          <div className="catalog-empty">
            <p>No pieces are listed yet. New arrivals will appear here.</p>
          </div>
        )}

        {!state.loading && state.data?.results?.length > 0 && (
          <>
            <div className="catalog-grid">
              {state.data.results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="catalog-pagination">
              <button
                className="btn btn-outline"
                disabled={!state.data.previous}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <span className="form-note">Page {page}</span>
              <button
                className="btn btn-outline"
                disabled={!state.data.next}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
