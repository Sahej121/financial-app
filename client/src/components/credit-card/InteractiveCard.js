import { useState, useEffect } from "react";

/* ─────────────────────────────────────────────
   DESIGN DIRECTION: Luxury / Refined Dark
   - Real credit card aspect ratio (85.6 × 53.98 mm → 1.5876:1)
   - Accurate chip grooves, 3-arc contactless icon
   - Smooth 3D flip with proper backface culling
   - Subtle hover lift before flip
   - Shimmer that actually loops cleanly
   - Signature strip with realistic baseline pattern
   ───────────────────────────────────────────── */

const CARD_WIDTH = 400;                          // px
const CARD_HEIGHT = Math.round(CARD_WIDTH / 1.5876); // ≈ 252px — real card ratio

export default function InteractiveCard({ formData = {} }) {
  const { name = "", monthlySpend = 0 } = formData;
  const [flipped, setFlipped] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [settled, setSettled] = useState(false);   // false until intro finishes

  useEffect(() => {
    const el = document.querySelector(".cc-wrapper");
    const onEnd = (e) => {
      if (e.animationName === "cc-intro") setSettled(true);
    };
    el?.addEventListener("animationend", onEnd);
    return () => el?.removeEventListener("animationend", onEnd);
  }, []);

  // ── helpers ──────────────────────────────────
  const tier = (() => {
    const s = parseFloat(monthlySpend) || 0;
    if (s > 100000) return { label: "Platinum", accent: "#e2e8f0" };
    if (s > 50000) return { label: "Gold", accent: "#fbbf24" };
    if (s > 25000) return { label: "Silver", accent: "#94a3b8" };
    return { label: "Classic", accent: "#a78bfa" };
  })();

  const displayName = (name || "").trim().toUpperCase().substring(0, 22) || "CARDHOLDER NAME";

  const expiry = (() => {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yy = String(now.getFullYear() + 3).slice(-2);
    return `${mm}/${yy}`;
  })();

  // ── render ───────────────────────────────────
  return (
    <>
      <style>{CSS}</style>

      <div className="cc-scene">
        <div
          className={`cc-wrapper ${settled ? "cc-settled" : "cc-intro-active"} ${flipped ? "cc-flipped" : ""} ${hovered ? "cc-hovered" : ""}`}
          onClick={() => setFlipped(f => !f)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          role="button"
          aria-label="Click to flip card"
          tabIndex={0}
          onKeyDown={e => e.key === "Enter" && setFlipped(f => !f)}
        >
          {/* ── FRONT ── */}
          <div className="cc-face cc-front">
            <div className="cc-shimmer" />
            <div className="cc-radial" />

            {/* tier badge */}
            <span className="cc-tier" style={{ color: tier.accent }}>{tier.label}</span>

            {/* chip */}
            <div className="cc-chip">
              <div className="cc-chip-h cc-chip-h1" />
              <div className="cc-chip-h cc-chip-h2" />
              <div className="cc-chip-v cc-chip-v1" />
              <div className="cc-chip-v cc-chip-v2" />
              <div className="cc-chip-gloss" />
            </div>

            {/* network logo */}
            <div className="cc-logo">
              <div className="cc-logo-c cc-logo-c1" />
              <div className="cc-logo-c cc-logo-c2" />
            </div>

            {/* contactless — dot + 3 arcs */}
            <div className="cc-nfc">
              <div className="cc-nfc-dot" />
              <div className="cc-nfc-arc cc-nfc-a1" />
              <div className="cc-nfc-arc cc-nfc-a2" />
              <div className="cc-nfc-arc cc-nfc-a3" />
            </div>

            {/* card number */}
            <div className="cc-number">**** &nbsp;**** &nbsp;**** &nbsp;1234</div>

            {/* footer row */}
            <div className="cc-footer">
              <div className="cc-field">
                <span className="cc-label">Card Holder</span>
                <span className="cc-value">{displayName}</span>
              </div>
              <div className="cc-field">
                <span className="cc-label">Expires</span>
                <span className="cc-value">{expiry}</span>
              </div>
            </div>
          </div>

          {/* ── BACK ── */}
          <div className="cc-face cc-back">
            {/* matching shimmer on back too */}
            <div className="cc-shimmer cc-shimmer-back" />

            {/* magnetic stripe — full bleed */}
            <div className="cc-mag-stripe" />

            {/* signature + CVV row */}
            <div className="cc-sig-row">
              <svg className="cc-sig-lines" viewBox="0 0 230 30" preserveAspectRatio="none">
                {/* baseline rules */}
                {Array.from({ length: 15 }, (_, i) => (
                  <line key={i} x1="0" y1={i * 2 + 1} x2="230" y2={i * 2 + 1} stroke="#ddd" strokeWidth="0.55" />
                ))}
                {/* signature squiggle */}
                <path
                  d="M6,24 Q14,8 24,18 T44,12 T64,20 T84,10 T104,16 T124,22 T140,14"
                  fill="none" stroke="#8b7355" strokeWidth="1.3" strokeLinecap="round"
                />
              </svg>
              <div className="cc-cvv-wrap">
                <span className="cc-cvv-label">CVV</span>
                <span className="cc-cvv-val">•••</span>
              </div>
            </div>

            {/* bottom row: logo left, barcode right */}
            <div className="cc-back-bottom">
              {/* network logo echoed */}
              <div className="cc-logo cc-logo-back">
                <div className="cc-logo-c cc-logo-c1" />
                <div className="cc-logo-c cc-logo-c2" />
              </div>

              {/* decorative barcode */}
              <svg className="cc-barcode" viewBox="0 0 80 38" preserveAspectRatio="none">
                {[2, 5, 7, 10, 12, 14, 17, 19, 22, 24, 26, 29, 31, 33, 36, 38, 41, 43, 45, 48, 50, 52, 55, 57, 60, 62, 64, 67, 69, 72, 74, 77].map((x, i) => (
                  <rect key={i} x={x} y="0" width={i % 3 === 0 ? 1.4 : 0.7} height="38" fill="rgba(255,255,255,.55)" />
                ))}
              </svg>
            </div>

            {/* disclaimer */}
            <p className="cc-back-text">
              This card is property of the issuing bank. If found, please return to the nearest branch.&nbsp;&nbsp;
              Customer service: 1800-XXX-XXXX &nbsp;|&nbsp; www.cardissuer.com
            </p>
          </div>
        </div>

        <p className="cc-hint">{flipped ? "Click to flip back" : "Click card to flip"}</p>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   ALL STYLES — single <style> block, scoped via .cc- prefix
   ───────────────────────────────────────────── */
const CSS = `
  /* ── scene (perspective root) ── */
  .cc-scene {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    padding: 40px 0 56px;           /* room for hint + shadow */
    perspective: 1200px;            /* perspective MUST live on the parent */
  }

  /* ── wrapper (flips) ── */
  .cc-wrapper {
    position: relative;
    width: ${CARD_WIDTH}px;
    height: ${CARD_HEIGHT}px;
    cursor: pointer;
    transform-style: preserve-3d;
    outline: none;
  }

  /* ── INTRO phase: keyframe owns everything, no transition ── */
  .cc-wrapper.cc-intro-active {
    animation: cc-intro 2.2s cubic-bezier(.22, .61, .36, 1) forwards;
    pointer-events: none;   /* block clicks while animating */
  }

  /* ── SETTLED phase: idle float + interactive transitions ── */
  .cc-wrapper.cc-settled {
    transition:
      transform 0.72s cubic-bezier(.4, .2, .2, 1),
      filter 0.3s ease;
    animation: cc-float 5s ease-in-out infinite;
  }

  .cc-wrapper.cc-settled:focus-visible {
    outline: 2px solid rgba(139,92,246,.5);
    outline-offset: 4px;
    border-radius: 20px;
  }
  .cc-wrapper.cc-settled.cc-hovered {
    transform: translateY(-6px) scale(1.015);
    filter: drop-shadow(0 24px 40px rgba(0,0,0,.45));
    animation: none;
  }
  .cc-wrapper.cc-settled.cc-flipped {
    transform: rotateY(180deg);
  }
  .cc-wrapper.cc-settled.cc-flipped.cc-hovered {
    transform: rotateY(180deg) translateY(-6px) scale(1.015);
    animation: none;
  }

  /* ── shared face ── */
  .cc-face {
    position: absolute;
    inset: 0;
    border-radius: 20px;
    backface-visibility: hidden;
    overflow: hidden;
  }

  /* ──────────── FRONT ──────────── */
  .cc-front {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
    box-shadow:
      0 8px 32px rgba(102,126,234,.4),
      0 24px 64px rgba(0,0,0,.4);
    animation: cc-glow 4s ease-in-out infinite;
  }

  /* shimmer sweep */
  .cc-shimmer {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      105deg,
      transparent 40%,
      rgba(255,255,255,.08) 45%,
      rgba(255,255,255,.18) 50%,
      rgba(255,255,255,.08) 55%,
      transparent 60%
    );
    background-size: 200% 100%;
    animation: cc-shimmer 2.8s ease-in-out infinite;
    pointer-events: none;
  }

  /* subtle radial highlight top-right */
  .cc-radial {
    position: absolute;
    top: -40%;
    right: -30%;
    width: 120%;
    height: 120%;
    background: radial-gradient(circle, rgba(255,255,255,.07) 0%, transparent 65%);
    pointer-events: none;
  }

  /* tier badge — top right */
  .cc-tier {
    position: absolute;
    top: 18px;
    right: 24px;
    z-index: 2;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    background: rgba(255,255,255,.12);
    backdrop-filter: blur(6px);
    border: 1px solid rgba(255,255,255,.2);
    padding: 4px 10px;
    border-radius: 10px;
  }

  /* ── chip ── */
  .cc-chip {
    position: absolute;
    top: 48px;
    left: 32px;
    width: 54px;
    height: 42px;
    border-radius: 7px;
    background: linear-gradient(145deg, #f5d47a, #c9a227, #f5d47a, #c9a227);
    box-shadow: 0 3px 10px rgba(0,0,0,.35), inset 0 1px 1px rgba(255,255,255,.4);
  }
  /* horizontal grooves */
  .cc-chip-h {
    position: absolute;
    left: 0; right: 0;
    height: 1px;
    background: rgba(0,0,0,.18);
  }
  .cc-chip-h1 { top: 38%; }
  .cc-chip-h2 { top: 62%; }
  /* vertical grooves */
  .cc-chip-v {
    position: absolute;
    top: 0; bottom: 0;
    width: 1px;
    background: rgba(0,0,0,.18);
  }
  .cc-chip-v1 { left: 33%; }
  .cc-chip-v2 { left: 67%; }
  /* gloss */
  .cc-chip-gloss {
    position: absolute;
    inset: 0;
    border-radius: 7px;
    background: linear-gradient(135deg, rgba(255,255,255,.35) 0%, transparent 50%);
    pointer-events: none;
  }

  /* ── network logo (two overlapping circles) ── */
  .cc-front .cc-logo {
    position: absolute;
    top: 44px;
    right: 28px;
    display: flex;
  }
  .cc-logo-c {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    mix-blend-mode: screen;
  }
  .cc-logo-c1 {
    background: rgba(235, 30, 45, .85);
    position: relative;
    z-index: 1;
  }
  .cc-logo-c2 {
    background: rgba(255, 100, 0, .85);
    margin-left: -13px;
  }

  /* ── contactless NFC icon ── */
  .cc-nfc {
    position: absolute;
    top: 108px;
    left: 32px;
    width: 28px;
    height: 28px;
  }
  .cc-nfc-dot {
    position: absolute;
    bottom: 1px;
    left: 1px;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: rgba(255,255,255,.85);
  }
  .cc-nfc-arc {
    position: absolute;
    bottom: 3px;
    left: 3px;
    border: 1.8px solid rgba(255,255,255,.75);
    border-radius: 50%;
    border-right: transparent;
    border-bottom: transparent;
    transform: rotate(45deg);
  }
  .cc-nfc-a1 { width: 10px; height: 10px; }
  .cc-nfc-a2 { width: 17px; height: 17px; opacity: .7; }
  .cc-nfc-a3 { width: 24px; height: 24px; opacity: .45; }

  /* ── card number ── */
  .cc-number {
    position: absolute;
    top: 140px;
    left: 32px;
    right: 32px;
    font-family: 'Courier New', monospace;
    font-size: 22px;
    font-weight: 500;
    letter-spacing: 3px;
    color: #fff;
    text-shadow: 0 2px 6px rgba(0,0,0,.4);
    user-select: none;
  }

  /* ── footer (name + expiry) ── */
  .cc-footer {
    position: absolute;
    bottom: 24px;
    left: 32px;
    right: 32px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }
  .cc-field {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .cc-label {
    font-size: 8px;
    font-weight: 600;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: rgba(255,255,255,.55);
  }
  .cc-value {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 1.5px;
    color: #fff;
    text-shadow: 0 1px 4px rgba(0,0,0,.35);
  }

  /* ──────────── BACK ──────────── */
  .cc-back {
    background: linear-gradient(225deg, #f093fb 0%, #764ba2 50%, #667eea 100%);
    transform: rotateY(180deg);
    box-shadow:
      0 8px 32px rgba(102,126,234,.4),
      0 24px 64px rgba(0,0,0,.4);
    display: flex;
    flex-direction: column;
  }

  /* shimmer on back — slightly different angle */
  .cc-shimmer-back {
    background: linear-gradient(
      -105deg,
      transparent 40%,
      rgba(255,255,255,.06) 45%,
      rgba(255,255,255,.14) 50%,
      rgba(255,255,255,.06) 55%,
      transparent 60%
    ) !important;
    animation-delay: -1.4s !important;
  }

  /* magnetic stripe — full bleed, sits near top */
  .cc-mag-stripe {
    width: 100%;
    height: 50px;
    margin-top: 22px;
    background: linear-gradient(
      90deg,
      #1a1a1a 0%,
      #2e2e2e 20%,
      #3d3d3d 35%,
      #2e2e2e 50%,
      #3d3d3d 65%,
      #2e2e2e 80%,
      #1a1a1a 100%
    );
    box-shadow: inset 0 2px 6px rgba(0,0,0,.7);
  }

  /* signature + CVV row */
  .cc-sig-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 14px 24px 0;
    background: #fff;
    border-radius: 4px;
    padding: 5px 8px;
    height: 44px;
    box-shadow: 0 1px 3px rgba(0,0,0,.15);
  }
  .cc-sig-lines {
    flex: 1;
    height: 30px;
  }
  .cc-cvv-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-left: 1px solid #e0e0e0;
    padding-left: 9px;
    min-width: 44px;
    gap: 1px;
  }
  .cc-cvv-label {
    font-size: 7px;
    font-weight: 700;
    color: #6b7280;
    letter-spacing: .8px;
  }
  .cc-cvv-val {
    font-size: 14px;
    font-weight: 700;
    color: #374151;
    letter-spacing: 2px;
  }

  /* bottom row: logo left, barcode right */
  .cc-back-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 12px 24px 0;
  }
  .cc-logo-back {
    display: flex;  /* just needs to be a flex row like the front one */
  }
  .cc-barcode {
    width: 72px;
    height: 34px;
    opacity: .85;
  }

  /* disclaimer — pinned to bottom */
  .cc-back-text {
    margin-top: auto;
    padding: 10px 24px 12px;
    font-size: 7.5px;
    line-height: 1.45;
    color: rgba(255,255,255,.5);
    text-align: center;
  }

  /* ── hint text ── */
  .cc-hint {
    margin-top: 28px;
    font-size: 12px;
    color: rgba(255,255,255,.4);
    letter-spacing: 0.5px;
    user-select: none;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.5s ease 0.15s;
  }
  .cc-settled ~ .cc-hint {
    opacity: 1;
  }

  /* ── keyframes ── */

  /*
    cc-intro — 3-phase entrance:
      0–18%  : rise up from below, fade in, scale up
      18–72% : 1.4 full Y revolutions while hovering high
      72–100%: rotation unwinds back to 0, card drifts down to rest
  */
  @keyframes cc-intro {
    0% {
      transform: translateY(180px) scale(0.6) rotateY(0deg);
      opacity: 0;
      filter: blur(4px);
    }
    18% {
      transform: translateY(-28px) scale(1.08) rotateY(0deg);
      opacity: 1;
      filter: blur(0px);
    }
    72% {
      transform: translateY(-20px) scale(1.05) rotateY(504deg); /* 360+144 = 1.4 revolutions */
    }
    88% {
      transform: translateY(-4px) scale(1.01) rotateY(12deg);
    }
    100% {
      transform: translateY(0px) scale(1) rotateY(0deg);
      opacity: 1;
      filter: blur(0px);
    }
  }

  @keyframes cc-float {
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(-8px); }
  }

  @keyframes cc-shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  @keyframes cc-glow {
    0%, 100% {
      box-shadow:
        0 8px 32px rgba(102,126,234,.4),
        0 24px 64px rgba(0,0,0,.4);
    }
    50% {
      box-shadow:
        0 8px 40px rgba(139,92,246,.55),
        0 24px 72px rgba(0,0,0,.45);
    }
  }
`;