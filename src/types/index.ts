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
  Removed = 'Removed', // Usually deleted instead, but good to have
}

export interface JournalEntry {
  id: string; // crypto.randomUUID()
  createdAt: string; // ISO string
  unlockAt: string; // ISO string
  status: JournalStatus;
  content: string;
  compilerStatus?: string; // string representation or error code
  schemaVersion: number;
  compilerVersion: number;
  promptVersion: number;
  compiledAt?: string;
  provider?: string;
  model?: string;
}

export interface Task {
  id: string;
  journalId: string;
  title: string;
  completed: boolean;
  completedAt?: string;
  category: TaskCategory;
  estimatedMinutes: number;
  sentenceId: string; // Maps to internal UUID from Normalizer
}

export interface AppSettings {
  id: 'singleton';
  theme: 'Light' | 'Dark' | 'System';
  unlockTime: string; // e.g., '04:00'
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
