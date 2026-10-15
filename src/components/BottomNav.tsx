"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav({ likedCount }: { likedCount: number }) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex"
      style={{
        background: "var(--card)",
        borderTop: "1px solid var(--border)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <Link
        href="/"
        className="flex-1 flex flex-col items-center py-3 no-underline"
        style={{
          color: pathname === "/" ? "var(--accent)" : "var(--text-secondary)",
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
        <span className="text-xs mt-1 font-medium">Swipe</span>
      </Link>
      <Link
        href="/liked"
        className="flex-1 flex flex-col items-center py-3 no-underline relative"
        style={{
          color:
            pathname === "/liked" ? "var(--accent)" : "var(--text-secondary)",
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill={pathname === "/liked" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        <span className="text-xs mt-1 font-medium">Likés</span>
        {likedCount > 0 && (
          <span
            className="absolute -top-1 right-1/4 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
            style={{ background: "var(--danger)", fontSize: "10px" }}
          >
            {likedCount > 99 ? "99+" : likedCount}
          </span>
        )}
      </Link>
    </nav>
  );
}
