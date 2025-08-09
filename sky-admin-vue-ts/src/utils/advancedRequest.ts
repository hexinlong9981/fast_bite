import axios from 'axios'
import { UserModule } from '@/store/modules/user'
import {
  getRequestKey,
  pending,
  checkPending,
  removePending
} from './requestOptimize'
import router from '@/router'

const CancelToken = axios.CancelToken

// Cache for storing responses
const responseCache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Performance monitoring
const performanceMetrics: any[] = []

const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 600000
})

// Request interceptors
service.interceptors.request.use(
  (config: any) => {
    // Add X-Access-Token header to every request, you can add other custom headers here
    if (UserModule.token) {
      config.headers['token'] = UserModule.token
    } else if (UserModule.token && config.url != '/login') {
      window.location.href = '/login'
      return false
    }

    // get请求映射params参数
    if (config.method === 'get' && config.params) {
      let url = config.url + '?';
      for (const propName of Object.keys(config.params)) {
        const value = config.params[propName];
        var part = encodeURIComponent(propName) + '=';
        if (value !== null && typeof (value) !== 'undefined') {
          if (typeof value === 'object') {
            for (const key of Object.keys(value)) {
              let params = propName + '[' + key + ']';
              var subPart = encodeURIComponent(params) + '=';
              url += subPart + encodeURIComponent(value[key]) + '&';
            }
          } else {
            url += part + encodeURIComponent(value) + '&';
          }
        }
      }
      url = url.slice(0, -1);
      config.params = {};
      config.url = url;
    }
    
    // 计算当前请求key值
    const key = getRequestKey(config);
    
    // Check if cached response exists and is still valid
    if (checkPending(key)) {
      // 重复请求则取消当前请求
      const source = CancelToken.source();
      config.cancelToken = source.token;
      source.cancel('重复请求');
    } else {
      // 加入请求字典
      pending[key] = true;
    }
    
    return config
  },
  (error: any) => {
    Promise.reject(error)
  }
)

// Response interceptors
service.interceptors.response.use(
  (response: any) => {
    if (response.data.status === 401) {
      router.push('/login')
    }
    
    //请求响应中的config的url会带上代理的api需要去掉
    response.config.url = response.config.url.replace('/api', '')
    // 请求完成，删除请求中状态
    const key = getRequestKey(response.config);
    removePending(key);
    
    if (response.data.code === 1) {
      return response
    }
    
    return response
  },
  (error: any) => {
    if (error && error.response) {
      switch (error.response.status) {
        case 401:
          router.push('/login')
          break;
        case 405:
          error.message = '请求错误'
      }
    }
    
    //请求响应中的config的url会带上代理的api需要去掉
    error.config.url = error.config.url.replace('/api', '')
    // 请求完成，删除请求中状态
    const key = getRequestKey(error.config);
    removePending(key);
    
    return Promise.reject(error)
  }
)

/**
 * Advanced HTTP request function with caching, performance monitoring, and better error handling
 * @param {Object} options - Request configuration options
 * @param {string} options.url - Request URL (relative path)
 * @param {Object} options.params - Request parameters
 * @param {string} options.method - Request method (GET/POST/PUT/DELETE, etc.)
 * @param {boolean} options.cache - Whether to cache the response
 * @param {number} options.cacheDuration - Cache duration in milliseconds
 * @param {boolean} options.retry - Whether to retry on failure
 * @param {number} options.retryCount - Number of retry attempts
 * @returns {Promise} Returns Promise object
 */
export async function advancedRequest({
  url = '',
  params = {},
  method = 'GET',
  cache = false,
  cacheDuration = CACHE_DURATION,
  retry = false,
  retryCount = 3
}: {
  url: string,
  params?: any,
  method?: string,
  cache?: boolean,
  cacheDuration?: number,
  retry?: boolean,
  retryCount?: number
}) {
  // Generate cache key
  const cacheKey = `${method}:${url}:${JSON.stringify(params)}`
  
  // Check if cached response exists and is still valid
  if (cache && responseCache.has(cacheKey)) {
    const cachedItem = responseCache.get(cacheKey)
    if (Date.now() - cachedItem.timestamp < cacheDuration) {
      console.log(`Returning cached response for ${url}`)
      return Promise.resolve(cachedItem.data)
    } else {
      // Remove expired cache
      responseCache.delete(cacheKey)
    }
  }
  
  // Performance tracking start time
  const startTime = Date.now()
  
  // Make the request
  const makeRequest = async (attempts = 0): Promise<any> => {
    try {
      const response = await service({
        url,
        method,
        data: method === 'GET' ? undefined : params,
        params: method === 'GET' ? params : undefined
      })
      
      // Record performance metrics
      const endTime = Date.now()
      const duration = endTime - startTime
      performanceMetrics.push({
        url,
        method,
        duration,
        timestamp: endTime,
        status: response.status
      })
      
      // Cache successful responses if caching is enabled
      if (cache && response.data.code === 1) {
        responseCache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now()
        })
      }
      
      return response.data
    } catch (error: any) {
      const endTime = Date.now()
      const duration = endTime - startTime
      performanceMetrics.push({
        url,
        method,
        duration,
        timestamp: endTime,
        status: 'failed',
        error: error.message || 'Unknown error'
      })
      
      // Retry logic
      if (retry && attempts < retryCount) {
        console.log(`Retrying request for ${url} (attempt ${attempts + 1})`)
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempts + 1)))
        return makeRequest(attempts + 1)
      } else {
        throw error
      }
    }
  }
  
  return makeRequest()
}

/**
 * Get performance metrics
 * @returns {Array} Array of performance metrics
 */
export function getPerformanceMetrics() {
  return performanceMetrics
}

/**
 * Clear cache
 */
export function clearCache() {
  responseCache.clear()
}

/**
 * Get cache size
 * @returns {number} Number of cached items
 */
export function getCacheSize() {
  return responseCache.size
}

export default service