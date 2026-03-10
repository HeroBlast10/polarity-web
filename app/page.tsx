'use client';

import Link from 'next/link';
import { MessageSquare, Swords, Settings, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-57px)] flex-col items-center justify-center px-4">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold tracking-tight text-white mb-4">
          POLARITY<span className="text-neutral-500">.ai</span>
        </h1>
        <p className="text-xl text-neutral-400 max-w-lg mx-auto">
          The Anti-Alignment AI Agent that <span className="text-green-400">proves</span> you&apos;re right or <span className="text-red-400">destroys</span> your logic.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full mb-12">
        <Link href="/chat" className="group">
          <Card className="h-full border-neutral-800 bg-card transition-all duration-300 hover:border-green-500/50 hover:shadow-[0_0_30px_rgba(34,197,94,0.1)] cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
              <div className="mb-4 rounded-full bg-green-500/10 p-4">
                <MessageSquare className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Single Chat</h2>
              <p className="text-neutral-400 mb-4">
                Chat with Advocatus (your yes-man) or Inquisitor (the eternal skeptic).
              </p>
              <Button variant="outline" className="group-hover:bg-green-500/10 group-hover:text-green-400 group-hover:border-green-500/50 transition-all">
                Start Chat <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/duel" className="group">
          <Card className="h-full border-neutral-800 bg-card transition-all duration-300 hover:border-red-500/50 hover:shadow-[0_0_30px_rgba(239,68,68,0.1)] cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
              <div className="mb-4 rounded-full bg-red-500/10 p-4">
                <Swords className="h-8 w-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Duel Mode</h2>
              <p className="text-neutral-400 mb-4">
                Pit two AI against each other in Court, Troll Fight, or Praise Battle.
              </p>
              <Button variant="outline" className="group-hover:bg-red-500/10 group-hover:text-red-400 group-hover:border-red-500/50 transition-all">
                Enter Arena <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="flex items-center gap-4 text-sm text-neutral-500">
        <Link href="/settings" className="flex items-center gap-2 hover:text-white transition-colors">
          <Settings className="h-4 w-4" />
          Configure API
        </Link>
        <span>|</span>
        <span>Bring your own API key</span>
      </div>
    </div>
  );
}
