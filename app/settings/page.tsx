'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSettings } from '@/lib/store';
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
      const response = await fetch(`${localSettings.baseUrl || 'http://localhost:8000'}/packs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
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

  const models = PROVIDER_MODELS[localSettings.provider] || [];

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6 text-neutral-400 hover:text-white"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Card className="border-neutral-800 bg-card">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white">Settings</CardTitle>
          <CardDescription className="text-neutral-400">
            Configure your API provider and model
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="provider" className="text-neutral-300">Provider</Label>
            <Select
              value={localSettings.provider}
              onValueChange={(value: 'openai' | 'ollama' | 'litellm') => {
                const newModels = PROVIDER_MODELS[value] || [];
                setLocalSettings({
                  ...localSettings,
                  provider: value,
                  model: newModels[0] || '',
                });
              }}
            >
              <SelectTrigger className="border-neutral-700 bg-neutral-900 text-white">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent className="border-neutral-700 bg-neutral-900 text-white">
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="ollama">Ollama (Local)</SelectItem>
                <SelectItem value="litellm">LiteLLM</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="model" className="text-neutral-300">Model</Label>
            <Select
              value={localSettings.model}
              onValueChange={(value) => setLocalSettings({ ...localSettings, model: value })}
            >
              <SelectTrigger className="border-neutral-700 bg-neutral-900 text-white">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent className="border-neutral-700 bg-neutral-900 text-white">
                {models.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiKey" className="text-neutral-300">
              API Key {localSettings.provider === 'ollama' && '(Optional for local)'}
            </Label>
            <Input
              id="apiKey"
              type="password"
              placeholder={localSettings.provider === 'ollama' ? 'sk-... (optional)' : 'sk-...'}
              value={localSettings.apiKey}
              onChange={(e) => setLocalSettings({ ...localSettings, apiKey: e.target.value })}
              className="border-neutral-700 bg-neutral-900 text-white placeholder:text-neutral-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="baseUrl" className="text-neutral-300">
              Base URL {localSettings.provider === 'ollama' && '(Default: http://localhost:11434)'}
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
              className="border-neutral-700 bg-neutral-900 text-white placeholder:text-neutral-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              className="bg-white text-black hover:bg-neutral-200"
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
              className="border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white"
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

          <div className="rounded-lg bg-neutral-900 p-4 text-sm text-neutral-400">
            <p className="font-medium text-neutral-300">Note:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>For OpenAI: Use your API key from platform.openai.com</li>
              <li>For Ollama: Run locally with <code className="text-neutral-300">ollama serve</code></li>
              <li>For LiteLLM: Use any LLM that supports OpenAI-compatible API</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
