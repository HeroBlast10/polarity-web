'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled, loading, placeholder }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isBlocked = Boolean(disabled || loading);

  const handleSend = () => {
    if (message.trim() && !isBlocked) {
      onSend(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
    }
  };

  return (
    <div className="flex gap-3 items-end">
      <Textarea
        ref={textareaRef}
        value={message}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || 'Type your message...'}
        disabled={isBlocked}
        className="min-h-[52px] max-h-[150px] resize-none border-neutral-800 bg-neutral-900/50 text-white placeholder:text-neutral-600 rounded-xl text-[15px] leading-relaxed"
        rows={1}
      />
      <Button
        onClick={handleSend}
        disabled={isBlocked || !message.trim()}
        size="icon"
        className="h-[52px] w-[52px] rounded-xl bg-white text-black hover:bg-neutral-200 transition-colors"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Send className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
}
