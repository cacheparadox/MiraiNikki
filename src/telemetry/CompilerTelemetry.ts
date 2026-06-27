import { db } from '../db/database';
import type { TelemetryLog } from '../types';

export class CompilerTelemetry {
  static async log(level: 'info' | 'warn' | 'error', component: string, message: string, details?: Record<string, unknown>) {
    const entry: TelemetryLog = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      level,
      component,
      message,
      details
    };
    await db.logs.put(entry);
    
    // Also log to console in dev mode for immediate feedback
    if (import.meta.env.DEV) {
      if (level === 'error') console.error(`[${component}] ${message}`, details || '');
      else if (level === 'warn') console.warn(`[${component}] ${message}`, details || '');
      else console.log(`[${component}] ${message}`, details || '');
    }
  }

  static async info(component: string, message: string, details?: Record<string, unknown>) {
    await this.log('info', component, message, details);
  }

  static async warn(component: string, message: string, details?: Record<string, unknown>) {
    await this.log('warn', component, message, details);
  }

  static async error(component: string, message: string, details?: Record<string, unknown>) {
    await this.log('error', component, message, details);
  }

  static async clear() {
    await db.logs.clear();
  }

  static async getLogs() {
    return await db.logs.orderBy('timestamp').reverse().toArray();
  }
}
