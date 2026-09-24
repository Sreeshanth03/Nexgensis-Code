import AuthGuard from "@/components/AuthGuard";
import Header from "@/components/Header";

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </div>
    </AuthGuard>
  );
}
