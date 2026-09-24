"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ProductForm from "@/components/ProductForm";
import ErrorState from "@/components/ErrorState";
import Loader from "@/components/Loader";
import { getErrorMessage } from "@/lib/api-error";
import { createProduct, fetchCategories } from "@/lib/products-api";
import type { Category, ProductFormValues } from "@/lib/types";

const emptyValues: ProductFormValues = {
  title: "",
  description: "",
  category: "",
  price: "",
  stock: "",
  thumbnail: "",
};

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCategories()
      .then((data) => {
        setCategories(data);
        setStatus("success");
      })
      .catch((err) => {
        setError(getErrorMessage(err));
        setStatus("error");
      });
  }, []);

  async function handleSubmit(values: ProductFormValues) {
    const product = await createProduct(values);
    router.replace(`/products/${product.id}`);
  }

  if (status === "loading") return <Loader label="Loading form…" />;
  if (status === "error") {
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          setStatus("loading");
          fetchCategories()
            .then((data) => {
              setCategories(data);
              setStatus("success");
            })
            .catch((err) => {
              setError(getErrorMessage(err));
              setStatus("error");
            });
        }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Add product</h1>
      <p className="text-sm text-slate-500">
        DummyJSON will not persist new products. The dashboard stores the result locally so you still see it.
      </p>
      <ProductForm
        initialValues={emptyValues}
        categories={categories}
        submitLabel="Save product"
        onSubmit={handleSubmit}
      />
    </div>
  );
}
