import React, { useEffect, useState } from "react";

export type LoadingDotsProps = {
  /** Controls whether the dots are animating */
  loading?: boolean;
  /** Base text shown before the dots (default: "Loading") */
  text?: string;
  /** Number of dots to cycle through (default: 3) */
  maxDots?: number;
  /** Milliseconds between updates (default: 400) */
  interval?: number;
  /** Additional CSS classes for the wrapper */
  className?: string;
  /** Inline style object */
  style?: React.CSSProperties;
};

/**
 * LoadingDots
 * A simple, accessible React + TypeScript component that cycles dots like:
 * Loading.  Loading..  Loading...
 * until the `loading` prop becomes false.
 */
export default function LoadingDots({
  loading = false,
  text = "Loading",
  maxDots = 3,
  interval = 400,
  className = "",
  style,
}: LoadingDotsProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!loading) return;

    const id = window.setInterval(() => {
      setCount((c) => (c + 1) % (maxDots + 1));
    }, interval);

    return () => window.clearInterval(id);
  }, [loading, interval, maxDots]);

  const dots = loading ? ".".repeat(count) : "";

  return (
    <span
      className={`inline-flex items-center gap-1 ${className}`}
      style={style}
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="select-none">{text}</span>
      <span className="w-8 text-left">{dots}</span>
    </span>
  );
}


