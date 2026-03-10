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
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <span className="text-white">POLARITY</span>
          <span className="text-neutral-500">.ai</span>
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
                  'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-neutral-800 text-white'
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
