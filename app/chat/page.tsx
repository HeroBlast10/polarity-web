'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageList } from '@/components/chat/message-list';
import { ChatInput } from '@/components/chat/chat-input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSettings, useChat } from '@/lib/store';
import { streamChat } from '@/lib/api';
import { getLiveDemoSession, incrementLiveDemoUsage, LIVE_DEMO_SETTINGS, type LiveDemoSession } from '@/lib/demo';
import { Persona, ChatMessage } from '@/lib/types';
import { Trash2, Loader2, ArrowLeft } from 'lucide-react';

export default function ChatPage() {
  const router = useRouter();
  const { settings } = useSettings();
  const { messages, currentPersona, isLoading, setPersona, addMessage, updateLastMessage, clearMessages, setLoading } = useChat();
  const [demoSession, setDemoSession] = useState<LiveDemoSession>(() => getLiveDemoSession());

  useEffect(() => {
    setDemoSession(getLiveDemoSession());
  }, []);

  const isLiveDemo = demoSession.active;
  const remainingDemoMessages = Math.max(0, demoSession.limit - demoSession.messagesUsed);
  const hasReachedLiveDemoLimit = isLiveDemo && remainingDemoMessages === 0;

  const handleSend = useCallback(async (message: string) => {
    if (hasReachedLiveDemoLimit) {
      return;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: Date.now(),
    };
    addMessage(userMsg);
    setLoading(true);

    const assistantMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      persona: currentPersona,
      timestamp: Date.now(),
    };
    addMessage(assistantMsg);

    // Live Demo 直接使用内置 DeepSeek 配置，不依赖后端环境变量
    const activeSettings = isLiveDemo
      ? { ...settings, ...LIVE_DEMO_SETTINGS }
      : settings;

    try {
      let content = '';
      for await (const chunk of streamChat(activeSettings, message, messages, currentPersona, {
        onReady: () => {
          if (isLiveDemo) {
            setDemoSession(incrementLiveDemoUsage());
          }
        },
      })) {
        content += chunk;
        updateLastMessage(content);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      updateLastMessage(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  }, [addMessage, currentPersona, hasReachedLiveDemoLimit, isLiveDemo, messages, setLoading, settings, updateLastMessage]);

  const handlePersonaChange = (value: string) => {
    setPersona(value as Persona);
    clearMessages();
  };

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center border-b border-neutral-800/50 bg-card/50 px-6 py-4">
        <div className="justify-self-start">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="text-neutral-400 hover:text-white rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
        <div className="justify-self-center">
          <Tabs value={currentPersona} onValueChange={handlePersonaChange}>
            <TabsList className="bg-neutral-900/50 h-10">
              <TabsTrigger 
                value="advocatus" 
                className="data-[state=active]:bg-green-500 data-[state=active]:text-black data-[state=active]:shadow-none px-6 rounded-full"
              >
                Advocatus
              </TabsTrigger>
              <TabsTrigger 
                value="inquisitor" 
                className="data-[state=active]:bg-red-500 data-[state=active]:text-white data-[state=active]:shadow-none px-6 rounded-full"
              >
                Inquisitor
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="justify-self-end">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearMessages} 
          disabled={messages.length === 0} 
          className="text-neutral-500 hover:text-white rounded-full px-4"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Clear
        </Button>
        </div>
      </div>

      {isLiveDemo && (
        <div className="border-b border-neutral-800/50 bg-neutral-950/70">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3 md:px-6">
            <div>
              <p className="text-sm font-medium text-white">Live Demo</p>
              <p className="text-sm text-neutral-400">
                {hasReachedLiveDemoLimit
                  ? '5-message trial limit reached. Configure your API to keep chatting.'
                  : `Using the built-in API configuration. ${remainingDemoMessages}/${demoSession.limit} messages remaining.`}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/settings?redirect=chat')}
              className="border-neutral-800 text-neutral-300 hover:bg-neutral-900 hover:text-white rounded-full px-4"
            >
              Configure API
            </Button>
          </div>
        </div>
      )}

      <MessageList messages={messages} />

      <div className="border-t border-neutral-800/50 bg-card/50 backdrop-blur-sm p-4 md:p-6">
        <div className="mx-auto max-w-3xl">
          {isLoading && (
            <div className="mb-3 flex items-center gap-2 text-sm text-neutral-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="font-mono text-xs">
                {currentPersona === 'advocatus' ? 'Advocatus is thinking...' : 'Inquisitor is judging...'}
              </span>
            </div>
          )}
          <ChatInput
            onSend={handleSend}
            disabled={hasReachedLiveDemoLimit}
            loading={isLoading}
            placeholder={
              hasReachedLiveDemoLimit
                ? 'Live Demo limit reached. Configure your API to continue.'
                : currentPersona === 'advocatus'
                  ? 'Tell Advocatus why you\'re right...'
                  : 'Present your argument to Inquisitor...'
            }
          />
        </div>
      </div>
    </div>
  );
}
