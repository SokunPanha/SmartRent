import { redirect } from 'next/navigation';
import { userCan } from '@/lib/api/guard';
import UsersAdmin from '@/features/admin';

/** User management — requires the `admin.access` permission. */
export default async function AdminUsersPage() {
  if (!(await userCan('admin.access'))) {
    redirect('/dashboard');
  }
  return <UsersAdmin />;
}
