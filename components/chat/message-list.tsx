'use client';

import { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageItem } from './message-item';
import { ChatMessage } from '@/lib/types';

interface MessageListProps {
  messages: ChatMessage[];
}

export function MessageList({ messages }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <ScrollArea className="flex-1 px-4 md:px-0" ref={scrollRef}>
      <div className="space-y-4 py-8 max-w-3xl mx-auto">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 text-neutral-600">
            <p className="text-sm font-mono">Start a conversation...</p>
          </div>
        )}
        {messages.map((msg) => (
          <MessageItem
            key={msg.id}
            role={msg.role}
            content={msg.content}
            persona={msg.persona}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
