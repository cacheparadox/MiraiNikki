export enum TaskCategory {
  Work = 'Work',
  Personal = 'Personal',
  Health = 'Health',
  Learning = 'Learning',
  Finance = 'Finance',
  Home = 'Home',
  Other = 'Other',
}

export enum JournalStatus {
  Draft = 'Draft',
  Sealed = 'Sealed',
  PendingCompilation = 'PendingCompilation',
  Ready = 'Ready',
  Opened = 'Opened',
  Archived = 'Archived',
}

export enum QueueStatus {
  Pending = 'Pending',
  Running = 'Running',
  Failed = 'Failed',
  WaitingRetry = 'WaitingRetry',
  Removed = 'Removed',
}

export interface SentenceMapping {
  alias: string;  // S1, S2, etc.
  id: string;     // UUID assigned during segmentation
  text: string;   // The actual sentence text
}

export interface JournalEntry {
  id: string;
  createdAt: string;
  unlockAt: string;
  status: JournalStatus;
  content: string;
  compilerStatus?: string;
  schemaVersion: number;
  compilerVersion: number;
  promptVersion: number;
  compiledAt?: string;
  provider?: string;
  model?: string;
  sentenceMap?: SentenceMapping[];
}

export interface Task {
  id: string;
  journalId: string;
  title: string;
  completed: boolean;
  completedAt?: string;
  category: TaskCategory;
  estimatedMinutes: number;
  sentenceId: string;
}

export interface AppSettings {
  id: 'singleton';
  theme: 'Light' | 'Dark' | 'System';
  unlockTime: string;
  dailyReminderTime?: string;
  morningReminderTime?: string;
  enableNotifications: boolean;
  aiProvider: string;
  aiModel: string;
  aiApiKey?: string;
  baseUrl?: string;
  systemPromptOverride?: string;
  onboardingCompleted: boolean;
}

export interface Draft {
  id: 'singleton';
  currentContent: string;
  updatedAt: string;
}

export interface QueueEntry {
  id: string;
  journalId: string;
  attempts: number;
  lastAttempt?: string;
  nextRetryAt?: string;
  status: QueueStatus;
  provider: string;
  model: string;
}

export interface TelemetryLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  component: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ExportData {
  version: string;
  exportedAt: string;
  journals: JournalEntry[];
  tasks: Task[];
  settings?: Omit<AppSettings, 'aiApiKey'>;
  includesApiKey?: boolean;
}
