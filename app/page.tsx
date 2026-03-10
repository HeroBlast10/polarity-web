'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MessageSquare, Swords, Settings, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-57px)] flex-col items-center justify-center px-4">
      <div className="text-center mb-16">
        <Image
          src="/logo.png"
          alt="Polarity"
          width={120}
          height={120}
          className="mx-auto mb-6 h-24 w-24 md:h-32 md:w-32 object-contain"
          priority
        />
        <p className="text-sm font-medium text-neutral-500 tracking-[0.2em] uppercase mb-4">
          The Anti-Alignment AI Agent
        </p>
        <h1 className="text-6xl md:text-8xl font-normal tracking-[0.3em] text-white mb-6" style={{ fontFamily: 'var(--font-instrument-serif)' }}>
          POLARITY
        </h1>
        <p className="text-xl text-neutral-400 max-w-lg mx-auto leading-relaxed">
          <span className="text-green-400">Prove</span> you&apos;re right or <span className="text-red-400">destroy</span> your logic.
        </p>
        <p className="text-xl text-neutral-400 max-w-lg mx-auto leading-relaxed mt-2">
          The AI that picks a side.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full mb-16">
        <Link href="/chat" className="group">
          <Card className="h-full border border-neutral-800 bg-card transition-all duration-500 hover:border-green-500/30 hover:bg-neutral-900/50 cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <div className="mb-6 rounded-full bg-green-500/5 p-5 group-hover:bg-green-500/10 transition-colors">
                <MessageSquare className="h-7 w-7 text-green-500" />
              </div>
              <h2 className="text-2xl font-medium text-white mb-3" style={{ fontFamily: 'var(--font-dm-sans)' }}>
                Single Chat
              </h2>
              <p className="text-neutral-400 mb-6 leading-relaxed">
                Chat with Advocatus or Inquisitor. Experience the power of agreement or disagreement.
              </p>
              <Button variant="outline" size="sm" className="group-hover:bg-green-500/10 group-hover:text-green-400 group-hover:border-green-500/30 transition-all rounded-full px-6">
                Start <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/duel" className="group">
          <Card className="h-full border border-neutral-800 bg-card transition-all duration-500 hover:border-red-500/30 hover:bg-neutral-900/50 cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <div className="mb-6 rounded-full bg-red-500/5 p-5 group-hover:bg-red-500/10 transition-colors">
                <Swords className="h-7 w-7 text-red-500" />
              </div>
              <h2 className="text-2xl font-medium text-white mb-3" style={{ fontFamily: 'var(--font-dm-sans)' }}>
                Duel Mode
              </h2>
              <p className="text-neutral-400 mb-6 leading-relaxed">
                Pit two AI against each other. Watch them debate, fight, or compliment each other.
              </p>
              <Button variant="outline" size="sm" className="group-hover:bg-red-500/10 group-hover:text-red-400 group-hover:border-red-500/30 transition-all rounded-full px-6">
                Enter Arena <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="flex items-center gap-6 text-sm text-neutral-500">
        <Link href="/settings" className="flex items-center gap-2 hover:text-white transition-colors">
          <Settings className="h-4 w-4" />
          Configure API
        </Link>
        <span className="text-neutral-700">|</span>
        <span className="text-neutral-600">Bring your own key</span>
      </div>
    </div>
  );
}
