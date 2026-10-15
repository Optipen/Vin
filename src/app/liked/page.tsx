"use client";

import { useState, useEffect } from "react";
import BottomNav from "@/components/BottomNav";
import CopyButton from "@/components/CopyButton";
import { getLikedProducts, removeLikedProduct, type LikedProduct } from "@/lib/vinted";

export default function LikedPage() {
  const [liked, setLiked] = useState<LikedProduct[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    getLikedProducts().then(setLiked);
  }, []);

  const handleRemove = async (id: string) => {
    await removeLikedProduct(id);
    const updated = await getLikedProducts();
    setLiked(updated);
    if (expandedId === id) setExpandedId(null);
  };

  const handleCopyAll = async (product: LikedProduct) => {
    const text = `Titre: ${product.vintedTitle}
Description: ${product.vintedDescription}
Catégorie: ${product.vintedCategory}
Prix de vente: ${product.vintedPrice}€
Prix d'achat: ${product.price}€
Bénéfice estimé: ${(product.vintedPrice - product.price).toFixed(2)}€
Lien fournisseur: ${product.link}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  };

  return (
    <div className="min-h-dvh flex flex-col" style={{ paddingBottom: "80px" }}>
      <header
        className="sticky top-0 z-40 flex items-center justify-between py-3 px-4"
        style={{
          background: "var(--card)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <h1 className="text-xl font-black" style={{ color: "var(--accent)" }}>
          Mes Likes
        </h1>
        <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
          {liked.length} produit{liked.length > 1 ? "s" : ""}
        </span>
      </header>

      <main className="flex-1 p-4">
        {liked.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 mt-20 text-center">
            <div className="text-5xl">💚</div>
            <p className="text-lg font-medium">Aucun produit liké</p>
            <p style={{ color: "var(--text-secondary)" }}>
              Swipe à droite sur les produits qui t&apos;intéressent !
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-w-lg mx-auto">
            {liked.map((product) => (
              <div
                key={product.id}
                className="rounded-xl overflow-hidden"
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                }}
              >
                {/* Preview row */}
                <button
                  onClick={() =>
                    setExpandedId(expandedId === product.id ? null : product.id)
                  }
                  className="w-full flex items-center gap-3 p-3 text-left"
                  style={{ background: "transparent" }}
                >
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div
                      className="w-16 h-16 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ background: "var(--border)" }}
                    >
                      📦
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {product.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className="text-xs line-through"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {product.price.toFixed(2)}€
                      </span>
                      <span className="text-sm font-bold" style={{ color: "var(--accent)" }}>
                        → {product.vintedPrice}€
                      </span>
                      <span
                        className="text-xs font-bold px-1.5 py-0.5 rounded"
                        style={{ background: "rgba(9,180,77,0.1)", color: "var(--accent)" }}
                      >
                        +{(product.vintedPrice - product.price).toFixed(0)}€
                      </span>
                    </div>
                  </div>
                  <span
                    className="text-lg"
                    style={{
                      transform: expandedId === product.id ? "rotate(180deg)" : "none",
                      transition: "transform 0.2s",
                    }}
                  >
                    ▼
                  </span>
                </button>

                {/* Expanded detail */}
                {expandedId === product.id && (
                  <div
                    className="px-3 pb-3"
                    style={{ borderTop: "1px solid var(--border)" }}
                  >
                    {/* Vinted-ready fields */}
                    <div className="mt-3 flex flex-col gap-3">
                      <Field label="Titre Vinted" value={product.vintedTitle} />
                      <Field
                        label="Description"
                        value={product.vintedDescription}
                        multiline
                      />
                      <Field label="Catégorie" value={product.vintedCategory} />
                      <Field
                        label="Prix de vente conseillé"
                        value={`${product.vintedPrice}€`}
                      />
                      <Field
                        label="Prix d'achat"
                        value={`${product.price.toFixed(2)}€`}
                      />
                      <Field
                        label="Bénéfice estimé"
                        value={`${(product.vintedPrice - product.price).toFixed(2)}€`}
                      />

                      {/* Links */}
                      <div>
                        <p
                          className="text-xs font-semibold mb-1"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Lien fournisseur
                        </p>
                        <a
                          href={product.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm underline break-all"
                          style={{ color: "var(--accent)" }}
                        >
                          Voir sur Stokomani →
                        </a>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        <CopyButton text={product.vintedTitle} label="titre" />
                        <CopyButton text={product.vintedDescription} label="desc" />
                        <CopyButton text={`${product.vintedPrice}`} label="prix" />
                        <CopyButton text={product.vintedCategory} label="catégorie" />
                        <button
                          onClick={() => handleCopyAll(product)}
                          className="px-3 py-1.5 rounded-lg text-sm font-bold text-white active:scale-95 transition-transform"
                          style={{ background: "var(--accent)" }}
                        >
                          Tout copier
                        </button>
                      </div>

                      {/* Remove button */}
                      <button
                        onClick={() => handleRemove(product.id)}
                        className="mt-2 text-sm font-medium py-2 rounded-lg active:scale-95 transition-transform"
                        style={{ color: "var(--danger)" }}
                      >
                        Retirer des likes
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav likedCount={liked.length} />
    </div>
  );
}

function Field({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div>
      <p
        className="text-xs font-semibold mb-1"
        style={{ color: "var(--text-secondary)" }}
      >
        {label}
      </p>
      <div
        className="flex items-start gap-2"
      >
        <p className={`text-sm flex-1 ${multiline ? "whitespace-pre-line" : ""}`}>
          {value}
        </p>
        <CopyButton text={value} label="" />
      </div>
    </div>
  );
}
