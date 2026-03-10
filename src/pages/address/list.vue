<script setup lang="ts">
import { ref, onMounted, onShow } from 'vue'
import { onPullDownRefresh } from '@dcloudio/uni-app'
import { addressApi } from '@/utils/api'
import type { Address } from '@/types'

declare const uni: any

const addresses = ref<Address[]>([])
const loading = ref(true)
const currentUserId = ref(1)

const loadAddresses = async () => {
  try {
    const user = uni.getStorageSync('user')
    if (user) {
      currentUserId.value = user.id
    }
    const data = await addressApi.getList(currentUserId.value)
    addresses.value = data
  } catch (error) {
    console.error('Failed to load addresses:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadAddresses()
})

onShow(async () => {
  await loadAddresses()
})

onPullDownRefresh(async () => {
  await loadAddresses()
  uni.stopPullDownRefresh()
})

const setDefault = async (address: Address) => {
  try {
    await addressApi.setDefault(address.id)
    uni.showToast({ title: '设置成功', icon: 'success' })
    await loadAddresses()
  } catch (error) {
    uni.showToast({ title: '设置失败', icon: 'none' })
  }
}

const editAddress = (address: Address) => {
  uni.navigateTo({
    url: `/pages/address/edit?id=${address.id}`
  })
}

const deleteAddress = (address: Address) => {
  uni.showModal({
    title: '提示',
    content: '确定要删除该地址吗？',
    success: async (res: any) => {
      if (res.confirm) {
        try {
          await addressApi.delete(address.id)
          uni.showToast({ title: '删除成功', icon: 'success' })
          await loadAddresses()
        } catch (error) {
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    }
  })
}

const addAddress = () => {
  uni.navigateTo({
    url: '/pages/address/edit'
  })
}
</script>

<template>
  <view class="page">
    <view v-if="loading" class="loading">
      <text class="loading-text">加载中...</text>
    </view>

    <view v-else-if="addresses.length === 0" class="empty">
      <text class="empty-icon">📍</text>
      <text class="empty-text">暂无收货地址</text>
      <button class="add-btn" @click="addAddress">添加地址</button>
    </view>

    <view v-else class="address-list">
      <view 
        v-for="address in addresses" 
        :key="address.id" 
        class="address-item"
      >
        <view class="address-content" @click="editAddress(address)">
          <view class="address-header">
            <text class="receiver-name">{{ address.receiverName }}</text>
            <text class="receiver-phone">{{ address.receiverPhone }}</text>
            <view v-if="address.isDefault" class="default-badge">默认</view>
          </view>
          <text class="address-detail">{{ address.province }}{{ address.city }}{{ address.district }}{{ address.detailAddress }}</text>
        </view>
        <view class="address-actions">
          <button class="action-btn" @click="setDefault(address)" v-if="!address.isDefault">
            设为默认
          </button>
          <button class="action-btn edit-btn" @click="editAddress(address)">
            编辑
          </button>
          <button class="action-btn delete-btn" @click="deleteAddress(address)">
            删除
          </button>
        </view>
      </view>
    </view>

    <view class="footer" v-if="addresses.length > 0">
      <button class="add-address-btn" @click="addAddress">+ 添加新地址</button>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
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
    margin-bottom: 32rpx;
  }
  
  .empty-icon {
    font-size: 120rpx;
    margin-bottom: 20rpx;
  }
  
  .add-btn {
    width: 280rpx;
    height: 80rpx;
    line-height: 80rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    font-size: 30rpx;
    font-weight: 500;
    border-radius: 40rpx;
    border: none;
  }
}

.address-list {
  padding: 20rpx;
}

.address-item {
  background: #fff;
  border-radius: 20rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
  
  .address-content {
    padding: 24rpx;
    
    .address-header {
      display: flex;
      align-items: center;
      margin-bottom: 16rpx;
      
      .receiver-name {
        font-size: 30rpx;
        font-weight: 600;
        color: #333;
        margin-right: 20rpx;
      }
      
      .receiver-phone {
        font-size: 26rpx;
        color: #666;
        margin-right: 12rpx;
      }
      
      .default-badge {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #fff;
        font-size: 20rpx;
        padding: 4rpx 12rpx;
        border-radius: 12rpx;
      }
    }
    
    .address-detail {
      display: block;
      font-size: 26rpx;
      color: #666;
      line-height: 1.6;
    }
  }
  
  .address-actions {
    display: flex;
    border-top: 1rpx solid #f0f0f0;
    
    .action-btn {
      flex: 1;
      height: 80rpx;
      line-height: 80rpx;
      text-align: center;
      font-size: 26rpx;
      border: none;
      background: #fff;
      color: #666;
      border-right: 1rpx solid #f0f0f0;
      
      &:last-child {
        border-right: none;
      }
      
      &.edit-btn {
        color: #667eea;
      }
      
      &.delete-btn {
        color: #f44336;
      }
    }
  }
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24rpx;
  background: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  z-index: 100;
  
  .add-address-btn {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    font-size: 32rpx;
    font-weight: 600;
    border-radius: 44rpx;
    border: none;
    
    &:active {
      opacity: 0.9;
      transform: scale(0.98);
    }
  }
}
</style>
