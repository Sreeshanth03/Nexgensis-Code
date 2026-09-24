"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/products" className="text-lg font-semibold text-slate-900">
            Product Admin
          </Link>
          <nav className="hidden items-center gap-4 text-sm sm:flex">
            <Link
              href="/products"
              className={pathname === "/products" ? "font-medium text-indigo-600" : "text-slate-600 hover:text-slate-900"}
            >
              Products
            </Link>
            <Link
              href="/products/new"
              className={pathname === "/products/new" ? "font-medium text-indigo-600" : "text-slate-600 hover:text-slate-900"}
            >
              Add product
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <p className="hidden text-sm text-slate-600 sm:block">
            {user?.firstName} {user?.lastName}
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
