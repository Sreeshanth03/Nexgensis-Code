import Link from "next/link";
import type { Product } from "@/lib/types";

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export default function ProductTable({
  products,
  onDelete,
}: {
  products: Product[];
  onDelete: (product: Product) => void;
}) {
  return (
    <div className="hidden overflow-hidden rounded-lg border border-slate-200 bg-white md:block">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Product
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Category
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Price
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Rating
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Stock
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-slate-50">
              <td className="px-4 py-3">
                <Link href={`/products/${product.id}`} className="flex items-center gap-3">
                  <img
                    src={product.thumbnail}
                    alt={product.title}
                    className="h-12 w-12 rounded-md object-cover"
                  />
                  <span className="font-medium text-slate-900">{product.title}</span>
                </Link>
              </td>
              <td className="px-4 py-3 capitalize text-slate-600">{product.category}</td>
              <td className="px-4 py-3 text-slate-900">{formatPrice(product.price)}</td>
              <td className="px-4 py-3 text-slate-600">{product.rating}</td>
              <td className="px-4 py-3 text-slate-600">{product.stock}</td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <Link
                    href={`/products/${product.id}/edit`}
                    className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-white"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => onDelete(product)}
                    className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ProductCards({
  products,
  onDelete,
}: {
  products: Product[];
  onDelete: (product: Product) => void;
}) {
  return (
    <div className="grid gap-4 md:hidden">
      {products.map((product) => (
        <article key={product.id} className="rounded-lg border border-slate-200 bg-white p-4">
          <Link href={`/products/${product.id}`} className="flex gap-3">
            <img
              src={product.thumbnail}
              alt={product.title}
              className="h-20 w-20 rounded-md object-cover"
            />
            <div>
              <h2 className="font-medium text-slate-900">{product.title}</h2>
              <p className="mt-1 text-sm capitalize text-slate-500">{product.category}</p>
              <p className="mt-2 text-sm text-slate-700">
                {formatPrice(product.price)} · {product.rating} ★ · {product.stock} in stock
              </p>
            </div>
          </Link>
          <div className="mt-4 flex gap-2">
            <Link
              href={`/products/${product.id}/edit`}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700"
            >
              Edit
            </Link>
            <button
              type="button"
              onClick={() => onDelete(product)}
              className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700"
            >
              Delete
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
