"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ConfirmDialog";
import ErrorState from "@/components/ErrorState";
import Loader from "@/components/Loader";
import { getErrorMessage } from "@/lib/api-error";
import { deleteProduct, fetchProductById } from "@/lib/products-api";
import type { Product } from "@/lib/types";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(params.id);
  const [product, setProduct] = useState<Product | null>(null);
  const [status, setStatus] = useState<"loading" | "success" | "error" | "notfound">("loading");
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reloadNonce, setReloadNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus("loading");
      setError("");
      try {
        const data = await fetchProductById(id);
        if (cancelled) return;
        if (!data) {
          setStatus("notfound");
          return;
        }
        setProduct(data);
        setActiveImage(data.images?.[0] || data.thumbnail);
        setStatus("success");
      } catch (err) {
        if (cancelled) return;
        setError(getErrorMessage(err));
        setStatus("error");
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [id, reloadNonce]);

  async function handleDelete() {
    if (!product || deleting) return;
    setDeleting(true);
    try {
      await deleteProduct(product.id);
      router.replace("/products");
    } catch (err) {
      setError(getErrorMessage(err));
      setDeleting(false);
    }
  }

  if (status === "loading") return <Loader label="Loading product…" />;
  if (status === "error") {
    return <ErrorState message={error} onRetry={() => setReloadNonce((value) => value + 1)} />;
  }
  if (status === "notfound" || !product) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white px-6 py-16 text-center">
        <h1 className="text-xl font-semibold text-slate-900">Product not found</h1>
        <p className="mt-2 text-sm text-slate-600">
          There is no product with id “{params.id}”.
        </p>
        <Link href="/products" className="mt-6 inline-block text-sm font-medium text-indigo-600">
          Back to products
        </Link>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [product.thumbnail];

  return (
    <div className="space-y-6">
      <Link href="/products" className="text-sm text-indigo-600">
        ← Back to products
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <img
            src={activeImage}
            alt={product.title}
            className="h-80 w-full rounded-xl object-cover bg-slate-100"
          />
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {images.map((image) => (
              <button
                key={image}
                type="button"
                onClick={() => setActiveImage(image)}
                className={`h-16 w-16 overflow-hidden rounded-md border ${
                  activeImage === image ? "border-indigo-600" : "border-slate-200"
                }`}
              >
                <img src={image} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm capitalize text-slate-500">{product.category}</p>
          <h1 className="mt-1 text-3xl font-semibold text-slate-900">{product.title}</h1>
          <p className="mt-4 text-2xl font-semibold text-slate-900">
            ${product.price.toFixed(2)}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Rating {product.rating} · {product.stock} in stock
          </p>
          <p className="mt-6 text-sm leading-6 text-slate-700">{product.description}</p>

          <div className="mt-6 flex gap-3">
            <Link
              href={`/products/${product.id}/edit`}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
            >
              Edit
            </Link>
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Reviews</h2>
        {product.reviews?.length ? (
          <div className="mt-4 grid gap-3">
            {product.reviews.map((review, index) => (
              <article key={`${review.reviewerName}-${index}`} className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="text-sm font-medium text-slate-900">
                  {review.reviewerName} · {review.rating} ★
                </p>
                <p className="mt-1 text-sm text-slate-600">{review.comment}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-500">No reviews for this product.</p>
        )}
      </section>

      <ConfirmDialog
        open={confirmOpen}
        busy={deleting}
        title="Delete product?"
        message={`This will remove “${product.title}” from the dashboard.`}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
