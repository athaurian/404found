import { useId } from "react";
import "./PageBand.css";

function Squiggle() {
  return (
    <svg
      className="page-band-squiggle"
      viewBox="0 0 360 12"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 7 C17 2 30 11 45 6 C60 1 75 11 90 6 C105 1 120 11 135 6 C150 1 165 11 180 6 C195 1 210 11 225 6 C240 1 255 11 270 6 C285 1 300 11 315 6 C330 1 345 10 358 5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function Sticker({ icon }) {
  // Unique id so the circular text path never clashes
  const pathId = `sticker-${useId().replace(/:/g, "")}`;
  return (
    <div className="page-band-sticker" aria-hidden="true">
      <svg className="page-band-sticker-ring" viewBox="0 0 120 120">
        <defs>
          <path
            id={pathId}
            d="M 60, 60 m -42, 0 a 42,42 0 1,1 84,0 a 42,42 0 1,1 -84,0"
          />
        </defs>
        <text className="page-band-sticker-text">
          <textPath href={`#${pathId}`} startOffset="2%">
            FROM CSUI, BY CSUI, FOR CSUI
          </textPath>
        </text>
      </svg>
      <span className="page-band-sticker-icon">{icon}</span>
    </div>
  );
}

/**
 * The slim title band at the top of every page: heading with a squiggle,
 * one line of text, the round sticker, and a wavy bottom edge.
 */
export default function PageBand({ title, subtitle, icon }) {
  return (
    <section className="page-band">
      <div className="container page-band-inner">
        <div className="page-band-text">
          <div className="page-band-heading">
            <h1 className="page-band-title">{title}</h1>
            <Squiggle />
          </div>
          <p className="page-band-subtitle">{subtitle}</p>
        </div>
        <Sticker icon={icon} />
      </div>

      <div className="page-band-wave" aria-hidden="true">
        <svg viewBox="0 0 1440 32" preserveAspectRatio="none">
          <path d="M0,12 C240,32 480,0 720,16 C960,32 1200,4 1440,18 L1440,32 L0,32 Z" />
        </svg>
      </div>
    </section>
  );
}
