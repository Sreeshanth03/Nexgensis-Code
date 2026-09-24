import { PAGE_SIZES, type PageSize, type SortBy, type SortOrder } from "./types";

export type ProductQueryState = {
  page: number;
  limit: PageSize;
  q: string;
  category: string;
  sortBy: SortBy | "";
  order: SortOrder;
};

const SORT_FIELDS: SortBy[] = ["price", "rating", "title"];

function toPositiveInt(value: string | null, fallback: number) {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return parsed;
}

export function parseProductQuery(
  searchParams: URLSearchParams,
): ProductQueryState {
  const rawLimit = toPositiveInt(searchParams.get("limit"), 10);
  const limit = (PAGE_SIZES as readonly number[]).includes(rawLimit)
    ? (rawLimit as PageSize)
    : 10;

  const sortByRaw = searchParams.get("sortBy") ?? "";
  const sortBy = SORT_FIELDS.includes(sortByRaw as SortBy)
    ? (sortByRaw as SortBy)
    : "";

  const orderRaw = searchParams.get("order");
  const order: SortOrder = orderRaw === "desc" ? "desc" : "asc";

  return {
    page: toPositiveInt(searchParams.get("page"), 1),
    limit,
    q: (searchParams.get("q") ?? "").trim(),
    category: (searchParams.get("category") ?? "").trim(),
    sortBy,
    order,
  };
}

export function buildProductQuery(state: ProductQueryState): string {
  const params = new URLSearchParams();
  if (state.page > 1) params.set("page", String(state.page));
  if (state.limit !== 10) params.set("limit", String(state.limit));
  if (state.q) params.set("q", state.q);
  if (state.category) params.set("category", state.category);
  if (state.sortBy) {
    params.set("sortBy", state.sortBy);
    params.set("order", state.order);
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function clampPage(page: number, total: number, limit: number) {
  const totalPages = Math.max(1, Math.ceil(total / limit) || 1);
  if (page > totalPages) return totalPages;
  return page;
}
