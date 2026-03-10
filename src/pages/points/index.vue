<script setup lang="ts">
import { ref, onMounted, onShow } from 'vue'
import { onPullDownRefresh } from '@dcloudio/uni-app'
import { pointsApi } from '@/utils/api'
import type { PointRecord, PointBalance } from '@/types'

declare const uni: any

const balance = ref<PointBalance | null>(null)
const records = ref<PointRecord[]>([])
const loading = ref(true)
const currentUserId = ref(1)

const loadData = async () => {
  try {
    const user = uni.getStorageSync('user')
    if (user) {
      currentUserId.value = user.id
    }
    const [balanceData, recordsData] = await Promise.all([
      pointsApi.getBalance(currentUserId.value),
      pointsApi.getRecords(currentUserId.value)
    ])
    balance.value = balanceData
    records.value = recordsData
  } catch (error) {
    console.error('Failed to load points:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadData()
})

onShow(async () => {
  await loadData()
})

onPullDownRefresh(async () => {
  await loadData()
  uni.stopPullDownRefresh()
})

const getTypeIcon = (type: string) => {
  return type === 'earn' ? '📈' : '📉'
}

const getTypeText = (type: string) => {
  return type === 'earn' ? '获得' : '消费'
}

const getTypeColor = (type: string) => {
  return type === 'earn' ? '#4caf50' : '#f44336'
}
</script>

<template>
  <view class="page">
    <view v-if="loading" class="loading">
      <text class="loading-text">加载中...</text>
    </view>

    <view v-else>
      <view class="balance-card">
        <text class="balance-label">我的积分</text>
        <text class="balance-amount">{{ balance?.balance || 0 }}</text>
        <view class="balance-stats">
          <view class="stat-item">
            <text class="stat-label">累计获得</text>
            <text class="stat-value">+{{ balance?.stats.totalEarned || 0 }}</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <text class="stat-label">累计消费</text>
            <text class="stat-value">-{{ balance?.stats.totalSpent || 0 }}</text>
          </view>
        </view>
      </view>

      <view class="records-section">
        <view class="section-title">积分记录</view>
        
        <view v-if="records.length === 0" class="empty-records">
          <text class="empty-icon">📝</text>
          <text class="empty-text">暂无积分记录</text>
        </view>

        <view v-else class="records-list">
          <view 
            v-for="record in records" 
            :key="record.id" 
            class="record-item"
          >
            <view class="record-left">
              <text class="record-icon">{{ getTypeIcon(record.type) }}</text>
              <view class="record-info">
                <text class="record-desc">{{ record.description }}</text>
                <text class="record-time">{{ record.createdAt }}</text>
              </view>
            </view>
            <view class="record-right">
              <text 
                class="record-amount" 
                :style="{ color: getTypeColor(record.type) }"
              >
                {{ record.type === 'earn' ? '+' : '-' }}{{ record.amount }}
              </text>
              <text class="record-balance">余额：{{ record.balance }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 20rpx;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  
  .loading-text {
    font-size: 28rpx;
    color: #999;
  }
}

.balance-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin: 20rpx 24rpx;
  border-radius: 24rpx;
  padding: 48rpx 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(102, 126, 234, 0.3);
  
  .balance-label {
    display: block;
    font-size: 26rpx;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 16rpx;
  }
  
  .balance-amount {
    display: block;
    font-size: 80rpx;
    font-weight: bold;
    color: #fff;
    margin-bottom: 32rpx;
  }
  
  .balance-stats {
    display: flex;
    gap: 32rpx;
    
    .stat-item {
      flex: 1;
      
      .stat-label {
        display: block;
        font-size: 22rpx;
        color: rgba(255, 255, 255, 0.7);
        margin-bottom: 8rpx;
      }
      
      .stat-value {
        display: block;
        font-size: 32rpx;
        font-weight: 600;
        color: #fff;
      }
    }
    
    .stat-divider {
      width: 1rpx;
      background: rgba(255, 255, 255, 0.3);
    }
  }
}

.records-section {
  margin: 20rpx 24rpx;
  
  .section-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 20rpx;
  }
}

.empty-records {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 0;
  
  .empty-icon {
    font-size: 100rpx;
    margin-bottom: 16rpx;
  }
  
  .empty-text {
    font-size: 26rpx;
    color: #999;
  }
}

.records-list {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
  
  .record-left {
    display: flex;
    align-items: center;
    flex: 1;
    
    .record-icon {
      font-size: 40rpx;
      margin-right: 16rpx;
    }
    
    .record-info {
      flex: 1;
      
      .record-desc {
        display: block;
        font-size: 28rpx;
        color: #333;
        margin-bottom: 8rpx;
      }
      
      .record-time {
        display: block;
        font-size: 22rpx;
        color: #999;
      }
    }
  }
  
  .record-right {
    text-align: right;
    
    .record-amount {
      display: block;
      font-size: 32rpx;
      font-weight: 600;
      margin-bottom: 4rpx;
    }
    
    .record-balance {
      display: block;
      font-size: 22rpx;
      color: #999;
    }
  }
}
</style>
