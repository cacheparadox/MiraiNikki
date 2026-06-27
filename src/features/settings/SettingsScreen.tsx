import React, { useEffect, useState } from 'react';
import { useSettingsStore } from '../../stores/settings.store';
import { Settings as SettingsIcon, Save, Activity } from 'lucide-react';
import { OpenRouterProvider } from '../../providers/OpenRouterProvider';
import { TelemetryViewerModal } from './TelemetryViewerModal';

export const SettingsScreen: React.FC = () => {
  const { settings, loadSettings, updateSettings } = useSettingsStore();
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message?: string } | null>(null);
  const [showTelemetry, setShowTelemetry] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (settings) {
      setApiKey(settings.aiApiKey || '');
      setModel(settings.aiModel || 'google/gemini-2.5-flash-pro');
    }
  }, [settings]);

  const handleSave = async () => {
    await updateSettings({
      aiApiKey: apiKey,
      aiModel: model,
    });
    alert('Settings saved successfully!');
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    const provider = new OpenRouterProvider();
    const result = await provider.testConnection(apiKey, model);
    setTestResult(result);
    setIsTesting(false);
  };

  if (!settings) return null;

  return (
    <div className="flex flex-col h-full p-4 max-w-2xl mx-auto w-full animate-fade-in">
      <header className="px-2 mt-4 mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-gold)] flex items-center gap-2">
          <SettingsIcon size={24} />
          Settings
        </h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">Configure your Mirai Nikki experience.</p>
      </header>

      <div className="bg-[var(--color-surface)] border border-[var(--color-divider)] rounded-xl p-6 flex flex-col gap-6">
        
        <div>
          <h3 className="font-bold text-lg mb-4">OpenRouter Integration</h3>
          
          <div className="flex flex-col gap-2 mb-4">
            <label className="text-sm font-medium text-[var(--color-muted)]">API Key</label>
            <input 
              type="password" 
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="bg-[var(--color-bg)] border border-[var(--color-divider)] rounded-lg px-4 py-2 outline-none focus:border-[var(--color-gold)] transition-colors"
              placeholder="sk-or-v1-..."
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[var(--color-muted)]">Model</label>
            <input 
              type="text" 
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="bg-[var(--color-bg)] border border-[var(--color-divider)] rounded-lg px-4 py-2 outline-none focus:border-[var(--color-gold)] transition-colors"
              placeholder="google/gemini-2.5-flash-pro"
            />
            <p className="text-xs text-[var(--color-muted)] mt-1">
              Supports any valid OpenRouter model ID.
            </p>
          </div>
          
          {testResult && (
            <div className={`mt-4 p-3 rounded-lg text-sm border ${testResult.success ? 'bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/20' : 'bg-[var(--color-danger)]/10 text-[var(--color-danger)] border-[var(--color-danger)]/20'}`}>
              {testResult.success ? '✅ Connection successful! Model is responding.' : `❌ ${testResult.message}`}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 mt-2">
          <button 
            onClick={handleTest}
            disabled={isTesting || !apiKey || !model}
            className="flex items-center justify-center gap-2 w-full py-3 bg-[var(--color-surface)] border border-[var(--color-gold)] text-[var(--color-gold)] rounded-xl font-bold hover:bg-[var(--color-gold)] hover:text-[var(--color-bg)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTesting ? (
              <Activity size={18} className="animate-pulse" />
            ) : (
              <Activity size={18} />
            )}
            {isTesting ? 'Testing...' : 'Test Connection'}
          </button>

          <button 
            onClick={handleSave}
            className="flex items-center justify-center gap-2 w-full py-3 bg-[var(--color-gold)] text-[var(--color-bg)] rounded-xl font-bold hover:opacity-90 transition-opacity"
          >
            <Save size={18} />
            Save Settings
          </button>
        </div>
      </div>

      <div className="mt-8 px-2">
        <h3 className="text-sm font-bold text-[var(--color-muted)] uppercase tracking-wider mb-2">Developer</h3>
        <button 
          onClick={() => setShowTelemetry(true)}
          className="text-[var(--color-accent)] hover:underline text-sm font-medium"
        >
          View Compiler Telemetry Log
        </button>
      </div>

      {showTelemetry && <TelemetryViewerModal onClose={() => setShowTelemetry(false)} />}
    </div>
  );
};