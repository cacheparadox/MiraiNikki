import React, { useEffect, useState, useRef } from 'react';
import { useSettingsStore } from '../../stores/settings.store';
import { useUIStore } from '../../stores/ui.store';
import { Settings as SettingsIcon, Save, Activity, Database, Download, Upload, Trash2, Moon, Sun, Monitor, Clock } from 'lucide-react';
import { OpenRouterProvider } from '../../providers/OpenRouterProvider';
import { TelemetryViewerModal } from './TelemetryViewerModal';
import { exportData, downloadExport, validateImport, importData } from '../../utils/exportImport';
import { ConfirmationModal } from '../../components/ConfirmationModal';

export const SettingsScreen: React.FC = () => {
  const { settings, loadSettings, updateSettings, purgeAllData } = useSettingsStore();
  const { showToast } = useUIStore();
  
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [theme, setTheme] = useState<'Light' | 'Dark' | 'System'>('System');
  const [unlockTime, setUnlockTime] = useState('04:00');
  const [baseUrl, setBaseUrl] = useState('');
  const [systemPromptOverride, setSystemPromptOverride] = useState('');
  
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message?: string } | null>(null);
  const [showTelemetry, setShowTelemetry] = useState(false);
  
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importDataState, setImportDataState] = useState<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (settings) {
      setApiKey(settings.aiApiKey || '');
      setModel(settings.aiModel || 'google/gemini-2.5-flash-pro');
      setTheme(settings.theme);
      setUnlockTime(settings.unlockTime);
      setBaseUrl(settings.baseUrl || '');
      setSystemPromptOverride(settings.systemPromptOverride || '');
    }
  }, [settings]);

  const handleSave = async () => {
    await updateSettings({
      aiApiKey: apiKey,
      aiModel: model,
      theme,
      unlockTime,
      ...(baseUrl ? { baseUrl } : {}),
      ...(systemPromptOverride ? { systemPromptOverride } : {}),
    });
    showToast('Settings saved successfully');
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    const provider = new OpenRouterProvider();
    const result = await provider.testConnection(apiKey, model, baseUrl || undefined);
    setTestResult(result);
    setIsTesting(false);
  };

  const handleExport = async (includeApiKey: boolean) => {
    const data = await exportData(includeApiKey);
    downloadExport(data);
    showToast('Data exported successfully');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const { valid, error, data } = validateImport(json);
        if (!valid) {
          showToast(`Import failed: ${error}`);
          return;
        }
        setImportDataState(data);
        setIsImportModalOpen(true);
      } catch (err) {
        showToast('Import failed: Invalid JSON file');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImportConfirm = async (mode: 'replace' | 'merge') => {
    if (!importDataState) return;
    const { journalsImported, tasksImported } = await importData(importDataState, mode);
    showToast(`Imported ${journalsImported} journals and ${tasksImported} tasks`);
    setIsImportModalOpen(false);
    setImportDataState(null);
  };

  const handlePurge = async () => {
    await purgeAllData();
    setIsPurgeModalOpen(false);
    showToast('All journal data has been permanently deleted');
  };

  if (!settings) return null;

  return (
    <div className="flex flex-col h-full p-4 max-w-2xl mx-auto w-full animate-fade-in overflow-y-auto">
      <header className="px-2 mt-4 mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-gold)] flex items-center gap-2">
          <SettingsIcon size={24} />
          Settings
        </h1>
      </header>

      <div className="flex flex-col gap-6 pb-20">
        
        {/* General Section */}
        <section className="bg-[var(--color-surface)] border border-[var(--color-divider)] rounded-xl p-6">
          <h3 className="font-bold text-lg mb-4 text-[var(--color-gold)]">General</h3>
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-[var(--color-text-primary)]">Theme</label>
                <p className="text-xs text-[var(--color-muted)]">Choose your visual preference</p>
              </div>
              <div className="flex bg-[var(--color-bg)] rounded-lg p-1 border border-[var(--color-divider)]">
                {(['Light', 'System', 'Dark'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                      theme === t ? 'bg-[var(--color-surface)] shadow-sm text-[var(--color-gold)]' : 'text-[var(--color-muted)] hover:text-[var(--color-text-primary)]'
                    }`}
                  >
                    {t === 'Light' && <Sun size={14} />}
                    {t === 'Dark' && <Moon size={14} />}
                    {t === 'System' && <Monitor size={14} />}
                    <span className="hidden sm:inline">{t}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-[var(--color-divider)] my-1" />

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-[var(--color-text-primary)] flex items-center gap-2">
                  <Clock size={16} className="text-[var(--color-muted)]" />
                  Morning Unlock Time
                </label>
                <p className="text-xs text-[var(--color-muted)]">When does tomorrow arrive?</p>
              </div>
              <input 
                type="time" 
                value={unlockTime}
                onChange={(e) => setUnlockTime(e.target.value)}
                className="bg-[var(--color-bg)] border border-[var(--color-divider)] rounded-lg px-3 py-1.5 outline-none focus:border-[var(--color-gold)] text-[var(--color-text-primary)]"
              />
            </div>
          </div>
        </section>

        {/* AI Provider Section */}
        <section className="bg-[var(--color-surface)] border border-[var(--color-divider)] rounded-xl p-6">
          <h3 className="font-bold text-lg mb-4 text-[var(--color-gold)]">Future Compiler (AI)</h3>
          
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--color-text-primary)]">OpenRouter API Key</label>
              <input 
                type="password" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="bg-[var(--color-bg)] border border-[var(--color-divider)] rounded-lg px-4 py-2 outline-none focus:border-[var(--color-gold)] transition-colors"
                placeholder="sk-or-v1-..."
              />
              <p className="text-xs text-[var(--color-muted)]">Stored securely in your local IndexedDB. Never sent to any server other than OpenRouter.</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--color-text-primary)]">Model ID</label>
              <input 
                type="text" 
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="bg-[var(--color-bg)] border border-[var(--color-divider)] rounded-lg px-4 py-2 outline-none focus:border-[var(--color-gold)] transition-colors"
                placeholder="google/gemini-2.5-flash-pro"
              />
            </div>

            <details className="mt-2 group">
              <summary className="text-sm text-[var(--color-accent)] cursor-pointer hover:underline font-medium list-none flex items-center gap-1">
                <span className="group-open:rotate-90 transition-transform text-xs">▶</span>
                Advanced Provider Settings
              </summary>
              <div className="flex flex-col gap-4 mt-4 pt-4 border-t border-[var(--color-divider)]">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[var(--color-text-primary)]">Custom Base URL (Optional)</label>
                  <input 
                    type="url" 
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    className="bg-[var(--color-bg)] border border-[var(--color-divider)] rounded-lg px-4 py-2 outline-none focus:border-[var(--color-gold)] transition-colors"
                    placeholder="https://openrouter.ai/api/v1"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[var(--color-text-primary)]">System Prompt Override (Optional)</label>
                  <textarea 
                    value={systemPromptOverride}
                    onChange={(e) => setSystemPromptOverride(e.target.value)}
                    className="bg-[var(--color-bg)] border border-[var(--color-divider)] rounded-lg px-4 py-2 outline-none focus:border-[var(--color-gold)] transition-colors min-h-[100px] text-sm font-mono"
                    placeholder="Leave blank to use default Mirai Nikki compiler prompt..."
                  />
                </div>
              </div>
            </details>

            {testResult && (
              <div className={`mt-2 p-3 rounded-lg text-sm border ${testResult.success ? 'bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/20' : 'bg-[var(--color-danger)]/10 text-[var(--color-danger)] border-[var(--color-danger)]/20'}`}>
                {testResult.success ? '✅ Connection successful!' : `❌ ${testResult.message}`}
              </div>
            )}

            <div className="flex gap-3 mt-2">
              <button 
                onClick={handleTest}
                disabled={isTesting || !apiKey || !model}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[var(--color-bg)] border border-[var(--color-divider)] text-[var(--color-text-primary)] rounded-lg font-medium hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all disabled:opacity-50"
              >
                {isTesting ? <Activity size={16} className="animate-pulse" /> : <Activity size={16} />}
                Test
              </button>
              <button 
                onClick={handleSave}
                className="flex-[2] flex items-center justify-center gap-2 py-2.5 bg-[var(--color-gold)] text-[var(--color-bg)] rounded-lg font-bold hover:opacity-90 transition-opacity"
              >
                <Save size={16} />
                Save AI Settings
              </button>
            </div>
          </div>
        </section>

        {/* Data Section */}
        <section className="bg-[var(--color-surface)] border border-[var(--color-divider)] rounded-xl p-6">
          <h3 className="font-bold text-lg mb-4 text-[var(--color-gold)] flex items-center gap-2">
            <Database size={20} />
            Data & Privacy
          </h3>
          
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => handleExport(false)} className="flex items-center justify-center gap-2 py-3 border border-[var(--color-divider)] rounded-lg hover:bg-[var(--color-divider)] transition-colors text-sm font-medium">
                <Download size={16} /> Export JSON
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 py-3 border border-[var(--color-divider)] rounded-lg hover:bg-[var(--color-divider)] transition-colors text-sm font-medium">
                <Upload size={16} /> Import JSON
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
            </div>
            
            <button 
              onClick={() => setIsPurgeModalOpen(true)}
              className="mt-2 flex items-center justify-center gap-2 py-3 border border-[var(--color-danger)]/50 text-[var(--color-danger)] rounded-lg hover:bg-[var(--color-danger)]/10 transition-colors text-sm font-bold"
            >
              <Trash2 size={16} /> Purge All Data
            </button>
            <p className="text-xs text-[var(--color-muted)] text-center px-4">
              All data is stored exclusively on your device. Clearing data cannot be undone without a backup.
            </p>
          </div>
        </section>

        {/* About Section */}
        <section className="text-center px-4">
          <h3 className="font-journal text-xl font-bold text-[var(--color-gold)] mb-1">Mirai Nikki</h3>
          <p className="text-xs text-[var(--color-muted)] mb-4">Version 1.0.0 • Local-First</p>
          <button 
            onClick={() => setShowTelemetry(true)}
            className="text-[var(--color-accent)] hover:underline text-xs"
          >
            View Telemetry Logs
          </button>
        </section>
      </div>

      {showTelemetry && <TelemetryViewerModal onClose={() => setShowTelemetry(false)} />}
      
      <ConfirmationModal
        isOpen={isPurgeModalOpen}
        title="Purge All Data?"
        body="This will permanently delete all your journal entries, tasks, and drafts. Your AI settings will be preserved. This cannot be undone."
        confirmText="Yes, delete everything"
        cancelText="Cancel"
        onConfirm={handlePurge}
        onCancel={() => setIsPurgeModalOpen(false)}
        isDestructive={true}
      />

      {isImportModalOpen && (
        <ConfirmationModal
          isOpen={true}
          title="Import Data"
          body="How would you like to handle the imported data? 'Merge' will add missing entries. 'Replace' will delete your current data and replace it entirely with the backup."
          confirmText="Replace All Data"
          cancelText="Cancel"
          onConfirm={() => handleImportConfirm('replace')}
          onCancel={() => { setIsImportModalOpen(false); setImportDataState(null); }}
          isDestructive={true}
        />
      )}
    </div>
  );
};