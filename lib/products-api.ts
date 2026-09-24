import { ApiError } from "./api-error";
import api from "./axios";
import {
  addCreatedProduct,
  applyOverlayToList,
  applyOverlayToProduct,
  markDeletedProduct,
  readOverlay,
  upsertUpdatedProduct,
} from "./local-products";
import type {
  Category,
  Product,
  ProductFormValues,
  ProductListResponse,
  SortBy,
  SortOrder,
} from "./types";

type FetchProductsOptions = {
  page: number;
  limit: number;
  q: string;
  category: string;
  sortBy: SortBy | "";
  order: SortOrder;
  signal?: AbortSignal;
};

function sortParams(sortBy: SortBy | "", order: SortOrder) {
  if (!sortBy) return {};
  return { sortBy, order };
}

export async function fetchProducts(options: FetchProductsOptions) {
  const skip = (options.page - 1) * options.limit;
  const params = {
    limit: options.limit,
    skip,
    ...sortParams(options.sortBy, options.order),
  };

  let path = "/products";
  if (options.q) {
    path = "/products/search";
  } else if (options.category) {
    path = `/products/category/${encodeURIComponent(options.category)}`;
  }

  const { data } = await api.get<ProductListResponse>(path, {
    params: options.q ? { ...params, q: options.q } : params,
    signal: options.signal,
  });

  return applyOverlayToList({
    products: data.products ?? [],
    total: data.total ?? 0,
    page: options.page,
    q: options.q,
    category: options.category,
  });
}

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await api.get<unknown>("/products/categories");
  if (!Array.isArray(data)) return [];

  return data.map((item) => {
    if (typeof item === "string") {
      return { slug: item, name: item };
    }
    const record = item as { slug?: string; name?: string };
    return {
      slug: record.slug ?? "",
      name: record.name ?? record.slug ?? "",
    };
  }).filter((item) => item.slug);
}

export async function fetchProductById(id: number): Promise<Product | null> {
  if (!Number.isFinite(id) || id < 1) return null;

  const overlay = readOverlay();
  if (overlay.deleted.includes(id)) return null;

  const created = overlay.created.find((item) => item.id === id);
  if (created) return created;

  try {
    const { data } = await api.get<Product>(`/products/${id}`);
    return applyOverlayToProduct(data, id);
  } catch (error) {
    const updated = overlay.updated[String(id)];
    if (updated) return updated;
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

function toProductPayload(values: ProductFormValues) {
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    category: values.category.trim(),
    price: Number(values.price),
    stock: Number(values.stock),
    thumbnail: values.thumbnail.trim() || "https://cdn.dummyjson.com/product-images/generic/placeholder.png",
  };
}

export async function createProduct(values: ProductFormValues): Promise<Product> {
  const payload = toProductPayload(values);
  const { data } = await api.post<Product>("/products/add", payload);

  const product: Product = {
    id: Date.now(),
    title: data.title ?? payload.title,
    description: data.description ?? payload.description,
    category: data.category ?? payload.category,
    price: data.price ?? payload.price,
    stock: data.stock ?? payload.stock,
    rating: data.rating ?? 0,
    thumbnail: data.thumbnail || payload.thumbnail,
    images: data.images?.length ? data.images : [payload.thumbnail],
    reviews: [],
  };

  addCreatedProduct(product);
  return product;
}

export async function updateProduct(id: number, values: ProductFormValues): Promise<Product> {
  const payload = toProductPayload(values);
  let apiProduct: Partial<Product> = {};

  try {
    const { data } = await api.put<Product>(`/products/${id}`, payload);
    apiProduct = data;
  } catch {
    apiProduct = payload;
  }

  const product: Product = {
    id,
    title: apiProduct.title ?? payload.title,
    description: apiProduct.description ?? payload.description,
    category: apiProduct.category ?? payload.category,
    price: apiProduct.price ?? payload.price,
    stock: apiProduct.stock ?? payload.stock,
    rating: apiProduct.rating ?? 0,
    thumbnail: apiProduct.thumbnail || payload.thumbnail,
    images: apiProduct.images?.length ? apiProduct.images : [payload.thumbnail],
    reviews: apiProduct.reviews ?? [],
  };

  upsertUpdatedProduct(product);
  return product;
}

export async function deleteProduct(id: number) {
  try {
    await api.delete(`/products/${id}`);
  } catch {
    // DummyJSON only persists deletes for real ids; still hide locally.
  }
  markDeletedProduct(id);
}
