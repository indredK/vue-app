<script setup lang="ts">
import { ref } from 'vue'
import { userInfo, settingsList, aboutList } from '@/mock'

const localSettingsList = ref([...settingsList])
const localAboutList = ref([...aboutList])

const goToEdit = () => {
  uni.navigateTo({
    url: '/pages/settings/profile'
  })
}

const onSwitchChange = (item: any) => {
  item.switchValue = !item.switchValue
  uni.showToast({
    title: item.switchValue ? '已开启' : '已关闭',
    icon: 'none'
  })
}

const handleClick = (item: any) => {
  if (item.switch) return
  if (item.path) {
    uni.navigateTo({
      url: item.path
    })
  }
}

const logout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({
          title: '已退出登录',
          icon: 'success'
        })
      }
    }
  })
}
</script>

<template>
  <view class="page">
    <view class="user-card">
      <view class="avatar-section" @click="goToEdit">
        <view class="avatar-wrapper">
          <image :src="userInfo.avatar" class="avatar" mode="aspectFill" />
          <view class="avatar-badge">编辑</view>
        </view>
        <view class="user-info">
          <text class="nickname">{{ userInfo.nickname }}</text>
          <view class="user-tags">
            <text class="tag">⭐ VIP会员</text>
          </view>
          <text class="phone">{{ userInfo.phone }}</text>
        </view>
        <text class="edit-icon">›</text>
      </view>
    </view>
    
    <view class="stats-bar">
      <view class="stat-item">
        <text class="stat-num">12</text>
        <text class="stat-label">待付款</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-num">3</text>
        <text class="stat-label">待发货</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-num">5</text>
        <text class="stat-label">待收货</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-num">8</text>
        <text class="stat-label">评价</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-num">2</text>
        <text class="stat-label">退款</text>
      </view>
    </view>
    
    <view class="section">
      <view class="section-title">设置</view>
      <view class="settings-list">
        <view 
          v-for="item in localSettingsList" 
          :key="item.id" 
          class="settings-item"
          @click="handleClick(item)"
        >
          <view class="item-left">
            <text class="item-icon">{{ item.icon }}</text>
            <text class="item-title">{{ item.title }}</text>
          </view>
          <view class="item-right">
            <text v-if="item.value" class="item-value">{{ item.value }}</text>
            <switch 
              v-if="item.switch" 
              :checked="item.switchValue" 
              @change="onSwitchChange(item)"
              color="#667eea"
            />
            <text v-else class="arrow">›</text>
          </view>
        </view>
      </view>
    </view>
    
    <view class="section">
      <view class="section-title">其他</view>
      <view class="settings-list">
        <view 
          v-for="item in localAboutList" 
          :key="item.id" 
          class="settings-item"
          @click="handleClick(item)"
        >
          <view class="item-left">
            <text class="item-icon">{{ item.icon }}</text>
            <text class="item-title">{{ item.title }}</text>
          </view>
          <view class="item-right">
            <text class="arrow">›</text>
          </view>
        </view>
      </view>
    </view>
    
    <view class="logout-btn" @click="logout">
      退出登录
    </view>
    
    <view class="version">Version 1.0.0</view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
  padding-bottom: 40rpx;
}

.user-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 40rpx 40rpx;
  
  .avatar-section {
    display: flex;
    align-items: center;
    
    .avatar-wrapper {
      position: relative;
      
      .avatar {
        width: 140rpx;
        height: 140rpx;
        border-radius: 70rpx;
        border: 6rpx solid rgba(255, 255, 255, 0.3);
      }
      
      .avatar-badge {
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.3);
        color: #fff;
        font-size: 18rpx;
        padding: 4rpx 12rpx;
        border-radius: 12rpx;
      }
    }
    
    .user-info {
      flex: 1;
      margin-left: 28rpx;
      
      .nickname {
        display: block;
        color: #fff;
        font-size: 40rpx;
        font-weight: bold;
      }
      
      .user-tags {
        margin-top: 10rpx;
        
        .tag {
          background: rgba(255, 255, 255, 0.2);
          color: #fff;
          font-size: 20rpx;
          padding: 6rpx 16rpx;
          border-radius: 20rpx;
        }
      }
      
      .phone {
        display: block;
        color: rgba(255, 255, 255, 0.8);
        font-size: 26rpx;
        margin-top: 10rpx;
      }
    }
    
    .edit-icon {
      color: rgba(255, 255, 255, 0.8);
      font-size: 44rpx;
    }
  }
}

.stats-bar {
  display: flex;
  background: #fff;
  margin: -20rpx 32rpx 0;
  border-radius: 20rpx;
  padding: 32rpx 20rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
  position: relative;
  z-index: 10;
  
  .stat-item {
    flex: 1;
    text-align: center;
    position: relative;
    
    .stat-num {
      display: block;
      font-size: 40rpx;
      font-weight: bold;
      color: #212529;
    }
    
    .stat-label {
      display: block;
      font-size: 22rpx;
      color: #868e96;
      margin-top: 6rpx;
    }
  }
  
  .stat-divider {
    width: 1rpx;
    height: 60rpx;
    background: #e9ecef;
    margin-top: 10rpx;
  }
}

.section {
  margin-top: 32rpx;
  
  .section-title {
    padding: 0 40rpx;
    font-size: 26rpx;
    color: #868e96;
    margin-bottom: 12rpx;
  }
  
  .settings-list {
    background: #fff;
    margin: 0 32rpx;
    border-radius: 20rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
    
    .settings-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 28rpx 24rpx;
      border-bottom: 1rpx solid #f8f9fa;
      
      &:last-child {
        border-bottom: none;
      }
      
      .item-left {
        display: flex;
        align-items: center;
        
        .item-icon {
          font-size: 36rpx;
          margin-right: 20rpx;
        }
        
        .item-title {
          font-size: 28rpx;
          color: #212529;
        }
      }
      
      .item-right {
        display: flex;
        align-items: center;
        
        .item-value {
          font-size: 26rpx;
          color: #868e96;
          margin-right: 10rpx;
        }
        
        .arrow {
          color: #ced4da;
          font-size: 32rpx;
        }
      }
    }
  }
}

.logout-btn {
  margin: 48rpx 32rpx 0;
  height: 88rpx;
  line-height: 88rpx;
  background: #fff;
  color: #ff6b6b;
  text-align: center;
  font-size: 30rpx;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
  
  &:active {
    background: #fff5f5;
  }
}

.version {
  text-align: center;
  color: #adb5bd;
  font-size: 22rpx;
  margin-top: 40rpx;
}
</style>
