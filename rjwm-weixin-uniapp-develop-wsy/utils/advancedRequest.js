import store from './../store'
import { baseUrl } from './env'

// Cache for storing responses
const responseCache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Performance monitoring
const performanceMetrics = []

/**
 * Enhanced HTTP request function with caching, performance monitoring, and better error handling
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
export function advancedRequest({
  url = '',
  params = {},
  method = 'GET',
  cache = false,
  cacheDuration = CACHE_DURATION,
  retry = false,
  retryCount = 3
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
  
  // Get store info for authentication
  const storeInfo = store.state
  
  // Build request header
  const header = {
    'Accept': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    // User authentication token
    'authentication': storeInfo.token
  }
  
  // Performance tracking start time
  const startTime = Date.now()
  
  // Create and return Promise object
  return new Promise((resolve, reject) => {
    // Set loading state
    store.commit('setLodding', false)
    
    // Make the request
    const makeRequest = (attempts = 0) => {
      uni.request({
        url: baseUrl + url,
        data: params,
        header: header,
        method: method,
        timeout: 10000, // Set request timeout to 10 seconds
        success: (res) => {
          const { data } = res
          // Record performance metrics
          const endTime = Date.now()
          const duration = endTime - startTime
          performanceMetrics.push({
            url,
            method,
            duration,
            timestamp: endTime,
            status: res.statusCode
          })
          
          // Cache successful responses if caching is enabled
          if (cache && (data.code == 200 || data.code === 1)) {
            responseCache.set(cacheKey, {
              data: res.data,
              timestamp: Date.now()
            })
          }
          
          // Check response code
          if (data.code == 200 || data.code === 1) {
            resolve(res.data)
          } else {
            // Handle error responses
            console.error(`Request failed for ${url}:`, data)
            reject(res.data)
          }
        },
        fail: (err) => {
          const endTime = Date.now()
          const duration = endTime - startTime
          performanceMetrics.push({
            url,
            method,
            duration,
            timestamp: endTime,
            status: 'failed',
            error: err
          })
          
          // Retry logic
          if (retry && attempts < retryCount) {
            console.log(`Retrying request for ${url} (attempt ${attempts + 1})`)
            setTimeout(() => makeRequest(attempts + 1), 1000 * (attempts + 1))
          } else {
            // Network request failure handling
            const error = { data: { msg: err.errMsg || 'Network request failed' } }
            console.error(`Network request failed for ${url}:`, error)
            reject(error)
          }
        },
        complete: () => {
          // Request completed, restore loading state
          store.commit('setLodding', true)
        }
      })
    }
    
    // Start the request
    makeRequest()
  })
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