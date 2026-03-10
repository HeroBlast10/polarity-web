'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings, MessageSquare, Swords } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Header() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home', icon: null },
    { href: '/chat', label: 'Chat', icon: MessageSquare },
    { href: '/duel', label: 'Duel', icon: Swords },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-800/50 bg-black/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-1 text-lg font-medium tracking-tight">
          <span className="text-white" style={{ fontFamily: 'var(--font-instrument-serif)' }}>POLARITY</span>
          <span className="text-neutral-600">.ai</span>
        </Link>
        <nav className="flex items-center gap-1">
          {navItems.slice(1).map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-white text-black'
                    : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
                )}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
