import { Briefcase } from 'lucide-react';
import { AppLanguage } from '@/lib/types';

/**
 * Amber "read-only access" banner shown to roles that can view but not modify a
 * feature. The feature supplies the explanatory `message`.
 */
export function PermissionBanner({
  message,
  lang,
}: {
  message: string;
  lang: AppLanguage;
}) {
  return (
    <div className="bg-amber-50/70 border border-amber-200 text-amber-900 rounded-xl p-3 text-xs flex items-center gap-2 font-sans">
      <Briefcase className="w-4 h-4 text-amber-500 hover:rotate-12 transition shrink-0" />
      <div>
        <span className="font-bold">
          {lang === 'en' ? 'READ-ONLY ACCESS - ' : 'សិទ្ធិមើលតែប៉ុណ្ណោះ - '}
        </span>
        {message}
      </div>
    </div>
  );
}
