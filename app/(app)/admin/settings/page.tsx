import { redirect } from 'next/navigation';
import { userCan } from '@/lib/auth/server';
import SystemSettings from '@/features/settings';

/** System settings (exchange rate, utility prices) — requires `admin.settings`. */
export default async function AdminSettingsPage() {
  if (!(await userCan('admin.settings'))) {
    redirect('/dashboard');
  }
  return <SystemSettings />;
}
