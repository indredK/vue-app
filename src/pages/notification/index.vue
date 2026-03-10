<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onPullDownRefresh, onShow } from '@dcloudio/uni-app'
import { notificationApi } from '@/utils/api'
import type { Notification } from '@/types'

declare const uni: any

const notifications = ref<Notification[]>([])
const unreadCount = ref(0)
const loading = ref(true)
const currentUserId = ref(1)

const loadNotifications = async () => {
  try {
    const user = uni.getStorageSync('user')
    if (user) {
      currentUserId.value = user.id
    }
    const [data, countData] = await Promise.all([
      notificationApi.getList(currentUserId.value),
      notificationApi.getUnreadCount(currentUserId.value)
    ])
    notifications.value = data.notifications || data
    unreadCount.value = countData.count || 0
  } catch (error) {
    console.error('Failed to load notifications:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadNotifications()
})

onShow(async () => {
  await loadNotifications()
})

onPullDownRefresh(async () => {
  await loadNotifications()
  uni.stopPullDownRefresh()
})

const markAsRead = async (notification: Notification) => {
  if (notification.isRead) return
  
  try {
    await notificationApi.markRead(notification.id)
    notification.isRead = true
    unreadCount.value = Math.max(0, unreadCount.value - 1)
  } catch (error) {
    console.error('Failed to mark as read:', error)
  }
}

const markAllAsRead = async () => {
  try {
    await notificationApi.markAllRead(currentUserId.value)
    notifications.value.forEach(n => n.isRead = true)
    unreadCount.value = 0
    uni.showToast({ title: '已全部标记为已读', icon: 'success' })
  } catch (error) {
    uni.showToast({ title: '操作失败', icon: 'none' })
  }
}

const deleteNotification = async (notification: Notification) => {
  uni.showModal({
    title: '提示',
    content: '确定要删除该通知吗？',
    success: async (res: any) => {
      if (res.confirm) {
        try {
          await notificationApi.delete(notification.id)
          const index = notifications.value.findIndex(n => n.id === notification.id)
          if (index > -1) {
            notifications.value.splice(index, 1)
            if (!notification.isRead) {
              unreadCount.value = Math.max(0, unreadCount.value - 1)
            }
          }
          uni.showToast({ title: '删除成功', icon: 'success' })
        } catch (error) {
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    }
  })
}

const getTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    order: '📦',
    payment: '💳',
    system: '🔔',
    promotion: '🎉'
  }
  return icons[type] || '📢'
}

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    order: '#667eea',
    payment: '#ff9800',
    system: '#2196f3',
    promotion: '#f44336'
  }
  return colors[type] || '#999'
}
</script>

<template>
  <view class="page">
    <view class="header">
      <text class="header-title">消息通知</text>
      <view class="header-actions">
        <text class="unread-count" v-if="unreadCount > 0">{{ unreadCount }}条未读</text>
        <text class="mark-all-btn" @click="markAllAsRead" v-if="unreadCount > 0">全部已读</text>
      </view>
    </view>

    <view v-if="loading" class="loading">
      <text class="loading-text">加载中...</text>
    </view>

    <view v-else-if="notifications.length === 0" class="empty">
      <text class="empty-icon">🔔</text>
      <text class="empty-text">暂无通知</text>
    </view>

    <view v-else class="notifications-list">
      <view 
        v-for="item in notifications" 
        :key="item.id" 
        class="notification-item"
        :class="{ unread: !item.isRead }"
        @click="markAsRead(item)"
      >
        <view class="notification-icon" :style="{ background: getTypeColor(item.type) }">
          <text class="icon-text">{{ getTypeIcon(item.type) }}</text>
        </view>
        <view class="notification-content">
          <view class="notification-header">
            <text class="notification-title">{{ item.title }}</text>
            <text class="notification-time">{{ item.createdAt }}</text>
          </view>
          <text class="notification-text">{{ item.content }}</text>
        </view>
        <view class="notification-actions">
          <text class="delete-btn" @click.stop="deleteNotification(item)">🗑️</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  background: #fff;
  padding: 24rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  
  .header-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
  }
  
  .header-actions {
    display: flex;
    align-items: center;
    gap: 16rpx;
    
    .unread-count {
      font-size: 24rpx;
      color: #ff4757;
      font-weight: 600;
    }
    
    .mark-all-btn {
      font-size: 24rpx;
      color: #667eea;
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
    margin-bottom: 32rpx;
  }
  
  .empty-icon {
    font-size: 120rpx;
    margin-bottom: 20rpx;
  }
}

.notifications-list {
  padding: 20rpx;
}

.notification-item {
  display: flex;
  background: #fff;
  border-radius: 20rpx;
  margin-bottom: 20rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
  position: relative;
  
  &.unread {
    background: #f8f9ff;
    border-left: 4rpx solid #667eea;
  }
  
  .notification-icon {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    
    .icon-text {
      font-size: 40rpx;
    }
  }
  
  .notification-content {
    flex: 1;
    margin-left: 20rpx;
    
    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12rpx;
      
      .notification-title {
        font-size: 28rpx;
        font-weight: 600;
        color: #333;
      }
      
      .notification-time {
        font-size: 22rpx;
        color: #999;
      }
    }
    
    .notification-text {
      display: block;
      font-size: 26rpx;
      color: #666;
      line-height: 1.6;
    }
  }
  
  .notification-actions {
    margin-left: 16rpx;
    
    .delete-btn {
      font-size: 32rpx;
      opacity: 0.6;
    }
  }
}
</style>
