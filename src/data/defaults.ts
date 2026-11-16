// Seed content, taken from resume_v2.pdf. After first run the live copy lives in SQLite
// (data/vish.db) and is edited at /admin. Delete the db file to re-seed from here.
export type Project = {
  slug: string; title: string; status: 'In progress' | 'Completed' | 'Concept'; published: boolean;
  summary: string; tech: string[]; github: string; live: string; images: string[];
  problem: string; solution: string; architecture: string; decisions: string; challenges: string; results: string;
};
export type Content = {
  profile: { name: string; role: string; headline: string; intro: string; about: string; email: string; phone: string; location: string; github: string; linkedin: string };
  skills: { label: string; items: string[] }[];
  education: { school: string; degree: string; period: string; note: string }[];
  certifications: string[];
  projects: Project[];
};
const empty = { images: [] as string[], problem: '', solution: '', architecture: '', decisions: '', challenges: '', results: '' };
export const defaults: Content = {
  profile: {
    name: 'Vishal Singh', role: 'Full Stack Developer',
    headline: 'I build full stack products that read, search and organise.',
    intro: 'Full Stack Developer from Surat working with the MERN stack and AI-powered web apps: REST APIs, secure authentication, OCR, vision models and semantic search.',
    about: 'I am a Full Stack Developer studying Information Technology at Sarvajanik College of Engineering & Technology, Surat. I enjoy building responsive interfaces and the backend services behind them, and I am currently exploring how OCR, vision models and vector search can make personal data easier to use.\n\nI am looking for Full Stack and Software Developer roles where I can ship scalable, high-quality software.',
    email: 'rajputvishal33t@gmail.com', phone: '', location: 'Surat, India',
    github: 'https://github.com/vishal33t', linkedin: 'https://linkedin.com/in/vishal-singh-33t',
  },
  skills: [
    { label: 'Languages', items: ['Java', 'Python', 'JavaScript'] },
    { label: 'Frameworks', items: ['React.js', 'Next.js', 'Node.js', 'Express.js', 'Tailwind CSS'] },
    { label: 'Databases', items: ['MongoDB', 'PostgreSQL', 'MySQL'] },
    { label: 'AI and data', items: ['Gemini Vision API', 'Tesseract OCR', 'Hugging Face Embeddings', 'Qdrant', 'Semantic search'] },
    { label: 'Tools', items: ['Git', 'GitHub', 'VS Code', 'Postman'] },
  ],
  education: [{ school: 'Sarvajanik College of Engineering & Technology, Sarvajanik University, Surat', degree: 'B.Tech, Information Technology', period: 'Expected 2027', note: 'CGPA 8.4 / 10.0' }],
  certifications: ['Generative AI, LinkedIn Learning'],
  projects: [
    { slug: 'memoryvault-ai', title: 'MemoryVault AI', status: 'In progress', published: true,
      summary: 'An AI-powered personal knowledge manager that turns screenshots into structured, searchable, actionable information.',
      tech: ['Next.js', 'Node.js', 'PostgreSQL', 'Prisma', 'Auth.js', 'Gemini Vision', 'Tesseract', 'Qdrant', 'Hugging Face', 'Supabase Storage', 'Resend', 'Tailwind CSS'],
      github: '', live: '', ...empty,
      problem: 'Useful information, such as opportunities, deadlines and resources, ends up trapped in screenshots.',
      solution: 'Screenshots are read with OCR and AI vision, extracted into structured content, categorised automatically and made searchable in natural language. Deadline reminders and a personal dashboard keep saved items actionable.',
      architecture: 'Next.js app with Auth.js authentication, PostgreSQL via Prisma, Supabase Storage for files, and a Qdrant vector index fed by Hugging Face embeddings for semantic search.' },
    { slug: 'stayease', title: 'StayEase', status: 'Completed', published: true,
      summary: 'A responsive hostel and PG management system with an admin dashboard, built on the MERN stack.',
      tech: ['React.js', 'Node.js', 'Express.js', 'MongoDB Atlas', 'Tailwind CSS', 'JWT'], github: '', live: '', ...empty,
      solution: 'Admin dashboard backed by MongoDB Atlas, with REST APIs, JWT authentication and role-based access.',
      architecture: 'React frontend deployed on Vercel talking to an Express API deployed on Render, with MongoDB Atlas for storage.' },
  ],
};
