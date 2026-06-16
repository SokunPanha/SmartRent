import { Lightbulb, Droplet } from 'lucide-react';
import { AppLanguage } from '@/lib/types';

export function UtilityChart({ t, lang }: { t: any; lang: AppLanguage }) {
  return (
    <div className="bg-card border border-border p-6 rounded-3xl flex flex-col shadow-lg shadow-black/20">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-foreground tracking-wider uppercase font-mono">
          {t.utility_consumption}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {lang === 'en'
            ? 'Accumulated electricity and water expenses (in USD value)'
            : 'ការចំណាយអគ្គិសនី និងទឹកសរុប (គិតជាតម្លៃដុល្លារ)'}
        </p>
      </div>

      <div className="relative w-full h-44 mt-auto" id="utility-outlay-chart-container">
        <svg className="w-full h-full" viewBox="0 0 350 150">
          <line x1="30" y1="20" x2="330" y2="20" stroke="#27272a" strokeWidth="1" />
          <line x1="30" y1="60" x2="330" y2="60" stroke="#27272a" strokeWidth="1" />
          <line x1="30" y1="100" x2="330" y2="100" stroke="#27272a" strokeWidth="1" />
          <line x1="30" y1="130" x2="330" y2="130" stroke="#3f3f46" strokeWidth="1" />

          <text x="25" y="23" textAnchor="end" fontSize="8" fill="#71717a" className="font-mono">$120</text>
          <text x="25" y="63" textAnchor="end" fontSize="8" fill="#71717a" className="font-mono">$80</text>
          <text x="25" y="103" textAnchor="end" fontSize="8" fill="#71717a" className="font-mono">$40</text>
          <text x="25" y="133" textAnchor="end" fontSize="8" fill="#71717a" className="font-mono">$0</text>

          <path d="M 60 130 L 60 60 Q 180 43 180 52 T 300 55 L 300 130 Z" fill="rgba(245, 158, 11, 0.1)" />
          <path d="M 60 60 Q 180 43 180 52 T 300 55" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />

          <path d="M 60 130 L 60 111 Q 180 102 180 108 T 300 108 L 300 130 Z" fill="rgba(99, 102, 241, 0.1)" />
          <path d="M 60 111 Q 180 102 180 108 T 300 108" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />

          <circle cx="60" cy="60" r="3.5" fill="#f59e0b" stroke="#18181b" strokeWidth="1" />
          <circle cx="180" cy="52" r="3.5" fill="#f59e0b" stroke="#18181b" strokeWidth="1" />
          <circle cx="300" cy="55" r="3.5" fill="#f59e0b" stroke="#18181b" strokeWidth="1" />

          <circle cx="60" cy="111" r="3.5" fill="#6366f1" stroke="#18181b" strokeWidth="1" />
          <circle cx="180" cy="108" r="3.5" fill="#6366f1" stroke="#18181b" strokeWidth="1" />
          <circle cx="300" cy="108" r="3.5" fill="#6366f1" stroke="#18181b" strokeWidth="1" />

          <text x="60" y="145" textAnchor="middle" fontSize="9" fontWeight="600" fill="#a1a1aa">
            {lang === 'en' ? 'April' : 'មេសា'}
          </text>
          <text x="180" y="145" textAnchor="middle" fontSize="9" fontWeight="600" fill="#a1a1aa">
            {lang === 'en' ? 'May' : 'ឧសភា'}
          </text>
          <text x="300" y="145" textAnchor="middle" fontSize="9" fontWeight="600" fill="#a1a1aa">
            {lang === 'en' ? 'June' : 'មិថុនា'}
          </text>
        </svg>
      </div>

      <div className="flex justify-center gap-6 mt-3 text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground font-mono">
          <span className="w-3 h-3 bg-amber-500 rounded-full block"></span>
          <span className="flex items-center gap-1">
            <Lightbulb className="w-3 h-3 text-amber-500" />
            {lang === 'en' ? 'Electricity' : 'អគ្គិសនី'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground font-mono">
          <span className="w-3 h-3 bg-indigo-550 rounded-full block bg-indigo-500"></span>
          <span className="flex items-center gap-1">
            <Droplet className="w-3 h-3 text-indigo-400" />
            {lang === 'en' ? 'Water' : 'ទឹកស្អាត'}
          </span>
        </div>
      </div>
    </div>
  );
}
