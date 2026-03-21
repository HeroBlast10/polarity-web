'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { useSettings, useDuel } from '@/lib/store';
import { streamDuelChat } from '@/lib/api';
import { DuelMode } from '@/lib/types';
import { ArrowLeft, Play, Loader2, Swords, Gavel, Heart } from 'lucide-react';

const modeInfo = {
  court: { icon: Gavel, title: 'Court Mode', description: 'One lawyer, one prosecutor, both absolutely unhinged', color: 'cyan' },
  'troll-fight': { icon: Swords, title: 'Troll Fight', description: 'Two trolls in an infinite loop of mutual destruction', color: 'red' },
  'praise-battle': { icon: Heart, title: 'Praise Battle', description: 'Two yes-men competing to out-flatter each other', color: 'green' },
};

export default function DuelPage() {
  const router = useRouter();
  const { settings } = useSettings();
  const { duelState, updateDuelState, clearDuelState } = useDuel();
  const [localStarted, setLocalStarted] = useState(duelState.started);
  const advocatusRef = useRef<HTMLDivElement>(null);
  const inquisitorRef = useRef<HTMLDivElement>(null);

  const started = localStarted || duelState.started;

  const scrollToBottom = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom(advocatusRef);
  }, [duelState.advocatusText]);

  useEffect(() => {
    scrollToBottom(inquisitorRef);
  }, [duelState.inquisitorText]);

  useEffect(() => {
    setLocalStarted(duelState.started);
  }, [duelState.started]);

  const runDuel = useCallback(async () => {
    if (!duelState.topic.trim()) return;

    setLocalStarted(true);
    updateDuelState({ started: true });
    const rounds = duelState.rounds;
    const mode = duelState.mode;
    let history: { role: string; content: string }[] = [];

    for (let i = 0; i < rounds; i++) {
      updateDuelState({ round: i + 1, isThinking: 'advocatus' });

      let advText = '';
      try {
        for await (const chunk of streamDuelChat(settings, duelState.topic, 'advocatus', history)) {
          advText += chunk;
          updateDuelState({ advocatusText: duelState.advocatusText + chunk });
        }
      } catch (e) {
        advText = `Error: ${e instanceof Error ? e.message : 'Unknown error'}`;
        updateDuelState({ advocatusText: duelState.advocatusText + advText });
      }

      history = [...history, { role: 'user', content: duelState.topic }, { role: 'assistant', content: advText }];

      if (mode === 'court') {
        updateDuelState({ isThinking: 'inquisitor' });
        let inqText = '';
        try {
          for await (const chunk of streamDuelChat(settings, duelState.topic, 'inquisitor', history)) {
            inqText += chunk;
            updateDuelState({ inquisitorText: duelState.inquisitorText + chunk });
          }
        } catch (e) {
          inqText = `Error: ${e instanceof Error ? e.message : 'Unknown error'}`;
          updateDuelState({ inquisitorText: duelState.inquisitorText + inqText });
        }
        history = [...history, { role: 'user', content: duelState.topic }, { role: 'assistant', content: inqText }];
      } else if (mode === 'troll-fight') {
        updateDuelState({ isThinking: 'inquisitor' });
        let inqText = '';
        try {
          for await (const chunk of streamDuelChat(settings, advText, 'inquisitor', history)) {
            inqText += chunk;
            updateDuelState({ inquisitorText: duelState.inquisitorText + chunk });
          }
        } catch (e) {
          inqText = `Error: ${e instanceof Error ? e.message : 'Unknown error'}`;
          updateDuelState({ inquisitorText: duelState.inquisitorText + inqText });
        }
        history = [...history, { role: 'assistant', content: inqText }];
      } else if (mode === 'praise-battle') {
        updateDuelState({ isThinking: 'inquisitor' });
        let inqText = '';
        try {
          for await (const chunk of streamDuelChat(settings, advText, 'advocatus', history)) {
            inqText += chunk;
            updateDuelState({ inquisitorText: duelState.inquisitorText + chunk });
          }
        } catch (e) {
          inqText = `Error: ${e instanceof Error ? e.message : 'Unknown error'}`;
          updateDuelState({ inquisitorText: duelState.inquisitorText + inqText });
        }
        history = [...history, { role: 'assistant', content: inqText }];
      }

      await new Promise(r => setTimeout(r, 500));
    }

    updateDuelState({ isThinking: null, history });
  }, [duelState.topic, duelState.rounds, duelState.mode, duelState.advocatusText, duelState.inquisitorText, settings, updateDuelState]);

  const reset = () => {
    setLocalStarted(false);
    clearDuelState();
  };

  const ModeIcon = modeInfo[duelState.mode as keyof typeof modeInfo].icon;

  return (
    <div className="flex h-[calc(100vh-57px)] flex-col">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center border-b border-neutral-800 bg-card px-4 py-3">
        <div className="justify-self-start">
        <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="text-neutral-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        </div>
        <div className="flex items-center justify-center gap-3 justify-self-center text-center">
          <ModeIcon className={`h-5 w-5 text-cyan-500`} />
          <span className="font-medium text-white">{modeInfo[duelState.mode].title}</span>
          {started && <span className="text-sm text-neutral-500">Round {duelState.round}/{duelState.rounds}</span>}
        </div>
        <div />
      </div>

      {!started ? (
        <div className="flex flex-1 items-center justify-center p-4">
          <Card className="w-full max-w-md border-neutral-800 bg-card">
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-neutral-300">Mode</Label>
                  <Select value={duelState.mode} onValueChange={(v: DuelMode) => updateDuelState({ mode: v, rounds: 3 })}>
                    <SelectTrigger className="border-neutral-700 bg-neutral-900 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-neutral-700 bg-neutral-900 text-white">
                      <SelectItem value="court">Court Mode</SelectItem>
                      <SelectItem value="troll-fight">Troll Fight</SelectItem>
                      <SelectItem value="praise-battle">Praise Battle</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-neutral-500">{modeInfo[duelState.mode].description}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-neutral-300">Topic</Label>
                  <Input
                    value={duelState.topic}
                    onChange={(e) => updateDuelState({ topic: e.target.value })}
                    placeholder="Enter your topic..."
                    className="border-neutral-700 bg-neutral-900 text-white placeholder:text-neutral-500"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label className="text-neutral-300">Rounds</Label>
                    <span className="text-sm text-neutral-400">{duelState.rounds}</span>
                  </div>
                  <Slider
                    value={[duelState.rounds]}
                    onValueChange={(value) => updateDuelState({ rounds: Array.isArray(value) ? value[0] : value })}
                    min={1}
                    max={10}
                    step={1}
                    className="py-2"
                  />
                </div>

                <Button onClick={runDuel} disabled={!duelState.topic.trim()} className="w-full bg-white text-black hover:bg-neutral-200">
                  <Play className="mr-2 h-4 w-4" />
                  Start Duel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          <div className="flex w-1/2 flex-col border-r border-neutral-800">
            <div className="border-b border-neutral-800 bg-neutral-900/50 px-4 py-2">
              <span className="font-medium text-green-400">Advocatus</span>
              {duelState.isThinking === 'advocatus' && <Loader2 className="ml-2 h-4 w-4 animate-spin text-green-400" />}
            </div>
            <div ref={advocatusRef} className="flex-1 overflow-y-auto p-4 text-green-400 whitespace-pre-wrap">
              {duelState.advocatusText || 'Waiting...'}
              {duelState.isThinking === 'advocatus' && <span className="typing-cursor" />}
            </div>
          </div>
          <div className="flex w-1/2 flex-col">
            <div className="border-b border-neutral-800 bg-neutral-900/50 px-4 py-2">
              <span className="font-medium text-red-400">
                {duelState.mode === 'praise-battle' ? 'Advocatus B' : 'Inquisitor'}
              </span>
              {duelState.isThinking === 'inquisitor' && <Loader2 className="ml-2 h-4 w-4 animate-spin text-red-400" />}
            </div>
            <div ref={inquisitorRef} className="flex-1 overflow-y-auto p-4 text-red-400 whitespace-pre-wrap">
              {duelState.inquisitorText || 'Waiting...'}
              {duelState.isThinking === 'inquisitor' && <span className="typing-cursor" />}
            </div>
          </div>
        </div>
      )}

      {started && !duelState.isThinking && (
        <div className="flex justify-center gap-2 border-t border-neutral-800 bg-card p-4">
          <Button onClick={reset} variant="outline" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white">
            New Duel
          </Button>
        </div>
      )}
    </div>
  );
}
