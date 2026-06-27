import { Pipeline } from './Pipeline';
import { Queue } from './Queue';
import { CompilerTelemetry } from '../telemetry/CompilerTelemetry';
import { useCompilerStore } from '../stores/compiler.store';

export class CompilerEngine {
  private static isRunning = false;
  private static timer: ReturnType<typeof setTimeout> | null = null;

  static async start() {
    if (this.isRunning) return;
    this.isRunning = true;
    useCompilerStore.getState().setCompiling(true);
    await CompilerTelemetry.info('CompilerEngine', 'Engine started');
    
    await Queue.resetStuckTasks();

    this.loop();
  }

  static stop() {
    this.isRunning = false;
    if (this.timer) clearTimeout(this.timer);
    useCompilerStore.getState().setCompiling(false);
    CompilerTelemetry.info('CompilerEngine', 'Engine stopped');
  }

  static async trigger() {
    // Manually wake up the engine if it's sleeping
    if (!this.isRunning) {
      this.start();
    } else {
      // If already running, the loop will eventually pick it up, 
      // but we can fast-track it if it was waiting
      if (this.timer) {
        clearTimeout(this.timer);
        this.loop();
      }
    }
  }

  private static async loop() {
    if (!this.isRunning) return;

    try {
      const processedSomething = await Pipeline.processNextInQueue();
      
      // Update UI queue state
      await useCompilerStore.getState().loadQueue();

      if (processedSomething) {
        // Continue immediately if we found something
        this.timer = setTimeout(() => this.loop(), 100);
      } else {
        // Sleep for 10 seconds before polling again
        this.timer = setTimeout(() => this.loop(), 10000);
      }
    } catch (e) {
      console.error('Compiler Engine Loop Error', e);
      // Backoff on catastrophic loop error
      this.timer = setTimeout(() => this.loop(), 30000);
    }
  }

  static async enqueue(journalId: string, provider: string, model: string) {
    await Queue.add(journalId, provider, model);
    this.trigger();
  }
}
