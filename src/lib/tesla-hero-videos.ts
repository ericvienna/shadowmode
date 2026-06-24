/** Self-hosted Tesla hero clips — no YouTube chrome */
export interface TeslaHeroClip {
  src: string;
  title: string;
  tag: 'robotaxi' | 'cybercab' | 'fsd' | 'event';
}

export const TESLA_HERO_CLIPS: TeslaHeroClip[] = [
  { src: '/videos/clip-cybercab.mp4', title: 'Cybercab — The Future is Autonomous', tag: 'cybercab' },
  { src: '/videos/clip-werobot.mp4', title: 'We, Robot Recap', tag: 'event' },
];