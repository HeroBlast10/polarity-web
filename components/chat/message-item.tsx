'use client';

import { cn } from '@/lib/utils';

interface MessageItemProps {
  role: 'user' | 'assistant';
  content: string;
  persona?: 'advocatus' | 'inquisitor';
  isStreaming?: boolean;
}

export function MessageItem({ role, content, persona, isStreaming = false }: MessageItemProps) {
  const isUser = role === 'user';
  const isAdvocatus = persona === 'advocatus';
  const isInquisitor = persona === 'inquisitor';

  return (
    <div
      className={cn(
        'message-fade-in flex w-full px-4 md:px-0',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-5 py-4 text-[15px] leading-relaxed',
          isUser && 'bg-neutral-800/80 text-neutral-100',
          isAdvocatus && 'bg-green-500/5 border border-green-500/20 text-green-400/90',
          isInquisitor && 'bg-red-500/5 border border-red-500/20 text-red-400/90',
          !isUser && !persona && 'bg-neutral-900/50 text-neutral-300'
        )}
      >
        {content || '\u00A0'}
        {!isUser && isStreaming && <span className="typing-cursor" />}
      </div>
    </div>
  );
}
