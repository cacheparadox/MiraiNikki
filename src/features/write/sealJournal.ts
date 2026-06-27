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

  // 1. Seal and save journal to DB
  await saveJournalToDb(draftContent);

  // 2. Clear draft
  await clearDraft();

  // 3. Queue for compilation if AI is configured
  const newJournal = useJournalStore.getState().todayJournal;
  if (newJournal && settings?.aiProvider && settings?.aiModel) {
    await CompilerEngine.enqueue(newJournal.id, settings.aiProvider, settings.aiModel);
  }

  // 4. Switch to tomorrow screen
  setScreen('tomorrow');
}
