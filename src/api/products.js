import { apiFetch, BASE_URL } from "./client";

export function listProducts({ page = 1, ordering, priceMin, priceMax, name, categoryId } = {}) {
  const params = new URLSearchParams();
  params.set("page", page);
  if (ordering) params.set("ordering", ordering);
  if (priceMin) params.set("price__gte", priceMin);
  if (priceMax) params.set("price__lte", priceMax);
  if (name) params.set("name", name);
  if (categoryId) params.set("category_id", categoryId);
  return apiFetch(`/products/?${params.toString()}`, { auth: false });
}

export function getProduct(id) {
  return apiFetch(`/products/${id}/`, { auth: false });
}

export function listCategories() {
  return apiFetch(`/category/`, { auth: false });
}

export function listReviews(productId) {
  return apiFetch(`/products/${productId}/review/`, { auth: false });
}

export function createReview(productId, { name, comment }) {
  return apiFetch(`/products/${productId}/review/`, {
    method: "POST",
    auth: false,
    body: { name, comment },
  });
}

// Product images come back as relative paths from Django's MEDIA_URL;
// this resolves them against the API host so <img> tags work.
export function resolveImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path}`;
}
