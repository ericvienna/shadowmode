/** Self-hosted Tesla hero clips — no YouTube chrome. Sourced from Tesla's official channel. */
export interface TeslaHeroClip {
  src: string;
  title: string;
  tag: 'robotaxi' | 'cybercab' | 'fsd' | 'event' | 'energy' | 'semi';
}

export const TESLA_HERO_CLIPS: TeslaHeroClip[] = [
  { src: '/videos/clip-cybercab.mp4', title: 'Cybercab — We, Robot unveil (Oct 2024)', tag: 'cybercab' },
  { src: '/videos/clip-werobot.mp4', title: 'We, Robot Recap', tag: 'event' },
];

export const ENERGY_HERO_CLIPS: TeslaHeroClip[] = [
  { src: '/videos/clip-energy-calflats.mp4', title: 'Megapack — Cal Flats (Tesla)', tag: 'energy' },
  { src: '/videos/clip-energy-boulder.mp4', title: 'Megapack — Boulder City, NV (Tesla)', tag: 'energy' },
];

export const SEMI_HERO_CLIPS: TeslaHeroClip[] = [
  { src: '/videos/clip-semi-giga-fleet.mp4', title: 'Semi fleet — Giga Nevada to Fremont (Tesla)', tag: 'semi' },
  { src: '/videos/clip-semi-500mi.mp4', title: 'Semi — 500 mi fully loaded, single charge (Tesla)', tag: 'semi' },
];
