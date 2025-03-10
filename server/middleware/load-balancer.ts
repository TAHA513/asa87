
import { Request, Response, NextFunction } from 'express';
import os from 'os';

// Track system load to make intelligent decisions
interface SystemLoad {
  cpuUsage: number;
  memoryUsage: number;
  activeRequests: number;
  timestamp: number;
}

class LoadBalancer {
  private systemLoad: SystemLoad = {
    cpuUsage: 0,
    memoryUsage: 0,
    activeRequests: 0,
    timestamp: Date.now()
  };
  
  private updateInterval: NodeJS.Timeout | null = null;
  private readonly MAX_CONCURRENT_REQUESTS = 100;
  private readonly HIGH_CPU_THRESHOLD = 0.8; // 80%
  private readonly HIGH_MEMORY_THRESHOLD = 0.8; // 80%
  
  constructor() {
    // Update system stats regularly
    this.updateInterval = setInterval(() => this.updateSystemStats(), 5000);
    this.updateSystemStats();
  }
  
  private async updateSystemStats() {
    try {
      // Calculate CPU usage (average across cores)
      const cpus = os.cpus();
      let totalIdle = 0;
      let totalTick = 0;
      
      cpus.forEach(cpu => {
        for (const type in cpu.times) {
          totalTick += cpu.times[type];
        }
        totalIdle += cpu.times.idle;
      });
      
      const idlePercent = totalIdle / totalTick;
      this.systemLoad.cpuUsage = 1 - idlePercent;
      
      // Calculate memory usage
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      this.systemLoad.memoryUsage = (totalMem - freeMem) / totalMem;
      
      this.systemLoad.timestamp = Date.now();
    } catch (error) {
      console.error('Error updating system stats:', error);
    }
  }
  
  // Middleware to track and limit concurrent requests
  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      // Skip load balancing for health checks and static assets
      if (req.path === '/health' || req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
        return next();
      }
      
      // Check if system is overloaded
      const isOverloaded = 
        this.systemLoad.activeRequests >= this.MAX_CONCURRENT_REQUESTS ||
        this.systemLoad.cpuUsage >= this.HIGH_CPU_THRESHOLD ||
        this.systemLoad.memoryUsage >= this.HIGH_MEMORY_THRESHOLD;
      
      if (isOverloaded) {
        return res.status(503).json({
          error: true,
          message: 'Service temporarily unavailable. Please try again later.',
          code: 'SERVER_OVERLOADED'
        });
      }
      
      // Track this request
      this.systemLoad.activeRequests++;
      
      // When request completes, update active request count
      const cleanup = () => {
        this.systemLoad.activeRequests--;
      };
      
      res.on('finish', cleanup);
      res.on('close', cleanup);
      res.on('error', cleanup);
      
      next();
    };
  }
  
  getSystemLoad() {
    return { ...this.systemLoad };
  }
  
  cleanup() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }
}

// Export singleton instance
export const loadBalancer = new LoadBalancer();
export const loadBalancerMiddleware = loadBalancer.middleware();
