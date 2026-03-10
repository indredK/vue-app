<script setup lang="ts">
import { ref, computed, onMounted, onShow } from 'vue'
import { onPullDownRefresh } from '@dcloudio/uni-app'
import { orderApi } from '@/utils/api'
import type { Order } from '@/types'

declare const uni: any

const orderList = ref<Order[]>([])
const loading = ref(true)
const currentTab = ref(0)
const currentUserId = ref(1)

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待付款' },
  { key: 'paid', label: '待发货' },
  { key: 'shipped', label: '待收货' },
  { key: 'completed', label: '已完成' }
]

const filteredOrders = computed(() => {
  if (currentTab.value === 0) return orderList.value
  const status = tabs[currentTab.value].key
  return orderList.value.filter(order => order.status === status)
})

const loadOrders = async () => {
  try {
    const user = uni.getStorageSync('user')
    if (user) {
      currentUserId.value = user.id
    }
    const data: any = await orderApi.getList(currentUserId.value)
    orderList.value = data.map((item: any) => ({
      ...item,
      items: item.items || []
    }))
  } catch (error) {
    console.error('Failed to load orders:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadOrders()
})

onShow(async () => {
  await loadOrders()
})

onPullDownRefresh(async () => {
  await loadOrders()
  uni.stopPullDownRefresh()
})

const switchTab = (index: number) => {
  currentTab.value = index
}

const goToDetail = (order: Order) => {
  uni.navigateTo({
    url: `/pages/order/detail?id=${order.id}`
  })
}

const cancelOrder = (order: Order) => {
  if (order.status !== 'pending' && order.status !== 'paid') {
    uni.showToast({ title: '该订单无法取消', icon: 'none' })
    return
  }
  
  uni.showModal({
    title: '提示',
    content: '确定要取消该订单吗？',
    success: async (res: any) => {
      if (res.confirm) {
        try {
          await orderApi.cancel(order.id, { cancelReason: '用户取消' })
          uni.showToast({ title: '订单已取消', icon: 'success' })
          await loadOrders()
        } catch (error) {
          uni.showToast({ title: '取消失败', icon: 'none' })
        }
      }
    }
  })
}

const confirmReceipt = (order: Order) => {
  uni.showModal({
    title: '提示',
    content: '确定已收到商品吗？',
    success: async (res: any) => {
      if (res.confirm) {
        try {
          await orderApi.updateStatus(order.id, { status: 'completed', remark: '用户确认收货' })
          uni.showToast({ title: '确认收货成功', icon: 'success' })
          await loadOrders()
        } catch (error) {
          uni.showToast({ title: '操作失败', icon: 'none' })
        }
      }
    }
  })
}

const payOrder = (order: Order) => {
  uni.navigateTo({
    url: `/pages/checkout/index?orderId=${order.id}`
  })
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: '#ff9800',
    paid: '#2196f3',
    processing: '#9c27b0',
    shipped: '#4caf50',
    delivered: '#00bcd4',
    completed: '#8bc34a',
    cancelled: '#f44336'
  }
  return colors[status] || '#999'
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '待付款',
    paid: '待发货',
    processing: '处理中',
    shipped: '待收货',
    delivered: '已送达',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}
</script>

<template>
  <view class="page">
    <view class="tabs">
      <view 
        v-for="(tab, index) in tabs" 
        :key="tab.key" 
        class="tab-item"
        :class="{ active: currentTab === index }"
        @click="switchTab(index)"
      >
        <text class="tab-text">{{ tab.label }}</text>
      </view>
    </view>

    <view v-if="loading" class="loading">
      <text class="loading-text">加载中...</text>
    </view>

    <view v-else-if="filteredOrders.length === 0" class="empty">
      <text class="empty-icon">📦</text>
      <text class="empty-text">暂无订单</text>
    </view>

    <view v-else class="order-list">
      <view 
        v-for="order in filteredOrders" 
        :key="order.id" 
        class="order-item"
        @click="goToDetail(order)"
      >
        <view class="order-header">
          <text class="order-no">订单号：{{ order.orderNo }}</text>
          <text class="order-status" :style="{ color: getStatusColor(order.status) }">
            {{ getStatusText(order.status) }}
          </text>
        </view>

        <view class="order-items">
          <view 
            v-for="item in order.items" 
            :key="item.id" 
            class="order-item-preview"
          >
            <image :src="item.image" class="item-image" mode="aspectFill" />
            <view class="item-info">
              <text class="item-name">{{ item.name }}</text>
              <text class="item-quantity">x{{ item.quantity }}</text>
            </view>
          </view>
        </view>

        <view class="order-footer">
          <text class="order-total">实付：¥{{ order.finalAmount }}</text>
          <view class="order-actions">
            <button 
              v-if="order.status === 'pending' || order.status === 'paid'" 
              class="action-btn cancel-btn"
              @click.stop="cancelOrder(order)"
            >
              取消订单
            </button>
            <button 
              v-if="order.status === 'pending'" 
              class="action-btn pay-btn"
              @click.stop="payOrder(order)"
            >
              去支付
            </button>
            <button 
              v-if="order.status === 'shipped'" 
              class="action-btn confirm-btn"
              @click.stop="confirmReceipt(order)"
            >
              确认收货
            </button>
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

.tabs {
  display: flex;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  
  .tab-item {
    flex: 1;
    text-align: center;
    padding: 28rpx 0;
    position: relative;
    
    .tab-text {
      font-size: 28rpx;
      color: #666;
      transition: all 0.3s ease;
    }
    
    &.active .tab-text {
      color: #667eea;
      font-weight: 600;
    }
    
    &.active::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 60rpx;
      height: 4rpx;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 2rpx;
    }
  }
}

.loading, .empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
  
  .loading-text, .empty-text {
    font-size: 28rpx;
    color: #999;
  }
  
  .empty-icon {
    font-size: 120rpx;
    margin-bottom: 20rpx;
  }
}

.order-list {
  padding: 20rpx;
}

.order-item {
  background: #fff;
  border-radius: 20rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
  
  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx;
    border-bottom: 1rpx solid #f0f0f0;
    
    .order-no {
      font-size: 24rpx;
      color: #666;
    }
    
    .order-status {
      font-size: 26rpx;
      font-weight: 600;
    }
  }
  
  .order-items {
    padding: 24rpx;
    display: flex;
    gap: 16rpx;
    overflow-x: auto;
    
    .order-item-preview {
      flex-shrink: 0;
      width: 160rpx;
      
      .item-image {
        width: 160rpx;
        height: 160rpx;
        border-radius: 12rpx;
        background: #f5f5f5;
      }
      
      .item-info {
        margin-top: 12rpx;
        
        .item-name {
          display: block;
          font-size: 22rpx;
          color: #333;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .item-quantity {
          display: block;
          font-size: 20rpx;
          color: #999;
          margin-top: 4rpx;
        }
      }
    }
  }
  
  .order-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx;
    border-top: 1rpx solid #f0f0f0;
    
    .order-total {
      font-size: 28rpx;
      color: #333;
      
      text {
        color: #ff4757;
        font-weight: 600;
        font-size: 32rpx;
      }
    }
    
    .order-actions {
      display: flex;
      gap: 16rpx;
      
      .action-btn {
        padding: 12rpx 24rpx;
        border-radius: 24rpx;
        font-size: 24rpx;
        border: 1rpx solid #ddd;
        background: #fff;
        color: #666;
        
        &.cancel-btn {
          border-color: #ddd;
          color: #666;
        }
        
        &.pay-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #fff;
          border: none;
        }
        
        &.confirm-btn {
          background: #4caf50;
          color: #fff;
          border: none;
        }
      }
    }
  }
}
</style>
