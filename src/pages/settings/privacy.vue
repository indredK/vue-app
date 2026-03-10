<script setup lang="ts">
import { ref } from 'vue'

declare const uni: any

const privacyOptions = ref([
  { id: 1, title: '个人信息公开', description: '允许其他用户查看您的个人信息', enabled: true },
  { id: 2, title: '订单隐私', description: '隐藏订单详情中的敏感信息', enabled: true },
  { id: 3, title: '收藏隐私', description: '不公开显示您的收藏列表', enabled: false },
  { id: 4, title: '浏览记录隐私', description: '不保存浏览历史记录', enabled: false },
  { id: 5, title: '位置信息', description: '允许获取您的位置信息', enabled: false },
])

const handleSwitchChange = (item: any) => {
  item.enabled = !item.enabled
  uni.showToast({
    title: item.enabled ? '已开启' : '已关闭',
    icon: 'none'
  })
}

const saveSettings = () => {
  uni.showToast({
    title: '保存成功',
    icon: 'success'
  })
  setTimeout(() => {
    uni.navigateBack()
  }, 1500)
}
</script>

<template>
  <view class="page">
    <view class="privacy-list">
      <view 
        v-for="item in privacyOptions" 
        :key="item.id" 
        class="privacy-item"
      >
        <view class="item-content">
          <text class="item-title">{{ item.title }}</text>
          <text class="item-description">{{ item.description }}</text>
        </view>
        <switch 
          :checked="item.enabled" 
          @change="handleSwitchChange(item)"
          color="#667eea"
        />
      </view>
    </view>
    
    <view class="tips-section">
      <view class="tips-title">隐私说明</view>
      <view class="tips-content">
        <text class="tips-text">1. 您的个人信息将受到严格保护</text>
        <text class="tips-text">2. 我们不会向第三方泄露您的隐私信息</text>
        <text class="tips-text">3. 您可以随时调整隐私设置</text>
        <text class="tips-text">4. 关闭某些功能可能会影响使用体验</text>
      </view>
    </view>
    
    <view class="save-btn" @click="saveSettings">
      保存设置
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;
}

.privacy-list {
  background: #fff;
  margin: 20rpx 32rpx;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
  
  .privacy-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 32rpx 24rpx;
    border-bottom: 1rpx solid #f8f9fa;
    
    &:last-child {
      border-bottom: none;
    }
    
    .item-content {
      flex: 1;
      margin-right: 20rpx;
      
      .item-title {
        display: block;
        font-size: 30rpx;
        font-weight: 500;
        color: #333;
        margin-bottom: 8rpx;
      }
      
      .item-description {
        display: block;
        font-size: 24rpx;
        color: #999;
        line-height: 1.5;
      }
    }
  }
}

.tips-section {
  margin: 32rpx 32rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 32rpx 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
  
  .tips-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 20rpx;
  }
  
  .tips-content {
    .tips-text {
      display: block;
      font-size: 26rpx;
      color: #666;
      line-height: 2;
      margin-bottom: 8rpx;
    }
  }
}

.save-btn {
  margin: 48rpx 32rpx 0;
  height: 96rpx;
  line-height: 96rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  text-align: center;
  font-size: 32rpx;
  font-weight: 500;
  border-radius: 48rpx;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
  
  &:active {
    transform: scale(0.98);
    box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.3);
  }
}
</style>
