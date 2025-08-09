<template>
  <view class="performance-monitor" v-if="showMonitor">
    <view class="monitor-header" @click="toggleMonitor">
      <text class="header-text">Performance Monitor</text>
      <text class="toggle-icon">{{ isExpanded ? '▲' : '▼' }}</text>
    </view>
    <view class="monitor-content" v-if="isExpanded">
      <view class="metrics-summary">
        <view class="metric-item">
          <text class="metric-label">Avg Response:</text>
          <text class="metric-value">{{ averageResponseTime }}ms</text>
        </view>
        <view class="metric-item">
          <text class="metric-label">Cache Hits:</text>
          <text class="metric-value">{{ cacheHits }}</text>
        </view>
        <view class="metric-item">
          <text class="metric-label">Retries:</text>
          <text class="metric-value">{{ retryCount }}</text>
        </view>
      </view>
      <view class="recent-requests">
        <text class="section-title">Recent Requests</text>
        <view class="request-item" v-for="(request, index) in recentRequests" :key="index">
          <text class="request-url">{{ request.url }}</text>
          <text class="request-duration">{{ request.duration }}ms</text>
          <text class="request-status" :class="{'status-error': request.status >= 400}">{{ request.status }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getPerformanceMetrics, getCacheSize } from '../../utils/advancedRequest.js'

export default {
  name: 'PerformanceMonitor',
  data() {
    return {
      showMonitor: false,
      isExpanded: false,
      metrics: [],
      cacheHits: 0
    }
  },
  computed: {
    averageResponseTime() {
      if (this.metrics.length === 0) return 0
      const total = this.metrics.reduce((sum, metric) => sum + metric.duration, 0)
      return Math.round(total / this.metrics.length)
    },
    retryCount() {
      return this.metrics.filter(metric => metric.retry).length
    },
    recentRequests() {
      return this.metrics.slice(-5).reverse()
    }
  },
  mounted() {
    // Only show monitor in development mode
    if (process.env.NODE_ENV === 'development') {
      this.showMonitor = true
      this.startMonitoring()
    }
  },
  methods: {
    toggleMonitor() {
      this.isExpanded = !this.isExpanded
    },
    startMonitoring() {
      // Update metrics periodically
      setInterval(() => {
        this.metrics = getPerformanceMetrics()
        this.cacheHits = getCacheSize()
      }, 2000)
    }
  }
}
</script>

<style scoped>
.performance-monitor {
  position: fixed;
  bottom: 20rpx;
  right: 20rpx;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 10rpx;
  color: white;
  z-index: 9999;
  max-width: 90%;
}

.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  cursor: pointer;
}

.header-text {
  font-weight: bold;
  font-size: 28rpx;
}

.toggle-icon {
  font-size: 24rpx;
}

.monitor-content {
  padding: 0 20rpx 20rpx;
}

.metrics-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-bottom: 20rpx;
}

.metric-item {
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.1);
  padding: 10rpx;
  border-radius: 5rpx;
  min-width: 120rpx;
}

.metric-label {
  font-size: 20rpx;
  opacity: 0.8;
}

.metric-value {
  font-size: 24rpx;
  font-weight: bold;
}

.section-title {
  display: block;
  font-weight: bold;
  margin: 20rpx 0 10rpx;
}

.request-item {
  display: flex;
  justify-content: space-between;
  padding: 10rpx 0;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);
  font-size: 20rpx;
}

.request-url {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 10rpx;
}

.request-duration {
  min-width: 80rpx;
  text-align: right;
  margin-right: 10rpx;
}

.request-status {
  min-width: 60rpx;
  text-align: right;
}

.status-error {
  color: #ff4d4f;
}
</style>