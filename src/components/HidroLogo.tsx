import React from 'react';

interface HidroLogoProps {
  className?: string;
  size?: number | string;
  glow?: boolean;
}

/**
 * High-fidelity representation of the DNA H-shaped ribbon brand mark of Hidro AI Studio.
 */
export function HidroIcon({ className = '', size = 32, glow = true }: HidroLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${glow ? 'drop-shadow-[0_0_10px_var(--accent-glow)]' : ''} transition-all duration-300 hover:scale-105`}
      id="hidro-spirit-icon"
    >
      {/* GLOW UNDERLAY */}
      {glow && (
        <>
          <path
            d="M32,20 C44,32 20,48 32,60 C44,72 20,80 32,80"
            stroke="var(--accent)"
            strokeWidth="12"
            strokeOpacity="0.15"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M68,20 C80,32 56,48 68,60 C80,72 56,80 68,80"
            stroke="var(--accent)"
            strokeWidth="12"
            strokeOpacity="0.15"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M30,50 C40,53 60,47 70,50"
            stroke="var(--accent)"
            strokeWidth="14"
            strokeOpacity="0.15"
            strokeLinecap="round"
            fill="none"
          />
        </>
      )}

      {/* Left DNA strand */}
      <path
        d="M32,20 C44,32 20,48 32,60 C44,72 20,80 32,80"
        stroke="var(--accent)"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M22,20 C10,32 34,48 22,60 C10,72 34,80 22,80"
        stroke="var(--accent)"
        strokeOpacity="0.4"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Left Base Pairs (connections) */}
      <line x1="25" y1="35" x2="29" y2="35" stroke="var(--accent)" strokeOpacity="0.6" strokeWidth="2.5" />
      <line x1="25" y1="50" x2="29" y2="50" stroke="var(--accent)" strokeOpacity="0.6" strokeWidth="2.5" />
      <line x1="25" y1="65" x2="29" y2="65" stroke="var(--accent)" strokeOpacity="0.6" strokeWidth="2.5" />

      {/* Right DNA strand */}
      <path
        d="M78,20 C90,32 66,48 78,60 C90,72 66,80 78,80"
        stroke="var(--accent)"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M68,20 C56,32 80,48 68,60 C56,72 80,80 68,80"
        stroke="var(--accent)"
        strokeOpacity="0.4"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Right Base Pairs (connections) */}
      <line x1="71" y1="35" x2="75" y2="35" stroke="var(--accent)" strokeOpacity="0.6" strokeWidth="2.5" />
      <line x1="71" y1="50" x2="75" y2="50" stroke="var(--accent)" strokeOpacity="0.6" strokeWidth="2.5" />
      <line x1="71" y1="65" x2="75" y2="65" stroke="var(--accent)" strokeOpacity="0.6" strokeWidth="2.5" />

      {/* Thick glowing DNA Center crossbar (H connection) */}
      <path
        d="M30,50 C40,53 60,47 70,50"
        stroke="var(--accent)"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

interface HidroFullLogoProps {
  className?: string;
  iconSize?: number | string;
  hideTextOnMobile?: boolean;
}

/**
 * Full brand presentation with the neon DNA-H and the stylized typography of "Hidro AI Studio".
 */
export function HidroFullLogo({ className = '', iconSize = 36, hideTextOnMobile = false }: HidroFullLogoProps) {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`} id="hidro-full-logo-container">
      <div className="p-1.5 bg-[var(--accent-glass)] border border-[var(--border)] rounded-xl shrink-0">
        <HidroIcon size={iconSize} />
      </div>
      <div className={hideTextOnMobile ? 'hidden sm:block' : ''}>
        <div className="flex flex-col">
          <span className="text-sm font-display font-black tracking-tight text-[var(--accent)] leading-none uppercase filter drop-shadow-[0_0_1px_var(--accent-glow)]">
            Hidro
          </span>
          <span className="text-[10px] font-mono tracking-widest text-[var(--text-main)]/90 block mt-1 font-bold leading-none uppercase">
            AI Studio 2.0
          </span>
        </div>
      </div>
    </div>
  );
}
