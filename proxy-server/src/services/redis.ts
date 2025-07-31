import { createClient, RedisClientType } from 'redis';
import { config } from '../config';

class RedisClient {
  private client: RedisClientType | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectDelay = 1000; // 1초

  async connect(): Promise<void> {
    if (this.isConnected && this.client?.isReady) return;

    try {
      // Redis 클라이언트 생성
      this.client = createClient({
        url: `redis://:${config.redis.password}@${config.redis.url}:${config.redis.port}`,
        database: config.redis.db,
        socket: {
          connectTimeout: 10000,
          lazyConnect: true,
          reconnectStrategy: (retries) => {
            if (retries > this.maxReconnectAttempts) {
              console.error(`Redis reconnection failed after ${retries} attempts`);
              return false;
            }
            const delay = Math.min(retries * this.reconnectDelay, 5000);
            console.log(`Redis reconnecting in ${delay}ms (attempt ${retries})`);
            return delay;
          },
        },
      });

      // 에러 핸들링
      this.client.on('error', (error: Error) => {
        console.error('Redis error:', error.message);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('Redis connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
      });

      this.client.on('ready', () => {
        console.log('Redis ready');
        this.isConnected = true;
      });

      this.client.on('disconnect', () => {
        console.log('Redis disconnected');
        this.isConnected = false;
      });

      this.client.on('reconnecting', () => {
        console.log('Redis reconnecting...');
        this.reconnectAttempts++;
      });

      // 연결 시도
      await this.client.connect();
      
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      this.isConnected = false;
      throw error;
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.isReady()) {
      console.warn('Redis not ready for GET operation');
      return null;
    }

    try {
      const result = await this.client!.get(key);
      return result;
    } catch (error) {
      console.error('Redis GET error:', error);
      // 연결 문제인 경우 재연결 시도
      if (this.isConnectionError(error)) {
        this.handleConnectionError();
      }
      return null;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<boolean> {
    if (!this.isReady()) {
      console.warn('Redis not ready for SET operation');
      return false;
    }

    try {
      if (ttl && ttl > 0) {
        await this.client!.setEx(key, ttl, value);
      } else {
        await this.client!.set(key, value);
      }
      return true;
    } catch (error) {
      console.error('Redis SET error:', error);
      // 연결 문제인 경우 재연결 시도
      if (this.isConnectionError(error)) {
        this.handleConnectionError();
      }
      return false;
    }
  }

  async setWithLock(key: string, value: string, ttl?: number): Promise<boolean> {
    const lockKey = `lock:${key}`;
    const lockValue = `${Date.now()}-${Math.random()}`;
    const lockTTL = 10; // 락 만료 시간: 10초

    try {
      // 분산 락 획득 시도
      const lockAcquired = await this.acquireLock(lockKey, lockValue, lockTTL);
      if (!lockAcquired) {
        console.warn(`Failed to acquire lock for key: ${key}`);
        return false;
      }

      try {
        // 락 획득 성공 시 데이터 저장
        const result = await this.set(key, value, ttl);
        return result;
      } finally {
        // 락 해제
        await this.releaseLock(lockKey, lockValue);
      }
    } catch (error) {
      console.error('Redis SET with lock error:', error);
      return false;
    }
  }

  private async acquireLock(lockKey: string, lockValue: string, ttl: number): Promise<boolean> {
    if (!this.isReady()) {
      return false;
    }

    try {
      // SET key value NX EX ttl - 키가 존재하지 않을 때만 설정
      const result = await this.client!.set(lockKey, lockValue, {
        NX: true, // Only set if key doesn't exist
        EX: ttl   // Expire after ttl seconds
      });
      
      return result === 'OK';
    } catch (error) {
      console.error('Lock acquisition error:', error);
      return false;
    }
  }

  private async releaseLock(lockKey: string, lockValue: string): Promise<boolean> {
    if (!this.isReady()) {
      return false;
    }

    try {
      // Lua 스크립트로 원자성 보장하여 락 해제
      const luaScript = `
        if redis.call("GET", KEYS[1]) == ARGV[1] then
          return redis.call("DEL", KEYS[1])
        else
          return 0
        end
      `;
      
      const result = await this.client!.eval(luaScript, {
        keys: [lockKey],
        arguments: [lockValue]
      });
      
      return result === 1;
    } catch (error) {
      console.error('Lock release error:', error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.isReady()) {
      console.warn('Redis not ready for DEL operation');
      return false;
    }

    try {
      const result = await this.client!.del(key);
      return result > 0;
    } catch (error) {
      console.error('Redis DEL error:', error);
      // 연결 문제인 경우 재연결 시도
      if (this.isConnectionError(error)) {
        this.handleConnectionError();
      }
      return false;
    }
  }

  async ping(): Promise<boolean> {
    if (!this.isReady()) {
      return false;
    }

    try {
      const result = await this.client!.ping();
      return result === 'PONG';
    } catch (error) {
      console.error('Redis PING error:', error);
      return false;
    }
  }

  private isConnectionError(error: any): boolean {
    return error?.code === 'ECONNRESET' || 
           error?.code === 'ECONNREFUSED' || 
           error?.message?.includes('connection');
  }

  private handleConnectionError(): void {
    this.isConnected = false;
    console.log('Connection error detected, attempting reconnect...');
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      try {
        await this.client.quit();
      } catch (error) {
        console.error('Error during Redis disconnect:', error);
      }
      this.client = null;
      this.isConnected = false;
    }
  }

  isReady(): boolean {
    return this.isConnected && this.client?.isReady === true;
  }

  getStatus(): { connected: boolean; ready: boolean; attempts: number } {
    return {
      connected: this.isConnected,
      ready: this.client?.isReady === true,
      attempts: this.reconnectAttempts
    };
  }
}

// 싱글톤 인스턴스
export const redisClient = new RedisClient();
