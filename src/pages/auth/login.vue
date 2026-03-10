<script setup lang="ts">
import { ref } from 'vue'
import { authApi } from '@/utils/api'

declare const uni: any

const loginForm = ref({
  username: '',
  password: ''
})

const loading = ref(false)

const handleLogin = async () => {
  if (!loginForm.value.username || !loginForm.value.password) {
    uni.showToast({ title: '请输入用户名和密码', icon: 'none' })
    return
  }

  loading.value = true
  try {
    const data: any = await authApi.login(loginForm.value)
    
    uni.setStorageSync('token', data.token)
    uni.setStorageSync('user', data.user)
    
    uni.showToast({ title: '登录成功', icon: 'success' })
    
    setTimeout(() => {
      uni.switchTab({ url: '/pages/goods/index' })
    }, 1500)
  } catch (error: any) {
    uni.showToast({ 
      title: error.data?.error || '登录失败', 
      icon: 'none' 
    })
  } finally {
    loading.value = false
  }
}

const goToRegister = () => {
  uni.navigateTo({ url: '/pages/auth/register' })
}
</script>

<template>
  <view class="page">
    <view class="login-container">
      <view class="logo-section">
        <text class="logo">🛍️</text>
        <text class="title">商城</text>
        <text class="subtitle">欢迎回来</text>
      </view>

      <view class="form-section">
        <view class="form-item">
          <view class="input-wrapper">
            <text class="input-icon">👤</text>
            <input 
              v-model="loginForm.username" 
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
              v-model="loginForm.password" 
              class="input" 
              type="password" 
              placeholder="请输入密码" 
              placeholder-class="input-placeholder"
            />
          </view>
        </view>

        <view class="form-actions">
          <text class="forgot-password">忘记密码？</text>
        </view>

        <button 
          class="login-btn" 
          :class="{ loading }" 
          @click="handleLogin"
          :disabled="loading"
        >
          {{ loading ? '登录中...' : '登录' }}
        </button>

        <view class="register-tip">
          <text class="tip-text">还没有账号？</text>
          <text class="register-link" @click="goToRegister">立即注册</text>
        </view>
      </view>

      <view class="demo-tips">
        <text class="tips-title">测试账号：</text>
        <text class="tips-text">普通用户: user / user123</text>
        <text class="tips-text">管理员: admin / admin123</text>
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

.login-container {
  width: 100%;
  max-width: 600rpx;
}

.logo-section {
  text-align: center;
  margin-bottom: 80rpx;
  
  .logo {
    font-size: 120rpx;
    display: block;
    margin-bottom: 20rpx;
  }
  
  .title {
    display: block;
    font-size: 48rpx;
    font-weight: bold;
    color: #fff;
    margin-bottom: 12rpx;
  }
  
  .subtitle {
    display: block;
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.8);
  }
}

.form-section {
  background: #fff;
  border-radius: 32rpx;
  padding: 48rpx 40rpx;
  box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.1);
}

.form-item {
  margin-bottom: 32rpx;
  
  .input-wrapper {
    display: flex;
    align-items: center;
    background: #f8f9fa;
    border-radius: 16rpx;
    padding: 24rpx 28rpx;
    border: 2rpx solid transparent;
    transition: all 0.3s ease;
    
    &:focus-within {
      border-color: #667eea;
      background: #fff;
    }
    
    .input-icon {
      font-size: 36rpx;
      margin-right: 16rpx;
    }
    
    .input {
      flex: 1;
      font-size: 28rpx;
      color: #212529;
    }
    
    .input-placeholder {
      color: #adb5bd;
    }
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 32rpx;
  
  .forgot-password {
    font-size: 24rpx;
    color: #667eea;
  }
}

.login-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
  border-radius: 44rpx;
  border: none;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.4);
  
  &.loading {
    opacity: 0.7;
  }
  
  &:active {
    opacity: 0.9;
    transform: scale(0.98);
  }
}

.register-tip {
  text-align: center;
  margin-top: 32rpx;
  
  .tip-text {
    font-size: 26rpx;
    color: #868e96;
  }
  
  .register-link {
    font-size: 26rpx;
    color: #667eea;
    font-weight: 600;
    margin-left: 8rpx;
  }
}

.demo-tips {
  margin-top: 48rpx;
  padding: 24rpx;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16rpx;
  
  .tips-title {
    display: block;
    font-size: 24rpx;
    color: #fff;
    margin-bottom: 12rpx;
    font-weight: 600;
  }
  
  .tips-text {
    display: block;
    font-size: 22rpx;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 8rpx;
    line-height: 1.6;
  }
}
</style>
