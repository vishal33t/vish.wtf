import { adminEnabled, isAdmin } from '@/lib/auth';
import { getContent } from '@/lib/db';
import AdminApp from './AdminApp';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin · vish.wtf', robots: { index: false, follow: false } };

export default async function AdminPage() {
  return <AdminApp enabled={adminEnabled()} authed={await isAdmin()} initial={(await isAdmin()) ? getContent() : null} />;
}
