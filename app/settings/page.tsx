'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSettings } from '@/lib/store';
import { getApiBase } from '@/lib/api';
import { PROVIDER_MODELS } from '@/lib/types';
import { ArrowLeft, Check, AlertCircle } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { settings, updateSettings } = useSettings();
  const [localSettings, setLocalSettings] = useState(settings);
  const [saved, setSaved] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    updateSettings(localSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTest = async () => {
    setTestStatus('testing');
    try {
      // Test connection to Polarity backend (not the LLM provider URL).
      // Chat/stream requests go to backend, which then uses your Base URL + API Key.
      const response = await fetch(`${getApiBase()}/packs`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        setTestStatus('success');
      } else {
        setTestStatus('error');
      }
    } catch {
      setTestStatus('error');
    }
    setTimeout(() => setTestStatus('idle'), 3000);
  };

  const modelPlaceholder = (PROVIDER_MODELS[localSettings.provider] || [])[0] || 'e.g. gpt-4o, llama3';

  return (
    <div className="container mx-auto max-w-xl px-4 py-12">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-8 text-neutral-500 hover:text-white rounded-full px-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="mb-10">
        <h1 className="text-3xl font-normal text-white mb-2" style={{ fontFamily: 'var(--font-instrument-serif)' }}>
          Settings
        </h1>
        <p className="text-neutral-500">
          Configure your API provider and model
        </p>
      </div>

      <Card className="border-neutral-800 bg-card">
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-3">
            <Label htmlFor="provider" className="text-neutral-400 text-sm font-medium">Provider</Label>
            <Select
              value={localSettings.provider}
              onValueChange={(value: 'openai' | 'ollama' | 'litellm') => {
                const defaultModel = (PROVIDER_MODELS[value] || [])[0] || '';
                setLocalSettings({
                  ...localSettings,
                  provider: value,
                  model: defaultModel,
                });
              }}
            >
              <SelectTrigger className="border-neutral-800 bg-neutral-900/50 text-white rounded-lg h-11">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent className="border-neutral-800 bg-neutral-900 text-white">
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="ollama">Ollama (Local)</SelectItem>
                <SelectItem value="litellm">LiteLLM</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="model" className="text-neutral-400 text-sm font-medium">Model</Label>
            <Input
              id="model"
              type="text"
              placeholder={modelPlaceholder}
              value={localSettings.model}
              onChange={(e) => setLocalSettings({ ...localSettings, model: e.target.value })}
              className="border-neutral-800 bg-neutral-900/50 text-white placeholder:text-neutral-600 rounded-lg h-11"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="apiKey" className="text-neutral-400 text-sm font-medium">
              API Key {localSettings.provider === 'ollama' && <span className="text-neutral-600 font-normal">(Optional for local)</span>}
            </Label>
            <Input
              id="apiKey"
              type="password"
              placeholder={localSettings.provider === 'ollama' ? 'sk-... (optional)' : 'sk-...'}
              value={localSettings.apiKey}
              onChange={(e) => setLocalSettings({ ...localSettings, apiKey: e.target.value })}
              className="border-neutral-800 bg-neutral-900/50 text-white placeholder:text-neutral-600 rounded-lg h-11 font-mono"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="baseUrl" className="text-neutral-400 text-sm font-medium">
              Base URL {localSettings.provider === 'ollama' && <span className="text-neutral-600 font-normal">(Default: localhost:11434)</span>}
            </Label>
            <Input
              id="baseUrl"
              type="text"
              placeholder={
                localSettings.provider === 'ollama'
                  ? 'http://localhost:11434'
                  : 'https://api.openai.com/v1'
              }
              value={localSettings.baseUrl}
              onChange={(e) => setLocalSettings({ ...localSettings, baseUrl: e.target.value })}
              className="border-neutral-800 bg-neutral-900/50 text-white placeholder:text-neutral-600 rounded-lg h-11 font-mono"
            />
          </div>

          <div className="space-y-3 pt-2">
            <Label htmlFor="backendUrl" className="text-neutral-400 text-sm font-medium">
              Backend URL <span className="text-neutral-600 font-normal">(Your Polarity server)</span>
            </Label>
            <Input
              id="backendUrl"
              type="text"
              placeholder="http://localhost:8000"
              defaultValue={typeof window !== 'undefined' ? localStorage.getItem('polarity_api_base') || 'http://localhost:8000' : 'http://localhost:8000'}
              onBlur={(e) => {
                localStorage.setItem('polarity_api_base', e.target.value);
              }}
              className="border-neutral-800 bg-neutral-900/50 text-white placeholder:text-neutral-600 rounded-lg h-11 font-mono"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              className="bg-white text-black hover:bg-neutral-200 rounded-full px-6"
            >
              {saved ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Saved
                </>
              ) : (
                'Save Settings'
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleTest}
              disabled={testStatus === 'testing'}
              className="border-neutral-800 text-neutral-400 hover:bg-neutral-900 hover:text-white rounded-full px-6"
            >
              {testStatus === 'testing' && 'Testing...'}
              {testStatus === 'success' && (
                <>
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  Connected
                </>
              )}
              {testStatus === 'error' && (
                <>
                  <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
                  Failed
                </>
              )}
              {testStatus === 'idle' && 'Test Connection'}
            </Button>
          </div>

          <div className="rounded-lg bg-neutral-900/50 p-5 text-sm text-neutral-500 space-y-2">
            <p className="font-medium text-neutral-400">Note:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><span className="text-neutral-300">OpenAI</span> (provider): Any OpenAI-compatible API — e.g. OpenAI, DeepSeek, Kimi, etc. Fill in that service&apos;s Base URL and API Key.</li>
              <li><span className="text-neutral-300">Ollama</span>: Run locally with <code className="text-neutral-300 font-mono">ollama serve</code>, Base URL usually <code className="text-neutral-300 font-mono">http://localhost:11434</code></li>
              <li><span className="text-neutral-300">LiteLLM</span>: Use any LLM that supports OpenAI-compatible API</li>
              <li>Test Connection checks if the <span className="text-neutral-300">Polarity backend</span> is reachable (default <code className="text-neutral-300 font-mono">http://localhost:8000</code>). Start it with <code className="text-neutral-300 font-mono">polarity serve</code> or <code className="text-neutral-300 font-mono">uvicorn polarity_agent.api:app --port 8000</code>.</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
