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
    <ScrollArea className="flex-1 px-4" ref={scrollRef}>
      <div className="space-y-4 py-4">
        {messages.length === 0 && (
          <div className="flex h-32 flex-col items-center justify-center text-neutral-500">
            <p className="text-sm">Start a conversation...</p>
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
