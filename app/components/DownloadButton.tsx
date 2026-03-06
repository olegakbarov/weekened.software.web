"use client";

import { useState, useRef, useEffect } from "react";

const DOWNLOADS = [
  {
    label: "Apple Silicon",
    url: "https://github.com/olegakbarov/weekend.software/releases/download/v0.2.0/Weekend.Software_0.2.0_aarch64.dmg",
  },
  {
    label: "Intel",
    url: "https://github.com/olegakbarov/weekend.software/releases/download/v0.2.0/Weekend.Software_0.2.0_x64.dmg",
  },
];

export default function DownloadButton() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="download-split" ref={ref}>
      <a
        href={DOWNLOADS[selected].url}
        className="download-main"
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Download for {DOWNLOADS[selected].label}
      </a>
      <button
        className="download-toggle"
        onClick={() => setOpen(!open)}
        aria-label="Select architecture"
      >
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="download-dropdown">
          {DOWNLOADS.map((d, i) => (
            <button
              key={d.label}
              className={`download-option${i === selected ? " active" : ""}`}
              onClick={() => {
                setSelected(i);
                setOpen(false);
              }}
            >
              {d.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
