'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MessageList } from '@/components/chat/message-list';
import { ChatInput } from '@/components/chat/chat-input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSettings, useChat } from '@/lib/store';
import { streamChat } from '@/lib/api';
import { Persona, ChatMessage } from '@/lib/types';
import { Trash2, Loader2, ArrowLeft, Settings } from 'lucide-react';

export default function ChatPage() {
  const router = useRouter();
  const { settings } = useSettings();
  const { messages, currentPersona, isLoading, setPersona, addMessage, updateLastMessage, clearMessages, setLoading } = useChat();
  const [streamContent, setStreamContent] = useState('');

  const handleSend = useCallback(async (message: string) => {
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

    try {
      let content = '';
      for await (const chunk of streamChat(settings, message, messages, currentPersona)) {
        content += chunk;
        setStreamContent(content);
        updateLastMessage(content);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      updateLastMessage(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
      setStreamContent('');
    }
  }, [settings, messages, currentPersona, addMessage, updateLastMessage, setLoading]);

  const handlePersonaChange = (value: string) => {
    setPersona(value as Persona);
    clearMessages();
  };

  return (
    <div className="flex h-[calc(100vh-57px)] flex-col">
      <div className="flex items-center justify-between border-b border-neutral-800 bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="text-neutral-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Tabs value={currentPersona} onValueChange={handlePersonaChange}>
            <TabsList className="bg-neutral-900">
              <TabsTrigger value="advocatus" className="data-[state=active]:bg-advocatus data-[state=active]:text-black">
                Advocatus
              </TabsTrigger>
              <TabsTrigger value="inquisitor" className="data-[state=active]:bg-inquisitor data-[state=active]:text-white">
                Inquisitor
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <Button variant="ghost" size="sm" onClick={clearMessages} disabled={messages.length === 0} className="text-neutral-400 hover:text-white">
          <Trash2 className="mr-2 h-4 w-4" />
          Clear
        </Button>
      </div>

      <MessageList messages={messages} />

      <div className="border-t border-neutral-800 bg-card p-4">
        <div className="mx-auto max-w-4xl">
          {isLoading && (
            <div className="mb-2 flex items-center gap-2 text-sm text-neutral-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{currentPersona === 'advocatus' ? 'Advocatus is thinking...' : 'Inquisitor is judging...'}</span>
            </div>
          )}
          <ChatInput
            onSend={handleSend}
            disabled={isLoading}
            placeholder={currentPersona === 'advocatus' ? 'Tell Advocatus why you\'re right...' : 'Present your argument to Inquisitor...'}
          />
        </div>
      </div>
    </div>
  );
}
