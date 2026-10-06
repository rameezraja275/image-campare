"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

export type Pair = { name: string; original: string; enhanced: string };

export default function Comparator({ pairs }: { pairs: Pair[] }) {
  const [current, setCurrent] = useState(0);
  const [pos, setPos] = useState(50);
  const [loaded, setLoaded] = useState<Set<string>>(() => new Set());
  const stageRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const select = useCallback(
    (i: number) => {
      if (i >= 0 && i < pairs.length) setCurrent(i);
    },
    [pairs.length],
  );

  // Keep active thumb in view and preload neighbours
  useEffect(() => {
    if (!pairs.length) return;
    stripRef.current?.children[current]?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: "smooth",
    });
    for (const j of [current - 1, current + 1]) {
      if (!pairs[j]) continue;
      new window.Image().src = pairs[j].original;
      new window.Image().src = pairs[j].enhanced;
    }
  }, [current, pairs]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") select(current + 1);
      else if (e.key === "ArrowLeft") select(current - 1);
      else if (e.key === " ") {
        e.preventDefault();
        setPos((p) => (p > 50 ? 0 : 100));
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [current, select]);

  const moveTo = (clientX: number) => {
    const r = stageRef.current!.getBoundingClientRect();
    setPos(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)));
  };

  if (!pairs.length) {
    return (
      <div className="empty">
        No matching &lt;name&gt; / &lt;name&gt;_enhanced photos in public/photos.
      </div>
    );
  }

  const pair = pairs[current];
  const markLoaded = (src: string) => () =>
    setLoaded((s) => (s.has(src) ? s : new Set(s).add(src)));
  const loading = !loaded.has(pair.original) || !loaded.has(pair.enhanced);

  return (
    <main className="app">
      <header>
        <span className="name">
          {pair.name} ({current + 1} / {pairs.length})
        </span>
        <span className="hint">Drag to compare · ←/→ switch photo · Space toggle 0/100%</span>
      </header>

      <div
        ref={stageRef}
        className="stage"
        style={{ "--pos": `${pos}%` } as React.CSSProperties}
        onPointerDown={(e) => {
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          moveTo(e.clientX);
        }}
        onPointerMove={(e) => dragging.current && moveTo(e.clientX)}
        onPointerUp={() => (dragging.current = false)}
        onPointerCancel={() => (dragging.current = false)}
      >
        {/* Plain <img> so the full-quality files are compared, not re-compressed versions */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={pair.original}
          ref={(el) => void (el?.complete && markLoaded(pair.original)())}
          src={pair.original}
          alt="Original"
          onLoad={markLoaded(pair.original)}
          onError={markLoaded(pair.original)}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={pair.enhanced}
          ref={(el) => void (el?.complete && markLoaded(pair.enhanced)())}
          className="enhanced"
          src={pair.enhanced}
          alt="Enhanced"
          onLoad={markLoaded(pair.enhanced)}
          onError={markLoaded(pair.enhanced)}
        />
        <div className="divider" />
        <div className="tag left">Original</div>
        <div className="tag right">Enhanced</div>
        {loading && <div className="loading">Loading…</div>}
      </div>

      <div ref={stripRef} className="strip">
        {pairs.map((p, i) => (
          <button
            key={p.name}
            title={p.name}
            className={i === current ? "active" : undefined}
            onClick={() => select(i)}
          >
            <Image src={p.original} alt="" width={96} height={72} sizes="96px" />
            <span>{p.name}</span>
          </button>
        ))}
      </div>
    </main>
  );
}
