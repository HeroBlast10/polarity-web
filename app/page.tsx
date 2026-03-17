'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MessageSquare, Swords, Settings, ArrowRight, PlayCircle, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { startLiveDemoSession } from '@/lib/demo';

const GITHUB_URL = 'https://github.com/HeroBlast10/polarity-agent';

export default function Home() {
  const router = useRouter();

  const handleLiveDemo = () => {
    startLiveDemoSession();
    router.push('/chat');
  };

  return (
    <div className="relative flex min-h-[calc(100vh-57px)] flex-col items-center px-4 pb-16 pt-10 md:pt-14">

      {/* ── 主体内容，垂直居中 ── */}
      <div className="flex w-full flex-1 flex-col items-center justify-center">

        {/* Logo + 标题区块 */}
        <div className="mb-6 text-center">
          <Image
            src="/logo.png"
            alt="Polarity"
            width={208}
            height={208}
            className="mx-auto mb-3 h-44 w-44 object-contain md:h-52 md:w-52"
            priority
          />
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">
            The Anti-Alignment AI Agent
          </p>
          <h1 className="mb-3 text-5xl font-normal tracking-[0.24em] text-white md:text-7xl" style={{ fontFamily: 'var(--font-instrument-serif)' }}>
            POLARITY
          </h1>
          <p className="mx-auto max-w-lg text-lg leading-relaxed text-neutral-400 md:text-xl">
            <span className="text-green-400">Prove</span> you&apos;re right or <span className="text-red-400">destroy</span> your logic.
          </p>
          <p className="mx-auto mt-1 max-w-lg text-lg leading-relaxed text-neutral-400 md:text-xl">
            The AI that picks a side.
          </p>
        </div>

        {/* CTA 按钮区块 */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-neutral-800 px-4 py-2 text-sm text-neutral-400 transition-colors hover:border-neutral-700 hover:text-white"
          >
            <Star className="h-4 w-4" />
            Give us a star on GitHub
          </Link>
          <Button
            onClick={handleLiveDemo}
            className="rounded-full bg-white px-6 py-4 text-black hover:bg-neutral-200"
          >
            <PlayCircle className="mr-2 h-5 w-5" />
            Live Demo
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* 功能卡片 */}
        <div className="grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
          <Link href="/settings?redirect=chat" className="group">
            <Card size="sm" className="h-full cursor-pointer border border-neutral-800 bg-card transition-all duration-500 hover:border-green-500/30 hover:bg-neutral-900/50">
              <CardContent className="flex flex-col items-center justify-center p-6 text-center md:p-7">
                <div className="mb-3 rounded-full bg-green-500/5 p-3.5 transition-colors group-hover:bg-green-500/10">
                  <MessageSquare className="h-5 w-5 text-green-500" />
                </div>
                <h2 className="mb-2 text-lg font-medium text-white md:text-xl" style={{ fontFamily: 'var(--font-dm-sans)' }}>
                  Single Chat
                </h2>
                <p className="mb-4 text-sm leading-7 text-neutral-400">
                  Configure your API first, then jump into a one-on-one debate with Advocatus or Inquisitor.
                </p>
                <Button variant="outline" size="sm" className="rounded-full px-6 transition-all group-hover:border-green-500/30 group-hover:bg-green-500/10 group-hover:text-green-400">
                  Configure <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/settings?redirect=chat" className="group">
            <Card size="sm" className="h-full cursor-pointer border border-neutral-800 bg-card transition-all duration-500 hover:border-red-500/30 hover:bg-neutral-900/50">
              <CardContent className="flex flex-col items-center justify-center p-6 text-center md:p-7">
                <div className="mb-3 rounded-full bg-red-500/5 p-3.5 transition-colors group-hover:bg-red-500/10">
                  <Swords className="h-5 w-5 text-red-500" />
                </div>
                <h2 className="mb-2 text-lg font-medium text-white md:text-xl" style={{ fontFamily: 'var(--font-dm-sans)' }}>
                  Duel Mode
                </h2>
                <p className="mb-4 text-sm leading-7 text-neutral-400">
                  Set up your API on the next screen, then continue into chat before heading to the arena.
                </p>
                <Button variant="outline" size="sm" className="rounded-full px-6 transition-all group-hover:border-red-500/30 group-hover:bg-red-500/10 group-hover:text-red-400">
                  Configure <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* ── Configure API 固定在页面底部 ── */}
      <div className="absolute bottom-5 left-0 right-0 flex items-center justify-center gap-4 text-sm text-neutral-500">
        <Link href="/settings" className="flex items-center gap-2 transition-colors hover:text-white">
          <Settings className="h-4 w-4" />
          Configure API
        </Link>
        <span className="text-neutral-700">|</span>
        <span className="text-neutral-600">Bring your own key</span>
      </div>

    </div>
  );
}
