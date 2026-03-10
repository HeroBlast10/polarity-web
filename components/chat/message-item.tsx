'use client';

import { cn } from '@/lib/utils';

interface MessageItemProps {
  role: 'user' | 'assistant';
  content: string;
  persona?: 'advocatus' | 'inquisitor';
}

export function MessageItem({ role, content, persona }: MessageItemProps) {
  const isUser = role === 'user';
  const isAdvocatus = persona === 'advocatus';
  const isInquisitor = persona === 'inquisitor';

  return (
    <div
      className={cn(
        'message-fade-in flex w-full',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
          isUser && 'bg-neutral-800 text-white',
          isAdvocatus && 'bg-neutral-900/50 border border-advocatus/30 text-green-400',
          isInquisitor && 'bg-neutral-900/50 border border-inquisitor/30 text-red-400',
          !isUser && !persona && 'bg-neutral-900 text-neutral-200'
        )}
      >
        {content}
      </div>
    </div>
  );
}
