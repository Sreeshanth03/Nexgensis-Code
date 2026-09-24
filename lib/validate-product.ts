import type { ProductFormValues } from "./types";

export type FormErrors = Partial<Record<keyof ProductFormValues, string>>;

export function validateProductForm(values: ProductFormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.title.trim()) {
    errors.title = "Title is required.";
  } else if (values.title.trim().length < 3) {
    errors.title = "Title must be at least 3 characters.";
  }

  if (!values.description.trim()) {
    errors.description = "Description is required.";
  } else if (values.description.trim().length < 10) {
    errors.description = "Description must be at least 10 characters.";
  }

  if (!values.category.trim()) {
    errors.category = "Category is required.";
  }

  const price = Number(values.price);
  if (values.price.trim() === "" || Number.isNaN(price)) {
    errors.price = "Price is required.";
  } else if (price <= 0) {
    errors.price = "Price must be greater than 0.";
  }

  const stock = Number(values.stock);
  if (values.stock.trim() === "" || Number.isNaN(stock)) {
    errors.stock = "Stock is required.";
  } else if (!Number.isInteger(stock) || stock < 0) {
    errors.stock = "Stock must be a whole number of 0 or more.";
  }

  return errors;
}
