"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ConfirmDialog from "@/components/ConfirmDialog";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import Loader from "@/components/Loader";
import Pagination from "@/components/Pagination";
import ProductTable, { ProductCards } from "@/components/ProductTable";
import { getErrorMessage, isAbortError } from "@/lib/api-error";
import { deleteProduct, fetchCategories, fetchProducts } from "@/lib/products-api";
import type { Category, Product, SortBy } from "@/lib/types";
import { buildProductQuery, parseProductQuery } from "@/lib/url-state";

export default function ProductsPage() {
  return (
    <Suspense fallback={<Loader label="Loading products…" />}>
      <ProductsPageInner />
    </Suspense>
  );
}

function ProductsPageInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = useMemo(
    () => parseProductQuery(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const [searchInput, setSearchInput] = useState(query.q);
  const [urlQ, setUrlQ] = useState(query.q);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [reloadNonce, setReloadNonce] = useState(0);
  const requestSeq = useRef(0);

  const replaceQuery = useCallback(
    (patch: Partial<typeof query>) => {
      const next = { ...query, ...patch };
      router.replace(`${pathname}${buildProductQuery(next)}`);
    },
    [pathname, query, router],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const nextQ = searchInput.trim();
      if (nextQ === query.q) return;
      replaceQuery({ q: nextQ, page: 1 });
    }, 400);

    return () => window.clearTimeout(timer);
  }, [searchInput, query.q, replaceQuery]);

  useEffect(() => {
    const controller = new AbortController();
    const seq = ++requestSeq.current;

    async function run() {
      setStatus("loading");
      setError("");
      try {
        const data = await fetchProducts({
          page: query.page,
          limit: query.limit,
          q: query.q,
          category: query.q ? "" : query.category,
          sortBy: query.sortBy,
          order: query.order,
          signal: controller.signal,
        });
        if (seq !== requestSeq.current) return;

        const totalPages = Math.max(1, Math.ceil((data.total || 0) / query.limit));
        if (query.page > totalPages) {
          replaceQuery({ page: totalPages });
          return;
        }

        setProducts(data.products);
        setTotal(data.total);
        setStatus("success");
      } catch (err) {
        if (isAbortError(err) || seq !== requestSeq.current) return;
        setError(getErrorMessage(err));
        setStatus("error");
      }
    }

    void run();
    return () => {
      controller.abort();
    };
  }, [query.category, query.limit, query.order, query.page, query.q, query.sortBy, replaceQuery, reloadNonce]);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  if (query.q !== urlQ) {
    setUrlQ(query.q);
    setSearchInput(query.q);
  }

  const totalPages = Math.max(1, Math.ceil(total / query.limit) || 1);
  const from = total === 0 ? 0 : (query.page - 1) * query.limit + 1;
  const to = total === 0 ? 0 : Math.min((query.page - 1) * query.limit + products.length, total);
  const searching = Boolean(query.q || searchInput.trim());

  async function confirmDelete() {
    if (!pendingDelete || deleting) return;
    setDeleting(true);
    try {
      await deleteProduct(pendingDelete.id);
      setPendingDelete(null);
      setProducts((current) => current.filter((item) => item.id !== pendingDelete.id));
      setTotal((current) => Math.max(0, current - 1));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Products</h1>
          <p className="text-sm text-slate-500">Search, filter, and manage DummyJSON products.</p>
        </div>
        <Link
          href="/products/new"
          className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Add product
        </Link>
      </div>

      <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-3">
        <label className="text-sm font-medium text-slate-700">
          Search
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search products"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Category
          <select
            value={searching ? "" : query.category}
            disabled={searching}
            onChange={(event) => replaceQuery({ category: event.target.value, page: 1 })}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Sort
          <select
            value={query.sortBy ? `${query.sortBy}-${query.order}` : ""}
            onChange={(event) => {
              const value = event.target.value;
              if (!value) {
                replaceQuery({ sortBy: "", order: "asc", page: 1 });
                return;
              }
              const [sortBy, order] = value.split("-") as [SortBy, "asc" | "desc"];
              replaceQuery({ sortBy, order, page: 1 });
            }}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Default</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="rating-desc">Rating: high to low</option>
            <option value="rating-asc">Rating: low to high</option>
            <option value="title-asc">Title: A to Z</option>
            <option value="title-desc">Title: Z to A</option>
          </select>
        </label>
      </div>

      {searching ? (
        <p className="text-xs text-slate-500">
          Category is ignored while searching. DummyJSON cannot search and filter by category at the same time.
        </p>
      ) : null}

      {status === "loading" ? <Loader label="Loading products…" /> : null}
      {status === "error" ? (
        <ErrorState message={error} onRetry={() => setReloadNonce((value) => value + 1)} />
      ) : null}
      {status === "success" && products.length === 0 ? (
        <EmptyState message="No products found. Try another search or filter." />
      ) : null}
      {status === "success" && products.length > 0 ? (
        <>
          <ProductTable products={products} onDelete={setPendingDelete} />
          <ProductCards products={products} onDelete={setPendingDelete} />
          <Pagination
            page={query.page}
            totalPages={totalPages}
            from={from}
            to={to}
            total={total}
            limit={query.limit}
            onPageChange={(page) => replaceQuery({ page })}
            onLimitChange={(limit) =>
              replaceQuery({
                limit: (limit === 20 || limit === 50 ? limit : 10) as 10 | 20 | 50,
                page: 1,
              })
            }
          />
        </>
      ) : null}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        busy={deleting}
        title="Delete product?"
        message={`This will remove “${pendingDelete?.title ?? ""}” from the dashboard. DummyJSON will not persist the delete, so we hide it locally.`}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
