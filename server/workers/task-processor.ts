
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import path from 'path';

// Types for task processing
export interface Task {
  type: string;
  data: any;
  id: string;
}

export interface TaskResult {
  taskId: string;
  result?: any;
  error?: string;
}

// Main thread: Worker Pool Manager
export class WorkerPool {
  private workers: Worker[] = [];
  private taskQueue: Task[] = [];
  private taskCallbacks = new Map<string, (result: TaskResult) => void>();
  private isProcessing = false;
  private maxWorkers: number;

  constructor(maxWorkers = 4) {
    this.maxWorkers = maxWorkers;
  }

  async processTask(task: Task): Promise<any> {
    return new Promise((resolve, reject) => {
      // Store callback with task ID
      this.taskCallbacks.set(task.id, (result: TaskResult) => {
        if (result.error) {
          reject(new Error(result.error));
        } else {
          resolve(result.result);
        }
      });

      // Add task to queue
      this.taskQueue.push(task);
      this.processQueue();
    });
  }

  private processQueue() {
    if (this.isProcessing || this.taskQueue.length === 0) return;
    this.isProcessing = true;

    // Process as many tasks as we have workers (or can create)
    while (this.taskQueue.length > 0 && this.workers.length < this.maxWorkers) {
      const worker = new Worker(path.join(__dirname, 'task-worker.js'));
      
      worker.on('message', (result: TaskResult) => {
        const callback = this.taskCallbacks.get(result.taskId);
        if (callback) {
          callback(result);
          this.taskCallbacks.delete(result.taskId);
        }
        
        // Worker is now free to process another task
        const nextTask = this.taskQueue.shift();
        if (nextTask) {
          worker.postMessage(nextTask);
        } else {
          // No more tasks, terminate the worker
          worker.terminate();
          const index = this.workers.indexOf(worker);
          if (index !== -1) this.workers.splice(index, 1);
        }
      });
      
      worker.on('error', (err) => {
        console.error('Worker error:', err);
        // Handle worker crash
        const index = this.workers.indexOf(worker);
        if (index !== -1) this.workers.splice(index, 1);
      });
      
      this.workers.push(worker);
      const task = this.taskQueue.shift();
      if (task) worker.postMessage(task);
    }
    
    this.isProcessing = false;
  }
}

// Export singleton instance
export const workerPool = new WorkerPool();
