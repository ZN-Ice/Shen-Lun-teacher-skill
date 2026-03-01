/**
 * HTTP 客户端工具
 *
 * 封装 HTTP 请求功能，支持重试、超时等特性
 */

import fetch from 'node-fetch';

class HttpClient {
  constructor(options = {}) {
    this.timeout = options.timeout || 10000; // 默认超时 10 秒
    this.maxRetries = options.maxRetries || 3; // 默认重试 3 次
    this.retryDelay = options.retryDelay || 1000; // 默认重试延迟 1 秒
  }

  /**
   * 睡眠函数
   *
   * @param {number} ms - 睡眠毫秒数
   * @returns {Promise<void>}
   */
  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 发起 HTTP 请求
   *
   * @param {string} url - 请求 URL
   * @param {Object} options - 请求选项
   * @param {string} options.method - HTTP 方法
   * @param {Object} options.headers - 请求头
   * @param {Object} options.body - 请求体
   * @param {number} options.timeout - 超时时间（毫秒）
   * @param {number} options.retries - 重试次数
   * @returns {Promise<Object>} 响应数据
   * @throws {Error} 请求失败时抛出错误
   */
  async request(url, options = {}) {
    const method = options.method || 'GET';
    const headers = options.headers || { 'Content-Type': 'application/json' };
    const body = options.body ? JSON.stringify(options.body) : undefined;
    const timeout = options.timeout || this.timeout;
    const retries = options.retries !== undefined ? options.retries : this.maxRetries;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    let lastError = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        if (attempt > 0) {
          await this.sleep(this.retryDelay * attempt);
        }

        const response = await fetch(url, {
          method,
          headers,
          body,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // 尝试解析为 JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return await response.json();
        }

        return await response.text();
      } catch (error) {
        lastError = error;

        if (error.name === 'AbortError') {
          console.warn(`Request timeout (attempt ${attempt + 1}/${retries + 1}): ${url}`);
        } else {
          console.warn(`Request failed (attempt ${attempt + 1}/${retries + 1}): ${error.message}`);
        }

        // 如果是最后一次尝试，抛出错误
        if (attempt === retries) {
          throw new Error(`Request failed after ${retries + 1} attempts: ${lastError.message}`);
        }
      }
    }
  }

  /**
   * GET 请求
   *
   * @param {string} url - 请求 URL
   * @param {Object} options - 请求选项
   * @returns {Promise<Object>} 响应数据
   */
  async get(url, options = {}) {
    return this.request(url, { ...options, method: 'GET' });
  }

  /**
   * POST 请求
   *
   * @param {string} url - 请求 URL
   * @param {Object} data - 请求数据
   * @param {Object} options - 请求选项
   * @returns {Promise<Object>} 响应数据
   */
  async post(url, data, options = {}) {
    return this.request(url, { ...options, method: 'POST', body: data });
  }

  /**
   * PUT 请求
   *
   * @param {string} url - 请求 URL
   * @param {Object} data - 请求数据
   * @param {Object} options - 请求选项
   * @returns {Promise<Object>} 响应数据
   */
  async put(url, data, options = {}) {
    return this.request(url, { ...options, method: 'PUT', body: data });
  }

  /**
   * DELETE 请求
   *
   * @param {string} url - 请求 URL
   * @param {Object} options - 请求选项
   * @returns {Promise<Object>} 响应数据
   */
  async delete(url, options = {}) {
    return this.request(url, { ...options, method: 'DELETE' });
  }
}

// 创建默认实例
export const httpClient = new HttpClient();
