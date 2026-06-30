import { useJournalStore } from '../../stores/journal.store';
import { useDraftStore } from '../../stores/draft.store';
import { useSettingsStore } from '../../stores/settings.store';
import { CompilerEngine } from '../../compiler/CompilerEngine';
import { useUIStore } from '../../stores/ui.store';

export async function sealJournal() {
  const { draftContent, clearDraft } = useDraftStore.getState();
  const { sealJournal: saveJournalToDb } = useJournalStore.getState();
  const { settings } = useSettingsStore.getState();
  const { setScreen } = useUIStore.getState();

  if (!draftContent || draftContent.trim().length === 0) return;

  // 1. Seal and save journal to DB (with unlock time from settings)
  const unlockTime = settings?.unlockTime || '04:00';
  await saveJournalToDb(draftContent, unlockTime);

  // 2. Clear draft
  await clearDraft();

  // 3. Queue for compilation if AI is configured
  const newJournal = useJournalStore.getState().nextJournal;
  if (newJournal && settings?.aiProvider && settings?.aiModel && settings?.aiApiKey) {
    await CompilerEngine.enqueue(newJournal.id, settings.aiProvider, settings.aiModel);
  }

  // 4. Switch to tomorrow screen
  setScreen('tomorrow');
}
