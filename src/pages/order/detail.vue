<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { orderApi } from '@/utils/api'
import type { Order } from '@/types'

declare const uni: any

const order = ref<Order | null>(null)
const loading = ref(true)

const loadOrderDetail = async (id: number) => {
  try {
    const data: any = await orderApi.getDetail(id)
    order.value = data
  } catch (error) {
    console.error('Failed to load order detail:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

onLoad(async (options: { id?: string }) => {
  if (options.id) {
    await loadOrderDetail(Number(options.id))
  }
})

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

const copyOrderNo = () => {
  if (order.value) {
    uni.setClipboardData({
      data: order.value.orderNo,
      success: () => {
        uni.showToast({ title: '已复制', icon: 'success' })
      }
    })
  }
}

const cancelOrder = () => {
  if (!order.value) return
  if (order.value.status !== 'pending' && order.value.status !== 'paid') {
    uni.showToast({ title: '该订单无法取消', icon: 'none' })
    return
  }
  
  uni.showModal({
    title: '提示',
    content: '确定要取消该订单吗？',
    success: async (res: any) => {
      if (res.confirm) {
        try {
          await orderApi.cancel(order.value!.id, { cancelReason: '用户取消' })
          uni.showToast({ title: '订单已取消', icon: 'success' })
          await loadOrderDetail(order.value!.id)
        } catch (error) {
          uni.showToast({ title: '取消失败', icon: 'none' })
        }
      }
    }
  })
}

const confirmReceipt = () => {
  if (!order.value) return
  uni.showModal({
    title: '提示',
    content: '确定已收到商品吗？',
    success: async (res: any) => {
      if (res.confirm) {
        try {
          await orderApi.updateStatus(order.value!.id, { status: 'completed', remark: '用户确认收货' })
          uni.showToast({ title: '确认收货成功', icon: 'success' })
          await loadOrderDetail(order.value!.id)
        } catch (error) {
          uni.showToast({ title: '操作失败', icon: 'none' })
        }
      }
    }
  })
}

const payOrder = () => {
  if (!order.value) return
  uni.navigateTo({
    url: `/pages/checkout/index?orderId=${order.value.id}`
  })
}

const goBack = () => {
  uni.navigateBack()
}
</script>

<template>
  <view class="page" v-if="!loading && order">
    <view class="status-section" :style="{ background: getStatusColor(order.status) }">
      <text class="status-icon">📦</text>
      <text class="status-text">{{ getStatusText(order.status) }}</text>
      <text class="order-no" @click="copyOrderNo">订单号：{{ order.orderNo }} 📋</text>
    </view>

    <view class="address-section">
      <view class="section-title">收货地址</view>
      <view class="address-content">
        <text class="receiver-info">{{ order.receiverName }} {{ order.receiverPhone }}</text>
        <text class="address-detail">{{ order.province }}{{ order.city }}{{ order.district }}{{ order.detailAddress }}</text>
      </view>
    </view>

    <view class="items-section">
      <view class="section-title">商品信息</view>
      <view class="items-list">
        <view v-for="item in order.items" :key="item.id" class="item-row">
          <image :src="item.image" class="item-image" mode="aspectFill" />
          <view class="item-info">
            <text class="item-name">{{ item.name }}</text>
            <text class="item-specs">规格：默认</text>
            <view class="item-bottom">
              <text class="item-price">¥{{ item.price }}</text>
              <text class="item-quantity">x{{ item.quantity }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="price-section">
      <view class="price-row">
        <text class="price-label">商品总额</text>
        <text class="price-value">¥{{ order.totalAmount }}</text>
      </view>
      <view class="price-row" v-if="order.discountAmount > 0">
        <text class="price-label">优惠金额</text>
        <text class="price-value discount">-¥{{ order.discountAmount }}</text>
      </view>
      <view class="price-row" v-if="order.pointsUsed > 0">
        <text class="price-label">积分抵扣</text>
        <text class="price-value discount">-¥{{ order.pointsDiscount }}</text>
      </view>
      <view class="price-row total">
        <text class="price-label">实付金额</text>
        <text class="price-value">¥{{ order.finalAmount }}</text>
      </view>
    </view>

    <view class="info-section">
      <view class="section-title">订单信息</view>
      <view class="info-list">
        <view class="info-item">
          <text class="info-label">订单编号</text>
          <text class="info-value">{{ order.orderNo }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">下单时间</text>
          <text class="info-value">{{ order.createdAt }}</text>
        </view>
        <view class="info-item" v-if="order.paymentTime">
          <text class="info-label">支付时间</text>
          <text class="info-value">{{ order.paymentTime }}</text>
        </view>
        <view class="info-item" v-if="order.shippingTime">
          <text class="info-label">发货时间</text>
          <text class="info-value">{{ order.shippingTime }}</text>
        </view>
        <view class="info-item" v-if="order.receivedTime">
          <text class="info-label">收货时间</text>
          <text class="info-value">{{ order.receivedTime }}</text>
        </view>
        <view class="info-item" v-if="order.remark">
          <text class="info-label">订单备注</text>
          <text class="info-value">{{ order.remark }}</text>
        </view>
      </view>
    </view>

    <view class="timeline-section" v-if="order.history && order.history.length > 0">
      <view class="section-title">订单进度</view>
      <view class="timeline">
        <view 
          v-for="(item, index) in order.history" 
          :key="item.id" 
          class="timeline-item"
        >
          <view class="timeline-dot"></view>
          <view class="timeline-content">
            <text class="timeline-status">{{ getStatusText(item.status) }}</text>
            <text class="timeline-time">{{ item.createdAt }}</text>
            <text class="timeline-remark" v-if="item.remark">{{ item.remark }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="actions-section" v-if="order.status !== 'completed' && order.status !== 'cancelled'">
      <button 
        v-if="order.status === 'pending' || order.status === 'paid'" 
        class="action-btn cancel-btn"
        @click="cancelOrder"
      >
        取消订单
      </button>
      <button 
        v-if="order.status === 'pending'" 
        class="action-btn pay-btn"
        @click="payOrder"
      >
        去支付
      </button>
      <button 
        v-if="order.status === 'shipped'" 
        class="action-btn confirm-btn"
        @click="confirmReceipt"
      >
        确认收货
      </button>
    </view>
  </view>

  <view v-else-if="loading" class="loading">
    <text class="loading-text">加载中...</text>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.status-section {
  padding: 60rpx 40rpx;
  text-align: center;
  
  .status-icon {
    font-size: 80rpx;
    display: block;
    margin-bottom: 20rpx;
  }
  
  .status-text {
    display: block;
    font-size: 36rpx;
    font-weight: bold;
    color: #fff;
    margin-bottom: 12rpx;
  }
  
  .order-no {
    display: block;
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.9);
  }
}

.address-section, .items-section, .price-section, .info-section, .timeline-section {
  background: #fff;
  margin: 20rpx 24rpx;
  border-radius: 20rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
  
  .section-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 20rpx;
  }
}

.address-section {
  .address-content {
    .receiver-info {
      display: block;
      font-size: 28rpx;
      font-weight: 600;
      color: #333;
      margin-bottom: 12rpx;
    }
    
    .address-detail {
      display: block;
      font-size: 26rpx;
      color: #666;
      line-height: 1.6;
    }
  }
}

.items-section {
  .items-list {
    .item-row {
      display: flex;
      margin-bottom: 24rpx;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .item-image {
        width: 160rpx;
        height: 160rpx;
        border-radius: 12rpx;
        background: #f5f5f5;
      }
      
      .item-info {
        flex: 1;
        margin-left: 20rpx;
        
        .item-name {
          display: block;
          font-size: 28rpx;
          font-weight: 500;
          color: #333;
          margin-bottom: 8rpx;
        }
        
        .item-specs {
          display: block;
          font-size: 24rpx;
          color: #999;
          margin-bottom: 12rpx;
        }
        
        .item-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          
          .item-price {
            font-size: 32rpx;
            font-weight: 600;
            color: #ff4757;
          }
          
          .item-quantity {
            font-size: 26rpx;
            color: #999;
          }
        }
      }
    }
  }
}

.price-section {
  .price-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .price-label {
      font-size: 26rpx;
      color: #666;
    }
    
    .price-value {
      font-size: 28rpx;
      color: #333;
      
      &.discount {
        color: #ff4757;
      }
    }
    
    &.total {
      padding-top: 16rpx;
      border-top: 1rpx solid #f0f0f0;
      margin-top: 16rpx;
      
      .price-label {
        font-size: 28rpx;
        font-weight: 600;
      }
      
      .price-value {
        font-size: 36rpx;
        font-weight: bold;
        color: #ff4757;
      }
    }
  }
}

.info-section {
  .info-list {
    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16rpx;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .info-label {
        font-size: 26rpx;
        color: #999;
      }
      
      .info-value {
        font-size: 26rpx;
        color: #333;
        text-align: right;
        flex: 1;
        margin-left: 20rpx;
      }
    }
  }
}

.timeline-section {
  .timeline {
    .timeline-item {
      display: flex;
      padding-left: 40rpx;
      position: relative;
      margin-bottom: 32rpx;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      &::before {
        content: '';
        position: absolute;
        left: 12rpx;
        top: 24rpx;
        bottom: -32rpx;
        width: 2rpx;
        background: #e0e0e0;
      }
      
      &:last-child::before {
        display: none;
      }
      
      .timeline-dot {
        position: absolute;
        left: 0;
        top: 8rpx;
        width: 24rpx;
        height: 24rpx;
        border-radius: 50%;
        background: #667eea;
        border: 4rpx solid #fff;
        box-shadow: 0 0 0 2rpx #667eea;
      }
      
      .timeline-content {
        flex: 1;
        
        .timeline-status {
          display: block;
          font-size: 28rpx;
          font-weight: 600;
          color: #333;
          margin-bottom: 8rpx;
        }
        
        .timeline-time {
          display: block;
          font-size: 24rpx;
          color: #999;
          margin-bottom: 4rpx;
        }
        
        .timeline-remark {
          display: block;
          font-size: 24rpx;
          color: #666;
        }
      }
    }
  }
}

.actions-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 24rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
  
  .action-btn {
    padding: 16rpx 32rpx;
    border-radius: 32rpx;
    font-size: 28rpx;
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
</style>
