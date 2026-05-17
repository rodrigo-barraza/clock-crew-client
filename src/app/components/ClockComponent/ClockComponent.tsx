"use client";

import { useEffect, useRef } from "react";
import styles from "./ClockComponent.module.css";

/**
 * Skeuomorphic analog clock with real-time updates.
 * Renders a golden-faced clock with hour/minute/second hands,
 * tick marks, and a warm ambient glow — Clock Crew style.
 *
 * Uses rAF for smooth second-hand sweeping and CSS custom properties
 * for GPU-accelerated rotation (no React re-renders).
 *
 * @param {object}  props
 * @param {number}  [props.size=160]       - Diameter in px
 * @param {boolean} [props.showSeconds=true] - Whether to show the second hand
 * @param {string}  [props.className]      - Additional CSS class
 */
export default function ClockComponent({
  size = 160,  
  showSeconds = true,  
  className = "",  
}: any) {
  const clockRef = useRef(null);

  useEffect(() => {
    let rafId: any;

    function tick() {
      const now = new Date();
      const s = now.getSeconds() + now.getMilliseconds() / 1000;
      const m = now.getMinutes() + s / 60;
      const h = (now.getHours() % 12) + m / 60;

      const element = clockRef.current;
      if (element) {
        (element as any).style.setProperty("--hour-deg", `${h * 30}deg`);
        (element as any).style.setProperty("--minute-deg", `${m * 6}deg`);
        (element as any).style.setProperty("--second-deg", `${s * 6}deg`);
      }

      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div
      ref={clockRef}
      className={`${styles.clock} ${className}`}
      style={{ "--clock-size": `${size}px` } as React.CSSProperties}
      role="img"
      aria-label="Analog clock showing the current time"
    >
      {/* ── Bezel ring ──────────────────────────────────────────── */}
      <div className={styles.bezel}>
        {/* ── Face ────────────────────────────────────────────── */}
        <div className={styles.face}>
          {/* ── Tick marks (12 hours) ────────────────────────── */}
          {Array.from({ length: 12 }, (_, i) => (
            <div
              key={i}
              className={styles.tick}
              style={{ "--tick-rotation": `${i * 30}deg` } as React.CSSProperties}
            />
          ))}

          {/* ── Center highlight (radial glow) ───────────────── */}
          <div className={styles.highlight} aria-hidden="true" />

          {/* ── Hands (SVG for crisp arrow/chevron shapes) ───── */}
          <svg
            className={styles.hands}
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Hour hand — thick, short, arrow-shaped */}
            <g
              className={styles.hourHand}
              style={{ transform: "rotate(var(--hour-deg))" }}
            >
              <polygon
                points="100,48 92,105 100,98 108,105"
                fill="#1a1a1a"
                stroke="#111"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </g>

            {/* Minute hand — thinner, longer, arrow-shaped */}
            <g
              className={styles.minuteHand}
              style={{ transform: "rotate(var(--minute-deg))" }}
            >
              <polygon
                points="100,32 94,105 100,96 106,105"
                fill="#1a1a1a"
                stroke="#111"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            </g>

            {/* Second hand — hairline, optional */}
            {showSeconds && (
              <g
                className={styles.secondHand}
                style={{ transform: "rotate(var(--second-deg))" }}
              >
                <line
                  x1="100"
                  y1="38"
                  x2="100"
                  y2="130"
                  stroke="#c0392b"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <circle cx="100" cy="100" r="3" fill="#c0392b" />
              </g>
            )}

            {/* Center cap */}
            <circle
              cx="100"
              cy="100"
              r="5"
              fill="#222"
              stroke="#111"
              strokeWidth="1"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
