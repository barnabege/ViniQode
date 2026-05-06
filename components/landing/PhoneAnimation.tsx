import * as React from "react";
import { BatteryFull, Check, Signal, Wifi } from "lucide-react";
import styles from "./PhoneAnimation.module.css";

interface PhoneAnimationProps {
  className?: string;
  style?: React.CSSProperties;
}

export function PhoneAnimation({ className, style }: PhoneAnimationProps) {
  const wrapperClassName = className
    ? `${styles.wrapper} ${className}`
    : styles.wrapper;

  return (
    <div
      role="img"
      aria-label="Démonstration animée du parcours utilisateur ViniQode"
      className={wrapperClassName}
      style={style}
    >
      <div className={styles.chassis}>
        <span className={styles.notch} aria-hidden="true" />
        <div className={styles.screen}>
          <header className={styles.statusBar} aria-hidden="true">
            <span>9:41</span>
            <span className={styles.statusBarIcons}>
              <Signal size={12} strokeWidth={2.5} />
              <Wifi size={12} strokeWidth={2.5} />
              <BatteryFull size={14} strokeWidth={2} />
            </span>
          </header>

          <div className={styles.cameraScene}>
            <Bottle className={styles.bottle} />
            <div className={styles.scanFrame}>
              <span className={`${styles.corner} ${styles.cornerTl}`} />
              <span className={`${styles.corner} ${styles.cornerTr}`} />
              <span className={`${styles.corner} ${styles.cornerBl}`} />
              <span className={`${styles.corner} ${styles.cornerBr}`} />
              <span className={styles.scanLine} />
            </div>
            <span className={`${styles.toast} ${styles.toastPointez}`}>
              Pointez vers le QR code
            </span>
            <span className={`${styles.toast} ${styles.toastDetect}`}>
              <Check size={12} strokeWidth={3} />
              QR code conforme détecté
            </span>
          </div>

          <div className={styles.elabelScene}>
            <ELabelContent />
          </div>
        </div>
      </div>

      <div className={styles.dots} aria-hidden="true">
        <span className={`${styles.dot} ${styles.dot1}`} />
        <span className={`${styles.dot} ${styles.dot2}`} />
        <span className={`${styles.dot} ${styles.dot3}`} />
        <span className={`${styles.dot} ${styles.dot4}`} />
      </div>
    </div>
  );
}

function ELabelContent() {
  return (
    <>
      <div className={styles.elabelHeader}>
        <p className={styles.elabelEyebrow}>(UE) 2021/2117</p>
        <p className={styles.elabelTitle}>Cuvée des Vieilles Vignes</p>
        <p className={styles.elabelSubtitle}>Bordeaux · 2022 · Rouge</p>
        <p className={styles.elabelSubtitle}>Domaine de la Vigne</p>
      </div>

      <div className={styles.elabelSection}>
        <p className={styles.elabelSectionTitle}>Ingrédients</p>
        <p className={styles.elabelText}>
          Raisins, contient des <strong>sulfites</strong>.
        </p>
      </div>

      <div className={styles.elabelSection}>
        <p className={styles.elabelSectionTitle}>Déclaration nutritionnelle</p>
        <p className={styles.elabelSubtitle}>Pour 100 ml</p>
        <table className={styles.elabelTable}>
          <tbody>
            <tr className={styles.elabelRowBold}>
              <td>Énergie</td>
              <td>328 kJ / 79 kcal</td>
            </tr>
            <tr>
              <td>Matières grasses</td>
              <td>0 g</td>
            </tr>
            <tr className={styles.elabelIndent}>
              <td>dont saturés</td>
              <td>0 g</td>
            </tr>
            <tr>
              <td>Glucides</td>
              <td>0,3 g</td>
            </tr>
            <tr className={styles.elabelIndent}>
              <td>dont sucres</td>
              <td>0,3 g</td>
            </tr>
            <tr>
              <td>Protéines</td>
              <td>0 g</td>
            </tr>
            <tr>
              <td>Sel</td>
              <td>0 g</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className={styles.elabelFooter}>
        Aucune donnée personnelle n'est collectée lors de la consultation de
        cette page.
      </p>
    </>
  );
}

function Bottle({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 90 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="vqGlass" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#3a0d12" />
          <stop offset="0.45" stopColor="#7a1e26" />
          <stop offset="0.55" stopColor="#7a1e26" />
          <stop offset="1" stopColor="#2a0a0d" />
        </linearGradient>
        <linearGradient id="vqHighlight" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="rgba(255,255,255,0)" />
          <stop offset="0.5" stopColor="rgba(255,255,255,0.18)" />
          <stop offset="1" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>

      <path
        d="M37 4 h16 v34 q0 6 4 12 q10 14 10 36 v118 q0 12 -12 12 h-20 q-12 0 -12 -12 v-118 q0 -22 10 -36 q4 -6 4 -12 z"
        fill="url(#vqGlass)"
        stroke="#1a0508"
        strokeWidth="1"
      />
      <rect x="36" y="4" width="18" height="22" fill="#1a0508" />
      <rect x="32" y="22" width="26" height="6" fill="#0a0203" />

      <rect
        x="20"
        y="120"
        width="50"
        height="76"
        fill="#f4ecd8"
        stroke="#c8b88e"
        strokeWidth="0.5"
      />
      <text
        x="45"
        y="134"
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontSize="6"
        fill="#1a0508"
        fontStyle="italic"
      >
        Domaine
      </text>

      <g transform="translate(28 142)">
        <rect width="34" height="34" fill="#fff" />
        {QR_CELLS.map(([x, y], i) => (
          <rect
            key={i}
            x={x * 1.5 + 2}
            y={y * 1.5 + 2}
            width="1.5"
            height="1.5"
            fill="#000"
          />
        ))}
        <rect x="2" y="2" width="9" height="9" fill="none" stroke="#000" strokeWidth="1.5" />
        <rect x="23" y="2" width="9" height="9" fill="none" stroke="#000" strokeWidth="1.5" />
        <rect x="2" y="23" width="9" height="9" fill="none" stroke="#000" strokeWidth="1.5" />
      </g>

      <path
        d="M37 4 h16 v34 q0 6 4 12 q10 14 10 36 v118 q0 12 -12 12 h-20 q-12 0 -12 -12 v-118 q0 -22 10 -36 q4 -6 4 -12 z"
        fill="url(#vqHighlight)"
        opacity="0.9"
      />
    </svg>
  );
}

const QR_CELLS: ReadonlyArray<readonly [number, number]> = [
  [8, 2], [10, 3], [13, 4], [15, 2], [17, 3],
  [2, 13], [4, 15], [6, 13], [8, 14], [10, 16],
  [13, 14], [15, 13], [17, 15], [19, 14],
  [3, 17], [5, 19], [7, 17], [9, 18], [11, 17], [13, 19], [15, 17], [17, 18],
  [12, 5], [14, 6], [16, 7], [18, 8],
  [5, 9], [7, 11], [9, 9], [11, 11],
];
