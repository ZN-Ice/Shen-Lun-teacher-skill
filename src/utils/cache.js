/**
 * 缓存工具
 *
 * 提供内存缓存功能，支持 TTL 过期策略
 */

class Cache {
  constructor(options = {}) {
    this.cache = new Map();
    this.enabled = options.enabled !== false;
    this.defaultTTL = options.ttl || 3600; // 默认缓存时间（秒）
    this.maxSize = options.maxSize || 100;
  }

  /**
   * 生成缓存键
   *
   * @param {string} key - 原始键
   * @returns {string} 缓存键
   */
  generateKey(key) {
    return `cache:${key}`;
  }

  /**
   * 清理过期缓存
   */
  cleanup() {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, value] of this.cache.entries()) {
      if (value.expiresAt < now) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`Cache cleanup: removed ${cleaned} expired entries`);
    }
  }

  /**
   * 检查缓存大小，必要时删除最旧的条目
   */
  checkSize() {
    if (this.cache.size >= this.maxSize) {
      // 按访问时间排序，删除最旧的
      const entries = [...this.cache.entries()].sort((a, b) => a[1].accessedAt - b[1].accessedAt);

      // 删除 10% 的条目
      const toDelete = Math.max(1, Math.floor(this.maxSize * 0.1));
      for (let i = 0; i < toDelete; i++) {
        this.cache.delete(entries[i][0]);
      }

      console.log(`Cache size limit reached: removed ${toDelete} oldest entries`);
    }
  }

  /**
   * 设置缓存
   *
   * @param {string} key - 缓存键
   * @param {*} value - 缓存值
   * @param {number} ttl - 缓存时间（秒）
   */
  set(key, value, ttl) {
    if (!this.enabled) return;

    // 清理过期缓存
    this.cleanup();

    // 检查缓存大小
    this.checkSize();

    const cacheKey = this.generateKey(key);
    const cacheTTL = ttl !== undefined ? ttl : this.defaultTTL;

    this.cache.set(cacheKey, {
      value,
      expiresAt: Date.now() + cacheTTL * 1000,
      accessedAt: Date.now(),
    });
  }

  /**
   * 获取缓存
   *
   * @param {string} key - 缓存键
   * @returns {*} 缓存值，如果不存在或已过期返回 null
   */
  get(key) {
    if (!this.enabled) return null;

    const cacheKey = this.generateKey(key);
    const entry = this.cache.get(cacheKey);

    if (!entry) return null;

    // 检查是否过期
    if (entry.expiresAt < Date.now()) {
      this.cache.delete(cacheKey);
      return null;
    }

    // 更新访问时间
    entry.accessedAt = Date.now();
    return entry.value;
  }

  /**
   * 删除缓存
   *
   * @param {string} key - 缓存键
   * @returns {boolean} 是否删除成功
   */
  delete(key) {
    if (!this.enabled) return false;

    const cacheKey = this.generateKey(key);
    return this.cache.delete(cacheKey);
  }

  /**
   * 清空所有缓存
   */
  clear() {
    this.cache.clear();
    console.log('Cache cleared');
  }

  /**
   * 检查缓存是否存在
   *
   * @param {string} key - 缓存键
   * @returns {boolean} 是否存在
   */
  has(key) {
    if (!this.enabled) return false;

    const cacheKey = this.generateKey(key);
    const entry = this.cache.get(cacheKey);

    if (!entry) return false;

    // 检查是否过期
    if (entry.expiresAt < Date.now()) {
      this.cache.delete(cacheKey);
      return false;
    }

    return true;
  }

  /**
   * 获取缓存统计信息
   *
   * @returns {Object} 统计信息
   */
  getStats() {
    const now = Date.now();
    let expired = 0;
    let valid = 0;

    for (const entry of this.cache.values()) {
      if (entry.expiresAt < now) {
        expired++;
      } else {
        valid++;
      }
    }

    return {
      total: this.cache.size,
      valid,
      expired,
      maxSize: this.maxSize,
      enabled: this.enabled,
    };
  }
}

// 创建默认实例
export const cache = new Cache();
