// Registry for intros. Only Domain Expansion exists for now; add ids here when the other four are built.
export const INTROS = ['domain-expansion'] as const;
export type IntroId = (typeof INTROS)[number];
export const SESSION_KEY = 'vish-intro-played';
export const pickIntro = (): IntroId => INTROS[Math.floor(Math.random() * INTROS.length)];
