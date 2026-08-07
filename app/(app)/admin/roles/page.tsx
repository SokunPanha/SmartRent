import { redirect } from 'next/navigation';
import { userCan } from '@/lib/auth/server';
import RolesManager from '@/features/admin/RolesManager';

/** Roles & permissions — requires the `admin.access` permission. */
export default async function AdminRolesPage() {
  if (!(await userCan('admin.access'))) {
    redirect('/dashboard');
  }
  return <RolesManager />;
}
