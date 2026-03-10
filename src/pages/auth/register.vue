<script setup lang="ts">
import { ref } from 'vue'
import { authApi } from '@/utils/api'

declare const uni: any

const registerForm = ref({
  username: '',
  password: '',
  confirmPassword: '',
  nickname: '',
  phone: '',
  email: ''
})

const loading = ref(false)

const handleRegister = async () => {
  if (!registerForm.value.username || !registerForm.value.password) {
    uni.showToast({ title: '请输入用户名和密码', icon: 'none' })
    return
  }

  if (registerForm.value.password.length < 6) {
    uni.showToast({ title: '密码至少6位', icon: 'none' })
    return
  }

  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    uni.showToast({ title: '两次密码不一致', icon: 'none' })
    return
  }

  loading.value = true
  try {
    const data: any = await authApi.register({
      username: registerForm.value.username,
      password: registerForm.value.password,
      nickname: registerForm.value.nickname || registerForm.value.username,
      phone: registerForm.value.phone,
      email: registerForm.value.email
    })
    
    uni.setStorageSync('token', data.token)
    uni.setStorageSync('user', data.user)
    
    uni.showToast({ title: '注册成功', icon: 'success' })
    
    setTimeout(() => {
      uni.switchTab({ url: '/pages/goods/index' })
    }, 1500)
  } catch (error: any) {
    uni.showToast({ 
      title: error.data?.error || '注册失败', 
      icon: 'none' 
    })
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  uni.navigateBack()
}
</script>

<template>
  <view class="page">
    <view class="register-container">
      <view class="logo-section">
        <text class="logo">🛍️</text>
        <text class="title">商城</text>
        <text class="subtitle">创建新账号</text>
      </view>

      <view class="form-section">
        <view class="form-item">
          <view class="input-wrapper">
            <text class="input-icon">👤</text>
            <input 
              v-model="registerForm.username" 
              class="input" 
              placeholder="请输入用户名" 
              placeholder-class="input-placeholder"
            />
          </view>
        </view>

        <view class="form-item">
          <view class="input-wrapper">
            <text class="input-icon">🔒</text>
            <input 
              v-model="registerForm.password" 
              class="input" 
              type="password" 
              placeholder="请输入密码（至少6位）" 
              placeholder-class="input-placeholder"
            />
          </view>
        </view>

        <view class="form-item">
          <view class="input-wrapper">
            <text class="input-icon">🔒</text>
            <input 
              v-model="registerForm.confirmPassword" 
              class="input" 
              type="password" 
              placeholder="请确认密码" 
              placeholder-class="input-placeholder"
            />
          </view>
        </view>

        <view class="form-item">
          <view class="input-wrapper">
            <text class="input-icon">✏️</text>
            <input 
              v-model="registerForm.nickname" 
              class="input" 
              placeholder="请输入昵称（可选）" 
              placeholder-class="input-placeholder"
            />
          </view>
        </view>

        <view class="form-item">
          <view class="input-wrapper">
            <text class="input-icon">📱</text>
            <input 
              v-model="registerForm.phone" 
              class="input" 
              type="number" 
              placeholder="请输入手机号（可选）" 
              placeholder-class="input-placeholder"
            />
          </view>
        </view>

        <view class="form-item">
          <view class="input-wrapper">
            <text class="input-icon">📧</text>
            <input 
              v-model="registerForm.email" 
              class="input" 
              placeholder="请输入邮箱（可选）" 
              placeholder-class="input-placeholder"
            />
          </view>
        </view>

        <button 
          class="register-btn" 
          :class="{ loading }" 
          @click="handleRegister"
          :disabled="loading"
        >
          {{ loading ? '注册中...' : '注册' }}
        </button>

        <view class="login-tip">
          <text class="tip-text">已有账号？</text>
          <text class="login-link" @click="goToLogin">立即登录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.register-container {
  width: 100%;
  max-width: 600rpx;
}

.logo-section {
  text-align: center;
  margin-bottom: 60rpx;
  
  .logo {
    font-size: 100rpx;
    display: block;
    margin-bottom: 16rpx;
  }
  
  .title {
    display: block;
    font-size: 44rpx;
    font-weight: bold;
    color: #fff;
    margin-bottom: 10rpx;
  }
  
  .subtitle {
    display: block;
    font-size: 26rpx;
    color: rgba(255, 255, 255, 0.8);
  }
}

.form-section {
  background: #fff;
  border-radius: 32rpx;
  padding: 40rpx 32rpx;
  box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.1);
}

.form-item {
  margin-bottom: 24rpx;
  
  .input-wrapper {
    display: flex;
    align-items: center;
    background: #f8f9fa;
    border-radius: 16rpx;
    padding: 20rpx 24rpx;
    border: 2rpx solid transparent;
    transition: all 0.3s ease;
    
    &:focus-within {
      border-color: #667eea;
      background: #fff;
    }
    
    .input-icon {
      font-size: 32rpx;
      margin-right: 12rpx;
    }
    
    .input {
      flex: 1;
      font-size: 26rpx;
      color: #212529;
    }
    
    .input-placeholder {
      color: #adb5bd;
    }
  }
}

.register-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
  border-radius: 44rpx;
  border: none;
  margin-top: 32rpx;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.4);
  
  &.loading {
    opacity: 0.7;
  }
  
  &:active {
    opacity: 0.9;
    transform: scale(0.98);
  }
}

.login-tip {
  text-align: center;
  margin-top: 24rpx;
  
  .tip-text {
    font-size: 24rpx;
    color: #868e96;
  }
  
  .login-link {
    font-size: 24rpx;
    color: #667eea;
    font-weight: 600;
    margin-left: 8rpx;
  }
}
</style>
