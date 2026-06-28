import React, { useState } from 'react';
import { useSettingsStore } from '../../stores/settings.store';
import { BookOpen, Shield, Sparkles, ArrowRight, Check, Moon, Sun } from 'lucide-react';
import clsx from 'clsx';
import { OpenRouterProvider } from '../../providers/OpenRouterProvider';

export const OnboardingScreen: React.FC = () => {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('google/gemini-2.5-flash-pro');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message?: string } | null>(null);

  const { settings, updateSettings } = useSettingsStore();

  const toggleTheme = () => {
    const currentTheme = settings?.theme === 'Dark' ? 'Dark' : (settings?.theme === 'Light' ? 'Light' : 'System');
    const newTheme = currentTheme === 'Dark' ? 'Light' : 'Dark';
    updateSettings({ theme: newTheme });
  };

  const handleNext = () => {
    if (step < 3) {
      setDirection('forward');
      setStep(s => s + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setDirection('backward');
      setStep(s => s - 1);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    const provider = new OpenRouterProvider();
    const result = await provider.testConnection(apiKey, model);
    setTestResult(result);
    setIsTesting(false);
  };

  const handleComplete = async () => {
    await updateSettings({
      onboardingCompleted: true,
      ...(apiKey ? { aiApiKey: apiKey, aiModel: model } : {})
    });
  };

  const getAnimationClass = () => {
    if (direction === 'forward') return 'animate-onboarding-enter';
    return 'animate-onboarding-enter'; // reusing for simplicity, or we could add a slide-right
  };

  return (
    <div className="fixed inset-0 z-50 bg-[var(--color-bg)] flex flex-col items-center justify-center p-6 text-center">
      
      {/* Step Indicators */}
      <div className="absolute top-12 left-0 right-0 flex justify-center gap-2">
        {[0, 1, 2, 3].map(i => (
          <div 
            key={i} 
            className={clsx(
              "h-1 rounded-full transition-all duration-300",
              i === step ? "w-8 bg-[var(--color-gold)]" : "w-2 bg-[var(--color-divider)]"
            )} 
          />
        ))}
      </div>

      <button 
        onClick={toggleTheme}
        className="absolute top-8 right-8 p-2 rounded-full bg-[var(--color-surface)] border border-[var(--color-divider)] text-[var(--color-muted)] hover:text-[var(--color-text-primary)] transition-colors"
      >
        {settings?.theme === 'Light' ? <Moon size={20} /> : <Sun size={20} />}
      </button>

      <div className={clsx("max-w-md w-full flex flex-col items-center", getAnimationClass())} key={step}>
        
        {step === 0 && (
          <>
            <div className="w-20 h-20 bg-[var(--color-gold)]/10 text-[var(--color-gold)] rounded-full flex items-center justify-center mb-8">
              <BookOpen size={40} />
            </div>
            <h1 className="text-3xl font-journal font-bold mb-4">Welcome to Mirai Nikki.</h1>
            <p className="text-[var(--color-muted)] text-lg mb-8 leading-relaxed">
              A private space to write tomorrow as if it has already happened. The ultimate commitment device.
            </p>
          </>
        )}

        {step === 1 && (
          <>
            <div className="w-20 h-20 bg-[var(--color-gold)]/10 text-[var(--color-gold)] rounded-full flex items-center justify-center mb-8">
              <Sparkles size={40} />
            </div>
            <h1 className="text-3xl font-journal font-bold mb-4">The Ritual.</h1>
            <p className="text-[var(--color-muted)] text-lg mb-8 leading-relaxed">
              At night, write the story of your success for the coming day. We extract your commitments into actionable steps.<br/><br/>
              Then, the diary seals itself. You cannot view it until tomorrow arrives.
            </p>
          </>
        )}

        {step === 2 && (
          <>
            <div className="w-20 h-20 bg-[var(--color-gold)]/10 text-[var(--color-gold)] rounded-full flex items-center justify-center mb-8">
              <Shield size={40} />
            </div>
            <h1 className="text-3xl font-journal font-bold mb-4">Your Future is Private.</h1>
            <p className="text-[var(--color-muted)] text-lg mb-8 leading-relaxed">
              No cloud accounts. No databases. Everything lives solely on this device.<br/><br/>
              Your journals are sent securely to the AI provider of your choice solely for processing, never stored.
            </p>
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="text-3xl font-journal font-bold mb-2">Configure AI</h1>
            <p className="text-[var(--color-muted)] mb-8">
              Connect your OpenRouter account to enable the Future Compiler. You can also skip this and set it up later.
            </p>
            
            <div className="w-full text-left bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-divider)] mb-8">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[var(--color-muted)]">OpenRouter API Key</label>
                  <input 
                    type="password" 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-divider)] rounded-lg px-4 py-2 outline-none focus:border-[var(--color-gold)]"
                    placeholder="sk-or-v1-..."
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[var(--color-muted)]">Model ID</label>
                  <input 
                    type="text" 
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-divider)] rounded-lg px-4 py-2 outline-none focus:border-[var(--color-gold)]"
                    placeholder="google/gemini-2.5-flash-pro"
                  />
                </div>
                
                {apiKey && (
                  <button 
                    onClick={handleTest}
                    disabled={isTesting}
                    className="mt-2 py-2 w-full bg-[var(--color-bg)] border border-[var(--color-gold)] text-[var(--color-gold)] rounded-lg font-bold hover:bg-[var(--color-gold)]/10 transition-colors"
                  >
                    {isTesting ? 'Testing...' : 'Test Connection'}
                  </button>
                )}
                
                {testResult && (
                  <div className={`p-3 rounded-lg text-sm border ${testResult.success ? 'bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/20' : 'bg-[var(--color-danger)]/10 text-[var(--color-danger)] border-[var(--color-danger)]/20'}`}>
                    {testResult.success ? '✅ Connection successful!' : `❌ ${testResult.message}`}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Navigation Buttons */}
        <div className="w-full flex justify-between items-center">
          {step > 0 ? (
            <button 
              onClick={handleBack}
              className="px-6 py-3 font-bold text-[var(--color-muted)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              Back
            </button>
          ) : <div />}
          
          <button 
            onClick={handleNext}
            className="flex items-center gap-2 px-8 py-3 bg-[var(--color-gold)] text-[var(--color-bg)] rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg"
          >
            {step === 3 ? (apiKey ? 'Complete Setup' : 'Skip & Finish') : 'Continue'}
            {step < 3 ? <ArrowRight size={18} /> : <Check size={18} />}
          </button>
        </div>

      </div>
    </div>
  );
};
