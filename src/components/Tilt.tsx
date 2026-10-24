"use client";

import React, { useRef, useState } from "react";

type Props = {
  children: React.ReactNode;
  max?: number; // max tilt in degrees
  className?: string;
  glare?: boolean;
};

export default function Tilt({ children, max = 8, className = "", glare = true }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [t, setT] = useState({ rx: 0, ry: 0, gx: 50, gy: 50, hover: false });

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transform: `perspective(1100px) rotateX(${t.rx}deg) rotateY(${t.ry}deg) scale(${t.hover ? 1.015 : 1})`,
        transformStyle: "preserve-3d",
        transition: t.hover ? "transform 0.06s linear" : "transform 0.5s cubic-bezier(0.21,1.02,0.73,1)",
      }}
      onMouseMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        setT({ rx: (0.5 - py) * max, ry: (px - 0.5) * max, gx: px * 100, gy: py * 100, hover: true });
      }}
      onMouseLeave={() => setT((s) => ({ ...s, rx: 0, ry: 0, hover: false }))}
    >
      {children}
      {glare && (
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
          style={{
            opacity: t.hover ? 0.16 : 0,
            background: `radial-gradient(circle at ${t.gx}% ${t.gy}%, rgba(255,255,255,0.9), transparent 55%)`,
          }}
        />
      )}
    </div>
  );
}
