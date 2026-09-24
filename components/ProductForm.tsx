"use client";

import { useState } from "react";
import type { Category, ProductFormValues } from "@/lib/types";
import { validateProductForm, type FormErrors } from "@/lib/validate-product";

export default function ProductForm({
  initialValues,
  categories,
  submitLabel,
  onSubmit,
}: {
  initialValues: ProductFormValues;
  categories: Category[];
  submitLabel: string;
  onSubmit: (values: ProductFormValues) => Promise<void>;
}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  function update<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting) return;

    const nextErrors = validateProductForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setFormError("");
    try {
      await onSubmit(values);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not save the product.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
      {formError ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>
      ) : null}

      <Field label="Title" error={errors.title}>
        <input
          value={values.title}
          onChange={(event) => update("title", event.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Description" error={errors.description}>
        <textarea
          value={values.description}
          onChange={(event) => update("description", event.target.value)}
          rows={5}
          className={inputClass}
        />
      </Field>

      <Field label="Category" error={errors.category}>
        {categories.length > 0 ? (
          <select
            value={values.category}
            onChange={(event) => update("category", event.target.value)}
            className={inputClass}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        ) : (
          <input
            value={values.category}
            onChange={(event) => update("category", event.target.value)}
            className={inputClass}
          />
        )}
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Price" error={errors.price}>
          <input
            type="number"
            min="0"
            step="0.01"
            value={values.price}
            onChange={(event) => update("price", event.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Stock" error={errors.stock}>
          <input
            type="number"
            min="0"
            step="1"
            value={values.stock}
            onChange={(event) => update("stock", event.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Image URL (optional)">
        <input
          value={values.thumbnail}
          onChange={(event) => update("thumbnail", event.target.value)}
          className={inputClass}
          placeholder="https://"
        />
      </Field>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}

const inputClass =
  "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      {children}
      {error ? <span className="mt-1 block text-xs font-normal text-red-600">{error}</span> : null}
    </label>
  );
}
