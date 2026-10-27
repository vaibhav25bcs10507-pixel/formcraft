"use client";

import { useEffect, useState } from "react";
import { REPO_API, REPO_URL } from "@/lib/constants";

export default function GitHubStars() {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    fetch(REPO_API)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setStars(d.stargazers_count))
      .catch(() => {});
  }, []);

  return (
    <a
      href={REPO_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1.5 pl-3 pr-2.5 text-sm font-semibold text-neutral-200 backdrop-blur transition hover:border-white/25 hover:bg-white/10"
      title="Star FormCraft on GitHub"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-300">
        <path
          d="M12 2.5l2.95 5.98 6.6.96-4.78 4.66 1.13 6.58L12 17.57l-5.9 3.1 1.13-6.57L2.45 9.44l6.6-.96L12 2.5z"
          fill="currentColor"
          stroke="none"
        />
      </svg>
      <span className="hidden sm:inline">Star</span>
      {stars !== 0 && (
        <span className="min-w-[1.6rem] rounded-full bg-white/10 px-1.5 py-0.5 text-center font-mono text-xs tabular-nums text-white">
          {stars ?? "–"}
        </span>
      )}
    </a>
  );
}
