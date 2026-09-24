"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import Loader from "@/components/Loader";

export default function HomePage() {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    router.replace(user ? "/products" : "/login");
  }, [ready, user, router]);

  return (
    <main className="min-h-screen bg-slate-50">
      <Loader label="Opening dashboard…" />
    </main>
  );
}
