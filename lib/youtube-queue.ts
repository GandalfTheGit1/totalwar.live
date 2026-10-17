import { logServer } from './server-logger';

type YouTubeTask<T> = () => Promise<T>;

class YouTubeTaskQueue {
  private queue: Array<{
    task: YouTubeTask<any>;
    resolve: (value: any) => void;
    reject: (reason: any) => void;
  }> = [];
  private isProcessing = false;
  private circuitBreakerUntil = 0;

  async enqueue<T>(task: YouTubeTask<T>): Promise<T> {
    const now = Date.now();
    if (now < this.circuitBreakerUntil) {
      const remainingMin = Math.ceil((this.circuitBreakerUntil - now) / 60000);
      const errMsg = `[YouTubeQueue] 🛑 Cooldown activo de Circuit Breaker por bloqueo de IP. Restan ${remainingMin}m.`;
      logServer('YouTubeQueue', errMsg, 'warn');
      throw new Error(errMsg);
    }

    return new Promise<T>((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.processNext();
    });
  }

  triggerCircuitBreaker() {
    const cooldownMs = 3600000; // 1 hour cooldown
    this.circuitBreakerUntil = Date.now() + cooldownMs;
    logServer('YouTubeQueue', `🚨 Circuit breaker activado. YouTube suspendido por 1 hora para proteger IP.`, 'error');
  }

  isBlocked(): boolean {
    return Date.now() < this.circuitBreakerUntil;
  }

  private async processNext() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    const { task, resolve, reject } = this.queue.shift()!;

    try {
      const result = await task();
      
      if (result === 'ERROR_IP_BLOCKED') {
        this.triggerCircuitBreaker();
        reject(new Error('[YouTubeQueue] YouTube IP bloqueada.'));
        return;
      }
      
      resolve(result);
    } catch (err: any) {
      if (err.message && (err.message.includes('IP_BLOCKED') || err.message.includes('IpBlocked') || err.message.includes('Too Many Requests') || err.message.includes('429'))) {
        this.triggerCircuitBreaker();
      }
      reject(err);
    } finally {
      // Randomized delay between 10 and 20 seconds (10000ms to 20000ms)
      const delayMs = 10000 + Math.floor(Math.random() * 10000);
      logServer('YouTubeQueue', `⏳ Espaciando siguiente petición de YouTube por ${(delayMs / 1000).toFixed(1)}s...`, 'info');
      
      setTimeout(() => {
        this.isProcessing = false;
        this.processNext();
      }, delayMs);
    }
  }
}

export const youtubeQueue = new YouTubeTaskQueue();
