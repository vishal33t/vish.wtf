import type { Content } from '@/data/defaults';
export function SocialLinks({ p }: { p: Content['profile'] }) {
  return (<>
    {p.github && <a href={p.github} target="_blank" rel="noopener noreferrer">GitHub</a>}
    {p.linkedin && <a href={p.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>}
    {p.email && <a href={`mailto:${p.email}`}>Email</a>}
  </>);
}
