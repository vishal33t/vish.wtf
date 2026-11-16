
import Link from 'next/link';
import Nav from '@/components/Nav';
import Tilt from '@/components/Tilt';
import MarkUp from '@/components/MarkUp';
import { getContent, listNotes } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const { profile: p, projects, skills, education, certifications } = await getContent();
  const notes = await listNotes(true);
  const forSection = (s: string) => notes.filter(n => n.section === s);
  const shown = projects.filter(x => x.published);
  const [first, ...rest] = p.name.split(' ');

  return (
    <>
      <Nav />
      <main id="main">
        <section className="hero" aria-labelledby="hero-title">
          <h1 id="hero-title" className="hero-name">
            <span>{first}</span><span>{rest.join(' ')}</span>
            <svg className="redline" viewBox="0 0 100 24" preserveAspectRatio="none" aria-hidden="true">
              <path d="M1 21 L99 3" pathLength="1" />
            </svg>
          </h1>

          <p className="dim"><span>{p.role}, {p.location}</span></p>

          <div className="hero-body">
            <p className="hero-head">{p.headline}</p>
            <p className="muted">{p.intro}</p>
            <div className="cta-row">
              <a className="btn" href="#work">Explore projects</a>
              {p.github && <a className="link" href={p.github} target="_blank" rel="noopener noreferrer">GitHub</a>}
              <a className="link" href="#contact">Contact</a>
            </div>
          </div>
        </section>

        <section id="work" className="sheet" aria-labelledby="work-h">
          <header className="sec-head">
            <h2 id="work-h">Selected work</h2>
            <MarkUp section="work" notes={forSection('work')} />
          </header>

          {shown.length === 0 && (
            <p className="muted">No projects published yet. Add them in /admin.</p>
          )}

          <div className="projects-list">
            {shown.map((pr, i) => (
              <article key={pr.slug} className={`row ${i % 2 ? 'flip' : ''}`}>
                <div className="row-main">
                  <p className="status">{pr.status}</p>
                  <h3><Link href={`/projects/${pr.slug}`}>{pr.title}</Link></h3>
                  <p className="row-sum">{pr.summary}</p>

                  <ul className="chips" aria-label="Technologies">
                    {pr.tech.map(t => <li key={t}>{t}</li>)}
                  </ul>

                  <div className="card-links">
                    <Link href={`/projects/${pr.slug}`} className="link">Read the case study</Link>
                    {pr.github && <a className="link" href={pr.github} target="_blank" rel="noopener noreferrer">GitHub</a>}
                    {pr.live && <a className="link" href={pr.live} target="_blank" rel="noopener noreferrer">Live demo</a>}
                  </div>
                </div>

                <Tilt className="plate">
                  {pr.images?.[0] ? (
                    <>
                      <div className="layer l0 cover">
                        <img src={`/api/img/${pr.images[0]}`} alt={`${pr.title} screenshot`} loading="lazy" />
                      </div>
                      <div className="layer l2 tag"><b>{pr.title}</b></div>
                    </>
                  ) : (
                    <>
                      <div className="layer l0" style={{ ['--a' as string]: `${15 + i * 41}deg` }} />
                      <div className="layer l1"><b>{pr.title}</b></div>
                      <div className="layer l2" aria-hidden="true">
                        {pr.tech.slice(0, 3).map(t => <i key={t}>{t}</i>)}
                      </div>
                    </>
                  )}
                </Tilt>
              </article>
            ))}
          </div>
        </section>

        <section id="about" className="sheet two" aria-labelledby="about-h">
          <header className="sec-head">
            <h2 id="about-h">About</h2>
            <MarkUp section="about" notes={forSection('about')} />
          </header>
          <div className="prose">
            {p.about.split(/\n\s*\n/).map((t, i) => <p key={i}>{t}</p>)}
          </div>
        </section>

        <section id="skills" className="sheet two" aria-labelledby="skills-h">
          <header className="sec-head">
            <h2 id="skills-h">Skills</h2>
            <MarkUp section="skills" notes={forSection('skills')} />
          </header>
          <table className="skills">
            <tbody>
              {skills.map(s => (
                <tr key={s.label}>
                  <th scope="row">{s.label}</th>
                  <td>{s.items.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section id="education" className="sheet two" aria-labelledby="edu-h">
          <header className="sec-head">
            <h2 id="edu-h">Education</h2>
            <MarkUp section="education" notes={forSection('education')} />
          </header>
          <div className="prose">
            {education.map(e => (
              <div key={e.school} className="edu">
                <h3>{e.degree}</h3>
                <p>{e.school}</p>
                <p className="muted">{e.period}{e.note && `, ${e.note}`}</p>
              </div>
            ))}
            {certifications.length > 0 && (
              <p className="muted">Certification: {certifications.join('; ')}</p>
            )}
          </div>
        </section>

        <section id="contact" className="sheet two contact" aria-labelledby="contact-h">
          <header className="sec-head">
            <h2 id="contact-h">Get in touch</h2>
            <MarkUp section="contact" notes={forSection('contact')} />
          </header>
          <div>
            <p className="prose">Open to Full Stack and Software Developer roles.</p>
            {p.email && <a className="big-link" href={`mailto:${p.email}`}>{p.email}</a>}
            <div className="cta-row">
              {p.github && <a className="link" href={p.github} target="_blank" rel="noopener noreferrer">GitHub</a>}
              {p.linkedin && <a className="link" href={p.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>}
              {p.phone && <a className="link" href={`tel:${p.phone}`}>{p.phone}</a>}
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <span>{p.name}, {new Date().getFullYear()}</span>
        <a href="/admin" className="link">Admin</a>
      </footer>
    </>
  );
}
