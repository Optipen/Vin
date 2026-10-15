"use client";

import { useState, useRef, useCallback } from "react";

interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  link: string;
  category: string;
}

interface SwipeCardProps {
  product: Product;
  onLike: () => void;
  onSkip: () => void;
}

export default function SwipeCard({ product, onLike, onSkip }: SwipeCardProps) {
  const [offset, setOffset] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const [animClass, setAnimClass] = useState("");
  const startX = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleStart = useCallback((x: number) => {
    startX.current = x;
    setSwiping(true);
  }, []);

  const handleMove = useCallback(
    (x: number) => {
      if (!swiping) return;
      setOffset(x - startX.current);
    },
    [swiping]
  );

  const handleEnd = useCallback(() => {
    setSwiping(false);
    if (offset > 100) {
      setAnimClass("swipe-right");
      setTimeout(onLike, 350);
    } else if (offset < -100) {
      setAnimClass("swipe-left");
      setTimeout(onSkip, 350);
    } else {
      setOffset(0);
    }
  }, [offset, onLike, onSkip]);

  const rotation = offset * 0.1;
  const likeOpacity = Math.min(Math.max(offset / 100, 0), 1);
  const skipOpacity = Math.min(Math.max(-offset / 100, 0), 1);

  return (
    <div
      ref={cardRef}
      className={`relative w-full max-w-sm mx-auto rounded-2xl overflow-hidden select-none touch-none ${animClass}`}
      style={{
        background: "var(--card)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
        transform: animClass
          ? undefined
          : `translateX(${offset}px) rotate(${rotation}deg)`,
        transition: swiping ? "none" : "transform 0.3s ease",
      }}
      onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      onTouchEnd={handleEnd}
      onMouseDown={(e) => handleStart(e.clientX)}
      onMouseMove={(e) => handleMove(e.clientX)}
      onMouseUp={handleEnd}
      onMouseLeave={() => {
        if (swiping) handleEnd();
      }}
    >
      {/* Like/Skip indicators */}
      <div
        className="absolute top-6 right-6 z-10 rounded-lg px-4 py-2 font-bold text-2xl border-4"
        style={{
          opacity: likeOpacity,
          color: "var(--accent)",
          borderColor: "var(--accent)",
          background: "rgba(9, 180, 77, 0.1)",
          transform: `rotate(-15deg) scale(${0.8 + likeOpacity * 0.2})`,
        }}
      >
        LIKE
      </div>
      <div
        className="absolute top-6 left-6 z-10 rounded-lg px-4 py-2 font-bold text-2xl border-4"
        style={{
          opacity: skipOpacity,
          color: "var(--danger)",
          borderColor: "var(--danger)",
          background: "rgba(239, 68, 68, 0.1)",
          transform: `rotate(15deg) scale(${0.8 + skipOpacity * 0.2})`,
        }}
      >
        NOPE
      </div>

      {/* Product image */}
      <div className="relative w-full" style={{ paddingBottom: "120%" }}>
        {product.image ? (
          <img
            src={product.image}
            alt={product.title}
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center text-6xl"
            style={{ background: "var(--border)" }}
          >
            📦
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="p-4">
        <h2 className="text-lg font-bold leading-tight mb-2 line-clamp-2">
          {product.title}
        </h2>
        <div className="flex items-center justify-between">
          <span
            className="text-2xl font-black"
            style={{ color: "var(--accent)" }}
          >
            {product.price.toFixed(2)} €
          </span>
          <span
            className="text-sm px-2 py-1 rounded-full"
            style={{
              background: "var(--border)",
              color: "var(--text-secondary)",
            }}
          >
            {product.category}
          </span>
        </div>
      </div>
    </div>
  );
}
