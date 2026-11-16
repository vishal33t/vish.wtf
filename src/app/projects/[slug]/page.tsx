import Link from 'next/link';
import { notFound } from 'next/navigation';
import Nav from '@/components/Nav';
import { getContent } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pr = getContent().projects.find(p => p.slug === slug && p.published);
  if (!pr) notFound();
  const parts: [string, string][] = [['The problem', pr.problem], ['The solution', pr.solution], ['Architecture', pr.architecture], ['Technical decisions', pr.decisions], ['Challenges', pr.challenges], ['Results', pr.results]];
  return (
    <>
      <Nav />
      <main id="main" className="case">
        <Link href="/#work" className="link">Back to projects</Link>
        <p className="status">{pr.status}</p>
        <h1>{pr.title}</h1>
        <p className="lead">{pr.summary}</p>
        <ul className="chips">{pr.tech.map(t => <li key={t}>{t}</li>)}</ul>
        <div className="cta-row">
          {pr.github && <a className="btn" href={pr.github} target="_blank" rel="noopener noreferrer">GitHub</a>}
          {pr.live && <a className="link" href={pr.live} target="_blank" rel="noopener noreferrer">Live demo</a>}
        </div>
        {pr.images?.length > 0 && <div className="gallery">{pr.images.map(im => <img key={im} src={`/api/img/${im}`} alt={`${pr.title} screenshot`} loading="lazy" />)}</div>}
        {parts.filter(([, v]) => v.trim()).map(([h, v]) => (<section key={h} className="case-part"><h2>{h}</h2>{v.split(/\n\s*\n/).map((t, i) => <p key={i}>{t}</p>)}</section>))}
      </main>
    </>
  );
}
