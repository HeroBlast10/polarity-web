'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Settings, MessageSquare, Swords, Printer, Github } from 'lucide-react';
import { cn } from '@/lib/utils';

const GITHUB_URL = 'https://github.com/HeroBlast10/polarity-agent';

export function Header() {
  const pathname = usePathname();

  const handlePrint = () => {
    window.print();
  };

  const navItems = [
    { href: '/', label: 'Home', icon: null },
    { href: '/chat', label: 'Chat', icon: MessageSquare },
    { href: '/duel', label: 'Duel', icon: Swords },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-800/50 bg-black/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3 text-lg font-medium tracking-[0.15em]">
          <Image
            src="/logo.png"
            alt="Polarity"
            width={44}
            height={44}
            className="h-11 w-11 shrink-0 object-contain"
            priority
          />
          <span className="text-white tracking-[0.15em]" style={{ fontFamily: 'var(--font-instrument-serif)' }}>POLARITY</span>
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-neutral-400 transition-all duration-200 hover:bg-neutral-900 hover:text-white"
            title="Open project on GitHub"
          >
            <Github className="h-4 w-4" />
            GitHub
          </Link>
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
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-neutral-400 transition-all duration-200 hover:bg-neutral-900 hover:text-white"
            title="Print / Save as PDF"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
        </nav>
      </div>
    </header>
  );
}
