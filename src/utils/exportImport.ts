import { db } from '../db/database';
import type { ExportData, AppSettings } from '../types';

const EXPORT_VERSION = '1.0';

export async function exportData(includeApiKey: boolean = false): Promise<string> {
  const journals = await db.journals.toArray();
  const tasks = await db.tasks.toArray();
  const settings = await db.settings.get('singleton');

  const exportPayload: ExportData = {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    journals,
    tasks,
    includesApiKey: includeApiKey,
  };

  if (settings) {
    const { aiApiKey, ...safeSettings } = settings;
    if (includeApiKey && aiApiKey) {
      exportPayload.settings = { ...safeSettings, aiApiKey } as any;
      exportPayload.includesApiKey = true;
    } else {
      exportPayload.settings = safeSettings;
    }
  }

  return JSON.stringify(exportPayload, null, 2);
}

export function downloadExport(jsonString: string) {
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mirai-nikki-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function validateImport(data: unknown): { valid: boolean; error?: string; data?: ExportData } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid JSON structure.' };
  }

  const d = data as any;

  if (!d.version || typeof d.version !== 'string') {
    return { valid: false, error: 'Missing export version.' };
  }

  if (!Array.isArray(d.journals)) {
    return { valid: false, error: 'Missing journals array.' };
  }

  if (!Array.isArray(d.tasks)) {
    return { valid: false, error: 'Missing tasks array.' };
  }

  // Validate journal entries have required fields
  for (const j of d.journals) {
    if (!j.id || !j.createdAt || !j.content || !j.status) {
      return { valid: false, error: `Invalid journal entry: missing required fields (id: ${j.id}).` };
    }
  }

  // Validate task entries
  for (const t of d.tasks) {
    if (!t.id || !t.journalId || !t.title) {
      return { valid: false, error: `Invalid task entry: missing required fields (id: ${t.id}).` };
    }
  }

  return { valid: true, data: d as ExportData };
}

export async function importData(data: ExportData, mode: 'replace' | 'merge'): Promise<{ journalsImported: number; tasksImported: number }> {
  if (mode === 'replace') {
    await db.journals.clear();
    await db.tasks.clear();
  }

  let journalsImported = 0;
  let tasksImported = 0;

  for (const journal of data.journals) {
    if (mode === 'merge') {
      const existing = await db.journals.get(journal.id);
      if (existing) continue;
    }
    await db.journals.put(journal);
    journalsImported++;
  }

  for (const task of data.tasks) {
    if (mode === 'merge') {
      const existing = await db.tasks.get(task.id);
      if (existing) continue;
    }
    await db.tasks.put(task);
    tasksImported++;
  }

  if (data.settings && mode === 'replace') {
    const currentSettings = await db.settings.get('singleton');
    if (currentSettings) {
      // Preserve API key if import doesn't include it
      const merged = {
        ...data.settings,
        id: 'singleton' as const,
        aiApiKey: data.includesApiKey ? (data.settings as any).aiApiKey : currentSettings.aiApiKey,
      };
      await db.settings.put(merged as AppSettings);
    }
  }

  return { journalsImported, tasksImported };
}
