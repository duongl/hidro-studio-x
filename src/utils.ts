import { ProjectType, SocialPlatform } from './types';

// Auto-calculates default scene duration based on target scene counts and platform presets
export function calculateDuration(sceneCount: number, platform: SocialPlatform): number {
  switch (platform) {
    case 'TikTok':
    case 'Shopee':
    case 'Lazada':
      return sceneCount * 4; // fast shorts (4s per scene)
    case 'Amazon':
    case 'Facebook':
      return sceneCount * 6; // balanced ads (6s per scene)
    case 'YouTube':
      return sceneCount * 8; // long-form documentary (8s per scene)
    default:
      return sceneCount * 5;
  }
}

// Cinematic glass gradients to populate placeholders in beautiful retro/modern styles
export const CHROMATIC_PRESETS = [
  'linear-gradient(135deg, #111 0%, #0d2a1b 100%)', // Acid Emerald mint
  'linear-gradient(135deg, #0d0d0d 0%, #0a2233 100%)', // Deep Cobalt
  'linear-gradient(135deg, #111111 0%, #201335 100%)', // Liquid Amethyst
  'linear-gradient(135deg, #050505 0%, #281404 100%)', // Amber Sunset
  'linear-gradient(135deg, #121212 0%, #1c0a0c 100%)', // Crimson Carbon
];

export function generateGradientForScene(index: number): string {
  return CHROMATIC_PRESETS[index % CHROMATIC_PRESETS.length];
}

// Generate premium mock production image inline-SVGs to act as gorgeous simulated visual fallback in render cards
export function generateSyntheticCinematicSvg(title: string, info: string, index: number): string {
  const gradStart = index % 2 === 0 ? '#0D0D0D' : '#0F1F15';
  const gradEnd = index % 2 === 0 ? '#1A1D20' : '#0A2A1A';
  const accentColor = '#66FF99';
  const secondaryColor = '#4DA6FF';

  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
    <defs>
      <linearGradient id="g_${index}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${gradStart}"/>
        <stop offset="100%" stop-color="${gradEnd}"/>
      </linearGradient>
    </defs>
    <rect width="800" height="450" fill="url(#g_${index})"/>
    
    <!-- Cinematic Grid & Safe Zones -->
    <line x1="50" y1="50" x2="150" y2="50" stroke="rgba(255,255,255,0.08)" stroke-width="2"/>
    <line x1="50" y1="50" x2="50" y2="150" stroke="rgba(255,255,255,0.08)" stroke-width="2"/>
    
    <line x1="750" y1="50" x2="650" y2="50" stroke="rgba(255,255,255,0.08)" stroke-width="2"/>
    <line x1="750" y1="50" x2="750" y2="150" stroke="rgba(255,255,255,0.08)" stroke-width="2"/>

    <line x1="50" y1="400" x2="150" y2="400" stroke="rgba(255,255,255,0.08)" stroke-width="2"/>
    <line x1="50" y1="400" x2="50" y2="300" stroke="rgba(255,255,255,0.08)" stroke-width="2"/>

    <line x1="750" y1="400" x2="650" y2="400" stroke="rgba(255,255,255,0.08)" stroke-width="2"/>
    <line x1="750" y1="400" x2="750" y2="300" stroke="rgba(255,255,255,0.08)" stroke-width="2"/>

    <!-- Dynamic Wave / Audio Particle Visuals of Directorial Consistency -->
    <path d="M 150 250 Q 250 150 350 250 T 550 250 T 700 250" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="4"/>
    <path d="M 100 220 Q 300 320 450 120 T 700 220" fill="none" stroke="${accentColor}" stroke-opacity="0.12" stroke-width="1.5"/>
    <circle cx="450" cy="120" r="4" fill="${secondaryColor}" opacity="0.6"/>

    <!-- Interactive metadata box -->
    <rect x="50" y="320" width="700" height="80" rx="12" fill="rgba(0, 0, 0, 0.45)" stroke="rgba(255, 255, 255, 0.05)" stroke-width="1"/>
    
    <!-- Render Badges -->
    <text x="75" y="352" font-family="monospace" font-size="11" fill="${accentColor}" letter-spacing="1">DNA STABLE LOCK // INJECTED</text>
    <text x="75" y="380" font-family="sans-serif" font-weight="600" font-size="14" fill="#FFFFFF">${title}</text>
    
    <rect x="635" y="342" width="90" height="24" rx="12" fill="rgba(102, 255, 153, 0.1)" stroke="rgba(102, 255, 153, 0.3)"/>
    <text x="680" y="358" font-family="monospace" font-size="10" font-weight="bold" fill="${accentColor}" text-anchor="middle">SCENE ${index}</text>

    <!-- Visual telemetry lens mark -->
    <circle cx="400" cy="225" r="40" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>
    <line x1="400" y1="175" x2="400" y2="275" stroke="rgba(255,255,255,0.02)" stroke-width="1"/>
    <line x1="350" y1="225" x2="450" y2="225" stroke="rgba(255,255,255,0.02)" stroke-width="1"/>
  </svg>`;
}
