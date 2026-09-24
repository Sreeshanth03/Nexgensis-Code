"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ErrorState from "@/components/ErrorState";
import Loader from "@/components/Loader";
import ProductForm from "@/components/ProductForm";
import { getErrorMessage } from "@/lib/api-error";
import { fetchCategories, fetchProductById, updateProduct } from "@/lib/products-api";
import type { Category, ProductFormValues } from "@/lib/types";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(params.id);
  const [categories, setCategories] = useState<Category[]>([]);
  const [values, setValues] = useState<ProductFormValues | null>(null);
  const [status, setStatus] = useState<"loading" | "success" | "error" | "notfound">("loading");
  const [error, setError] = useState("");
  const [reloadNonce, setReloadNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus("loading");
      try {
        const [product, categoryList] = await Promise.all([
          fetchProductById(id),
          fetchCategories(),
        ]);
        if (cancelled) return;
        if (!product) {
          setStatus("notfound");
          return;
        }
        setCategories(categoryList);
        setValues({
          title: product.title,
          description: product.description,
          category: product.category,
          price: String(product.price),
          stock: String(product.stock),
          thumbnail: product.thumbnail,
        });
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

  async function handleSubmit(nextValues: ProductFormValues) {
    await updateProduct(id, nextValues);
    router.replace(`/products/${id}`);
  }

  if (status === "loading") return <Loader label="Loading product…" />;
  if (status === "error") {
    return <ErrorState message={error} onRetry={() => setReloadNonce((value) => value + 1)} />;
  }
  if (status === "notfound" || !values) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white px-6 py-16 text-center">
        <h1 className="text-xl font-semibold text-slate-900">Product not found</h1>
        <p className="mt-2 text-sm text-slate-600">Cannot edit a product that does not exist.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Edit product</h1>
      <p className="text-sm text-slate-500">
        DummyJSON does not persist edits. Changes are kept in this browser so the list and details stay updated.
      </p>
      <ProductForm
        initialValues={values}
        categories={categories}
        submitLabel="Save changes"
        onSubmit={handleSubmit}
      />
    </div>
  );
}
