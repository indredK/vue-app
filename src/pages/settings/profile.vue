<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { userApi } from '@/utils/api'

declare const uni: any

const formData = ref({
  nickname: '',
  phone: '',
  email: '',
  avatar: ''
})

const loading = ref(false)
const submitting = ref(false)

onMounted(async () => {
  await loadUserInfo()
})

const loadUserInfo = async () => {
  try {
    loading.value = true
    const user = uni.getStorageSync('user')
    if (user) {
      formData.value = {
        nickname: user.nickname || '',
        phone: user.phone || '',
        email: user.email || '',
        avatar: user.avatar || ''
      }
    } else {
      const data: any = await userApi.getInfo(1)
      formData.value = {
        nickname: data.nickname || '',
        phone: data.phone || '',
        email: data.email || '',
        avatar: data.avatar || ''
      }
    }
  } catch (error) {
    console.error('Failed to load user info:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const chooseAvatar = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res: any) => {
      const tempFilePath = res.tempFilePaths[0]
      uploadAvatar(tempFilePath)
    }
  })
}

const uploadAvatar = (filePath: string) => {
  uni.uploadFile({
    url: 'http://localhost:3001/api/upload/avatar',
    filePath: filePath,
    name: 'avatar',
    header: {
      'Authorization': `Bearer ${uni.getStorageSync('token')}`
    },
    success: (uploadRes: any) => {
      const data = JSON.parse(uploadRes.data)
      if (data.url) {
        formData.value.avatar = data.url
        uni.showToast({ title: '上传成功', icon: 'success' })
      }
    },
    fail: () => {
      uni.showToast({ title: '上传失败', icon: 'none' })
    }
  })
}

const handleSubmit = async () => {
  if (!formData.value.nickname.trim()) {
    uni.showToast({ title: '请输入昵称', icon: 'none' })
    return
  }
  
  if (!formData.value.phone.trim()) {
    uni.showToast({ title: '请输入手机号', icon: 'none' })
    return
  }
  
  const phoneReg = /^1[3-9]\d{9}$/
  if (!phoneReg.test(formData.value.phone)) {
    uni.showToast({ title: '手机号格式不正确', icon: 'none' })
    return
  }
  
  if (!formData.value.email.trim()) {
    uni.showToast({ title: '请输入邮箱', icon: 'none' })
    return
  }
  
  const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailReg.test(formData.value.email)) {
    uni.showToast({ title: '邮箱格式不正确', icon: 'none' })
    return
  }
  
  try {
    submitting.value = true
    const user = uni.getStorageSync('user')
    const userId = user ? user.id : 1
    
    await userApi.update(userId, {
      nickname: formData.value.nickname,
      phone: formData.value.phone,
      email: formData.value.email,
      avatar: formData.value.avatar
    })
    
    uni.showToast({ title: '保存成功', icon: 'success' })
    
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error) {
    console.error('Failed to update user info:', error)
    uni.showToast({ title: '保存失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <view class="page">
    <view v-if="loading" class="loading">
      <text class="loading-text">加载中...</text>
    </view>
    
    <view v-else class="form-container">
      <view class="avatar-section">
        <view class="avatar-wrapper" @click="chooseAvatar">
          <image :src="formData.avatar || '/static/default-avatar.png'" class="avatar" mode="aspectFill" />
          <view class="avatar-overlay">
            <text class="avatar-icon">📷</text>
            <text class="avatar-text">更换头像</text>
          </view>
        </view>
      </view>
      
      <view class="form-group">
        <view class="form-label">
          <text class="label-text">昵称</text>
          <text class="required">*</text>
        </view>
        <input 
          v-model="formData.nickname" 
          class="form-input" 
          placeholder="请输入昵称"
          maxlength="20"
        />
      </view>
      
      <view class="form-group">
        <view class="form-label">
          <text class="label-text">手机号</text>
          <text class="required">*</text>
        </view>
        <input 
          v-model="formData.phone" 
          class="form-input" 
          type="number"
          placeholder="请输入手机号"
          maxlength="11"
        />
      </view>
      
      <view class="form-group">
        <view class="form-label">
          <text class="label-text">邮箱</text>
          <text class="required">*</text>
        </view>
        <input 
          v-model="formData.email" 
          class="form-input" 
          type="email"
          placeholder="请输入邮箱"
        />
      </view>
      
      <view class="tips">
        <text class="tips-text">带 * 为必填项</text>
      </view>
      
      <button 
        class="submit-btn" 
        :class="{ disabled: submitting }" 
        :disabled="submitting"
        @click="handleSubmit"
      >
        {{ submitting ? '保存中...' : '保存' }}
      </button>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
  
  .loading-text {
    font-size: 28rpx;
    color: #999;
  }
}

.form-container {
  padding: 40rpx 32rpx;
}

.avatar-section {
  display: flex;
  justify-content: center;
  margin-bottom: 60rpx;
  
  .avatar-wrapper {
    position: relative;
    width: 200rpx;
    height: 200rpx;
    border-radius: 100rpx;
    overflow: hidden;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
    
    .avatar {
      width: 100%;
      height: 100%;
    }
    
    .avatar-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
      padding: 20rpx 0 12rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      
      .avatar-icon {
        font-size: 32rpx;
        margin-bottom: 4rpx;
      }
      
      .avatar-text {
        color: #fff;
        font-size: 22rpx;
      }
    }
  }
}

.form-group {
  background: #fff;
  border-radius: 20rpx;
  padding: 32rpx 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
  
  .form-label {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
    
    .label-text {
      font-size: 28rpx;
      color: #333;
      font-weight: 500;
    }
    
    .required {
      color: #ff4757;
      margin-left: 8rpx;
      font-size: 28rpx;
    }
  }
  
  .form-input {
    width: 100%;
    height: 80rpx;
    line-height: 80rpx;
    font-size: 30rpx;
    color: #333;
    border: 2rpx solid #e9ecef;
    border-radius: 12rpx;
    padding: 0 24rpx;
    background: #f8f9fa;
    
    &:focus {
      border-color: #667eea;
      background: #fff;
    }
  }
}

.tips {
  padding: 0 8rpx;
  margin-bottom: 40rpx;
  
  .tips-text {
    font-size: 24rpx;
    color: #999;
  }
}

.submit-btn {
  width: 100%;
  height: 96rpx;
  line-height: 96rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 32rpx;
  font-weight: 500;
  border-radius: 48rpx;
  border: none;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
  
  &.disabled {
    opacity: 0.6;
  }
  
  &:active:not(.disabled) {
    transform: scale(0.98);
    box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.3);
  }
}
</style>
