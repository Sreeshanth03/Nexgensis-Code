import type { Product } from "./types";

const STORAGE_KEY = "product-admin-overlay";

export type ProductOverlay = {
  created: Product[];
  updated: Record<string, Product>;
  deleted: number[];
};

const emptyOverlay = (): ProductOverlay => ({
  created: [],
  updated: {},
  deleted: [],
});

export function readOverlay(): ProductOverlay {
  if (typeof window === "undefined") return emptyOverlay();
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return emptyOverlay();
  try {
    const parsed = JSON.parse(raw) as ProductOverlay;
    return {
      created: parsed.created ?? [],
      updated: parsed.updated ?? {},
      deleted: parsed.deleted ?? [],
    };
  } catch {
    return emptyOverlay();
  }
}

export function writeOverlay(overlay: ProductOverlay) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overlay));
}

export function addCreatedProduct(product: Product) {
  const overlay = readOverlay();
  overlay.created = [product, ...overlay.created.filter((item) => item.id !== product.id)];
  writeOverlay(overlay);
}

export function upsertUpdatedProduct(product: Product) {
  const overlay = readOverlay();
  const createdIndex = overlay.created.findIndex((item) => item.id === product.id);
  if (createdIndex >= 0) {
    overlay.created[createdIndex] = product;
  } else {
    overlay.updated[String(product.id)] = product;
  }
  writeOverlay(overlay);
}

export function markDeletedProduct(id: number) {
  const overlay = readOverlay();
  overlay.created = overlay.created.filter((item) => item.id !== id);
  delete overlay.updated[String(id)];
  if (!overlay.deleted.includes(id)) overlay.deleted.push(id);
  writeOverlay(overlay);
}

function matchesQuery(product: Product, q: string, category: string) {
  if (q) {
    const haystack = `${product.title} ${product.description} ${product.category}`.toLowerCase();
    return haystack.includes(q.toLowerCase());
  }
  if (category) {
    return product.category === category;
  }
  return true;
}

export function applyOverlayToList(options: {
  products: Product[];
  total: number;
  page: number;
  q: string;
  category: string;
}): { products: Product[]; total: number } {
  const overlay = readOverlay();
  const deleted = new Set(overlay.deleted);

  let products = options.products
    .filter((product) => !deleted.has(product.id))
    .map((product) => overlay.updated[String(product.id)] ?? product);

  const extra = overlay.created.filter((product) =>
    matchesQuery(product, options.q, options.category),
  );

  if (options.page === 1) {
    const seen = new Set(products.map((product) => product.id));
    products = [...extra.filter((product) => !seen.has(product.id)), ...products];
  }

  const total =
    options.total -
    overlay.deleted.filter((id) => !overlay.created.some((item) => item.id === id)).length +
    extra.length;

  return { products, total: Math.max(0, total) };
}

export function applyOverlayToProduct(product: Product | null, id: number): Product | null {
  const overlay = readOverlay();
  if (overlay.deleted.includes(id)) return null;

  const created = overlay.created.find((item) => item.id === id);
  if (created) return created;

  if (overlay.updated[String(id)]) return overlay.updated[String(id)];
  return product;
}
