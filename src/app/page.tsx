"use client";

import { useState, useEffect, useCallback } from "react";
import SwipeCard from "@/components/SwipeCard";
import BottomNav from "@/components/BottomNav";
import {
  addLikedProduct,
  addSkippedId,
  getLikedProducts,
  getSkippedIds,
} from "@/lib/vinted";

interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  link: string;
  category: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [likedCount, setLikedCount] = useState(0);

  const fetchProducts = useCallback(async (pageNum: number) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/products?page=${pageNum}`);
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        return;
      }

      const skipped = getSkippedIds();
      const liked = getLikedProducts();
      const likedIds = new Set(liked.map((p) => p.id));

      const filtered = (data.products || []).filter(
        (p: Product) => !skipped.has(p.id) && !likedIds.has(p.id)
      );

      setProducts((prev) =>
        pageNum === 1 ? filtered : [...prev, ...filtered]
      );
    } catch {
      setError("Erreur de connexion. Réessaye.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(1);
    setLikedCount(getLikedProducts().length);
  }, [fetchProducts]);

  useEffect(() => {
    if (
      products.length > 0 &&
      currentIndex >= products.length - 3 &&
      !loading
    ) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage);
    }
  }, [currentIndex, products.length, loading, page, fetchProducts]);

  const handleLike = () => {
    const product = products[currentIndex];
    if (!product) return;
    const newLiked = addLikedProduct(product);
    setLikedCount(newLiked.length);
    setCurrentIndex((i) => i + 1);
  };

  const handleSkip = () => {
    const product = products[currentIndex];
    if (!product) return;
    addSkippedId(product.id);
    setCurrentIndex((i) => i + 1);
  };

  const handleReset = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("vin-skipped");
      } catch {}
    }
    setPage(1);
    setCurrentIndex(0);
    setProducts([]);
    fetchProducts(1);
  };

  const current = products[currentIndex];

  return (
    <div className="min-h-dvh flex flex-col" style={{ paddingBottom: "80px" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-40 flex items-center justify-center py-3 px-4"
        style={{
          background: "var(--card)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="flex flex-col items-center">
          <h1 className="text-xl font-black" style={{ color: "var(--accent)" }}>
            VinSwipe
          </h1>
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Stokomani Lagny-sur-Marne → Vinted
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {loading && products.length === 0 ? (
          <div className="flex flex-col items-center gap-4">
            <div
              className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
              style={{ borderColor: "var(--border)", borderTopColor: "var(--accent)" }}
            />
            <p style={{ color: "var(--text-secondary)" }}>
              Chargement des produits Stokomani...
            </p>
          </div>
        ) : error && products.length === 0 ? (
          <div className="flex flex-col items-center gap-4 text-center px-4">
            <div className="text-5xl">⚠️</div>
            <p className="text-lg font-medium">{error}</p>
            <button
              onClick={() => fetchProducts(1)}
              className="px-6 py-3 rounded-xl font-bold text-white"
              style={{ background: "var(--accent)" }}
            >
              Réessayer
            </button>
          </div>
        ) : !current ? (
          <div className="flex flex-col items-center gap-4 text-center px-4">
            <div className="text-5xl">🎉</div>
            <p className="text-lg font-medium">
              Tu as vu tous les produits !
            </p>
            <button
              onClick={handleReset}
              className="px-6 py-3 rounded-xl font-bold text-white"
              style={{ background: "var(--accent)" }}
            >
              Recharger les produits
            </button>
          </div>
        ) : (
          <>
            <SwipeCard
              key={current.id}
              product={current}
              onLike={handleLike}
              onSkip={handleSkip}
            />

            {/* Action buttons */}
            <div className="flex items-center gap-8 mt-6">
              <button
                onClick={handleSkip}
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg active:scale-90 transition-transform"
                style={{
                  background: "var(--card)",
                  border: "3px solid var(--danger)",
                  color: "var(--danger)",
                }}
                aria-label="Passer"
              >
                ✕
              </button>
              <button
                onClick={handleLike}
                className="w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-lg active:scale-90 transition-transform"
                style={{
                  background: "var(--accent)",
                  color: "white",
                }}
                aria-label="Liker"
              >
                ♥
              </button>
            </div>

            <p
              className="mt-3 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              {currentIndex + 1} / {products.length} produits
            </p>
            <p
              className="mt-1 text-xs text-center px-8"
              style={{ color: "var(--text-secondary)" }}
            >
              Vérifie la dispo en magasin à Lagny-sur-Marne
            </p>
          </>
        )}
      </main>

      <BottomNav likedCount={likedCount} />
    </div>
  );
}
