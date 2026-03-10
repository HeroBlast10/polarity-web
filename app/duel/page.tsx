'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { useSettings } from '@/lib/store';
import { streamDuelChat } from '@/lib/api';
import { DuelMode } from '@/lib/types';
import { ArrowLeft, Play, Loader2, Swords, Gavel, Heart } from 'lucide-react';

interface DuelState {
  round: number;
  topic: string;
  mode: DuelMode;
  rounds: number;
  advocatusText: string;
  inquisitorText: string;
  isThinking: 'advocatus' | 'inquisitor' | null;
  history: { role: string; content: string }[];
}

const initialState: DuelState = {
  round: 0,
  topic: '',
  mode: 'court',
  rounds: 3,
  advocatusText: '',
  inquisitorText: '',
  isThinking: null,
  history: [],
};

const modeInfo = {
  court: { icon: Gavel, title: 'Court Mode', description: 'One lawyer, one prosecutor, both absolutely unhinged', color: 'cyan' },
  'troll-fight': { icon: Swords, title: 'Troll Fight', description: 'Two trolls in an infinite loop of mutual destruction', color: 'red' },
  'praise-battle': { icon: Heart, title: 'Praise Battle', description: 'Two yes-men competing to out-flatter each other', color: 'green' },
};

export default function DuelPage() {
  const router = useRouter();
  const { settings } = useSettings();
  const [state, setState] = useState<DuelState>(initialState);
  const [started, setStarted] = useState(false);
  const advocatusRef = useRef<HTMLDivElement>(null);
  const inquisitorRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom(advocatusRef);
  }, [state.advocatusText]);

  useEffect(() => {
    scrollToBottom(inquisitorRef);
  }, [state.inquisitorText]);

  const runDuel = useCallback(async () => {
    if (!state.topic.trim()) return;
    
    setStarted(true);
    const rounds = state.rounds;
    const mode = state.mode;
    let history: { role: string; content: string }[] = [];

    for (let i = 0; i < rounds; i++) {
      setState(s => ({ ...s, round: i + 1, isThinking: 'advocatus' }));
      
      let advText = '';
      try {
        for await (const chunk of streamDuelChat(settings, state.topic, 'advocatus', history)) {
          advText += chunk;
          setState(s => ({ ...s, advocatusText: s.advocatusText + chunk }));
        }
      } catch (e) {
        advText = `Error: ${e instanceof Error ? e.message : 'Unknown error'}`;
        setState(s => ({ ...s, advocatusText: s.advocatusText + advText }));
      }

      history = [...history, { role: 'user', content: state.topic }, { role: 'assistant', content: advText }];
      
      if (mode === 'court') {
        setState(s => ({ ...s, isThinking: 'inquisitor' }));
        let inqText = '';
        try {
          for await (const chunk of streamDuelChat(settings, state.topic, 'inquisitor', history)) {
            inqText += chunk;
            setState(s => ({ ...s, inquisitorText: s.inquisitorText + chunk }));
          }
        } catch (e) {
          inqText = `Error: ${e instanceof Error ? e.message : 'Unknown error'}`;
          setState(s => ({ ...s, inquisitorText: s.inquisitorText + inqText }));
        }
        history = [...history, { role: 'user', content: state.topic }, { role: 'assistant', content: inqText }];
      } else if (mode === 'troll-fight') {
        setState(s => ({ ...s, isThinking: 'inquisitor' }));
        let inqText = '';
        try {
          for await (const chunk of streamDuelChat(settings, advText, 'inquisitor', history)) {
            inqText += chunk;
            setState(s => ({ ...s, inquisitorText: s.inquisitorText + chunk }));
          }
        } catch (e) {
          inqText = `Error: ${e instanceof Error ? e.message : 'Unknown error'}`;
          setState(s => ({ ...s, inquisitorText: s.inquisitorText + inqText }));
        }
        history = [...history, { role: 'assistant', content: inqText }];
      } else if (mode === 'praise-battle') {
        setState(s => ({ ...s, isThinking: 'inquisitor' }));
        let inqText = '';
        try {
          for await (const chunk of streamDuelChat(settings, advText, 'advocatus', history)) {
            inqText += chunk;
            setState(s => ({ ...s, inquisitorText: s.inquisitorText + chunk }));
          }
        } catch (e) {
          inqText = `Error: ${e instanceof Error ? e.message : 'Unknown error'}`;
          setState(s => ({ ...s, inquisitorText: s.inquisitorText + inqText }));
        }
        history = [...history, { role: 'assistant', content: inqText }];
      }

      await new Promise(r => setTimeout(r, 500));
    }

    setState(s => ({ ...s, isThinking: null, history }));
  }, [state.topic, state.rounds, state.mode, settings]);

  const reset = () => {
    setStarted(false);
    setState(initialState);
  };

  const ModeIcon = modeInfo[state.mode].icon;

  return (
    <div className="flex h-[calc(100vh-57px)] flex-col">
      <div className="flex items-center gap-3 border-b border-neutral-800 bg-card px-4 py-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="text-neutral-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <ModeIcon className={`h-5 w-5 text-${modeInfo[state.mode].color}-500`} />
        <span className="font-medium text-white">{modeInfo[state.mode].title}</span>
        {started && <span className="text-sm text-neutral-500">Round {state.round}/{state.rounds}</span>}
      </div>

      {!started ? (
        <div className="flex flex-1 items-center justify-center p-4">
          <Card className="w-full max-w-md border-neutral-800 bg-card">
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-neutral-300">Mode</Label>
                  <Select value={state.mode} onValueChange={(v: DuelMode) => setState(s => ({ ...s, mode: v, rounds: 3 }))}>
                    <SelectTrigger className="border-neutral-700 bg-neutral-900 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-neutral-700 bg-neutral-900 text-white">
                      <SelectItem value="court">Court Mode</SelectItem>
                      <SelectItem value="troll-fight">Troll Fight</SelectItem>
                      <SelectItem value="praise-battle">Praise Battle</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-neutral-500">{modeInfo[state.mode].description}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-neutral-300">Topic</Label>
                  <Input
                    value={state.topic}
                    onChange={(e) => setState(s => ({ ...s, topic: e.target.value }))}
                    placeholder="Enter your topic..."
                    className="border-neutral-700 bg-neutral-900 text-white placeholder:text-neutral-500"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label className="text-neutral-300">Rounds</Label>
                    <span className="text-sm text-neutral-400">{state.rounds}</span>
                  </div>
                  <Slider
                    value={[state.rounds]}
                    onValueChange={(value) => setState(s => ({ ...s, rounds: Array.isArray(value) ? value[0] : value }))}
                    min={1}
                    max={10}
                    step={1}
                    className="py-2"
                  />
                </div>

                <Button onClick={runDuel} disabled={!state.topic.trim()} className="w-full bg-white text-black hover:bg-neutral-200">
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
              {state.isThinking === 'advocatus' && <Loader2 className="ml-2 h-4 w-4 animate-spin text-green-400" />}
            </div>
            <div ref={advocatusRef} className="flex-1 overflow-y-auto p-4 text-green-400 whitespace-pre-wrap">
              {state.advocatusText || 'Waiting...'}
            </div>
          </div>
          <div className="flex w-1/2 flex-col">
            <div className="border-b border-neutral-800 bg-neutral-900/50 px-4 py-2">
              <span className="font-medium text-red-400">
                {state.mode === 'praise-battle' ? 'Advocatus B' : 'Inquisitor'}
              </span>
              {state.isThinking === 'inquisitor' && <Loader2 className="ml-2 h-4 w-4 animate-spin text-red-400" />}
            </div>
            <div ref={inquisitorRef} className="flex-1 overflow-y-auto p-4 text-red-400 whitespace-pre-wrap">
              {state.inquisitorText || 'Waiting...'}
            </div>
          </div>
        </div>
      )}

      {started && !state.isThinking && (
        <div className="flex justify-center gap-2 border-t border-neutral-800 bg-card p-4">
          <Button onClick={reset} variant="outline" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white">
            New Duel
          </Button>
        </div>
      )}
    </div>
  );
}
