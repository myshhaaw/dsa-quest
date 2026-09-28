import Link from 'next/link';
import { Map, Swords, LayoutDashboard, ScrollText, Flame, Coins, Sparkles } from 'lucide-react';
import { XPBar } from './XPBar';
import { LogoutButton } from './LogoutButton';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/roadmap', label: 'Roadmap', icon: Map },
  { href: '/problems', label: 'Problems', icon: Swords },
  { href: '/quests', label: 'Quests', icon: ScrollText },
];

export function AppShell({
  user,
  children,
}: {
  user: { username: string; xp: number; coins: number; currentStreak: number; avatarClass: string };
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 border-b border-obsidian-700 bg-obsidian-950/90 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
            <Sparkles className="text-arcane-400" size={22} />
            <span className="font-display font-semibold text-lg tracking-tight">DSA Quest</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 ml-4">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-mist hover:text-parchment hover:bg-obsidian-800 transition-colors"
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 text-sm text-ember-400" title="Streak">
              <Flame size={16} />
              <span className="font-mono">{user.currentStreak}</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-sm text-ember-400" title="Coins">
              <Coins size={16} />
              <span className="font-mono">{user.coins}</span>
            </div>
            <XPBar xp={user.xp} compact />
            <LogoutButton />
          </div>
        </div>
        <nav className="md:hidden flex items-center justify-around border-t border-obsidian-800 px-2 py-1.5">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-[11px] text-mist hover:text-parchment"
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 py-8">{children}</main>
    </div>
  );
}
