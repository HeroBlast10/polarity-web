'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MessageSquare, Swords, Settings, ArrowRight, PlayCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { startLiveDemoSession } from '@/lib/demo';

export default function Home() {
  const router = useRouter();

  const handleLiveDemo = () => {
    startLiveDemoSession();
    router.push('/chat');
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-57px)] flex-col items-center justify-center px-4 py-12">
      <div className="mb-12 text-center">
        <Image
          src="/logo.png"
          alt="Polarity"
          width={176}
          height={176}
          className="mx-auto mb-8 h-36 w-36 object-contain md:h-44 md:w-44"
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

      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <Button
          onClick={handleLiveDemo}
          className="rounded-full bg-white px-7 py-6 text-black hover:bg-neutral-200"
        >
          <PlayCircle className="mr-2 h-5 w-5" />
          Live Demo
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <p className="max-w-md text-sm leading-relaxed text-neutral-500">
          Jump straight into Single Chat with the built-in API configuration. Trial is limited to 5 messages.
        </p>
      </div>

      <div className="mb-12 flex items-center gap-6 text-sm text-neutral-500">
        <Link href="/settings" className="flex items-center gap-2 hover:text-white transition-colors">
          <Settings className="h-4 w-4" />
          Configure API
        </Link>
        <span className="text-neutral-700">|</span>
        <span className="text-neutral-600">Bring your own key</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        <Link href="/settings?redirect=chat" className="group">
          <Card className="h-full border border-neutral-800 bg-card transition-all duration-500 hover:border-green-500/30 hover:bg-neutral-900/50 cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <div className="mb-6 rounded-full bg-green-500/5 p-5 group-hover:bg-green-500/10 transition-colors">
                <MessageSquare className="h-7 w-7 text-green-500" />
              </div>
              <h2 className="text-2xl font-medium text-white mb-3" style={{ fontFamily: 'var(--font-dm-sans)' }}>
                Single Chat
              </h2>
              <p className="text-neutral-400 mb-6 leading-relaxed">
                Configure your API first, then jump into a one-on-one debate with Advocatus or Inquisitor.
              </p>
              <Button variant="outline" size="sm" className="group-hover:bg-green-500/10 group-hover:text-green-400 group-hover:border-green-500/30 transition-all rounded-full px-6">
                Configure <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/settings?redirect=chat" className="group">
          <Card className="h-full border border-neutral-800 bg-card transition-all duration-500 hover:border-red-500/30 hover:bg-neutral-900/50 cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <div className="mb-6 rounded-full bg-red-500/5 p-5 group-hover:bg-red-500/10 transition-colors">
                <Swords className="h-7 w-7 text-red-500" />
              </div>
              <h2 className="text-2xl font-medium text-white mb-3" style={{ fontFamily: 'var(--font-dm-sans)' }}>
                Duel Mode
              </h2>
              <p className="text-neutral-400 mb-6 leading-relaxed">
                Set up your API on the next screen, then continue into chat before heading to the arena.
              </p>
              <Button variant="outline" size="sm" className="group-hover:bg-red-500/10 group-hover:text-red-400 group-hover:border-red-500/30 transition-all rounded-full px-6">
                Configure <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
