import Link from 'next/link';
export default function Nav() {
  return (
    <header className="rail">
      <Link href="/" className="wordmark" aria-label="vish.wtf home">vish<span>.wtf</span></Link>
      <nav aria-label="Primary"><Link href="/#work">Work</Link><Link href="/#about">About</Link><Link href="/#skills">Skills</Link><Link href="/#contact">Contact</Link></nav>
    </header>
  );
}
