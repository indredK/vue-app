<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { addressApi } from '@/utils/api'
import type { Address } from '@/types'

declare const uni: any

const addressId = ref<number | null>(null)
const addressForm = ref({
  receiverName: '',
  receiverPhone: '',
  province: '',
  city: '',
  district: '',
  detailAddress: '',
  postalCode: '',
  isDefault: false
})
const loading = ref(false)
const currentUserId = ref(1)

const provinces = ['北京市', '上海市', '广东省', '浙江省', '江苏省']
const cities = {
  '北京市': ['北京市'],
  '上海市': ['上海市'],
  '广东省': ['广州市', '深圳市', '珠海市'],
  '浙江省': ['杭州市', '宁波市', '温州市'],
  '江苏省': ['南京市', '苏州市', '无锡市']
}
const districts = {
  '北京市': ['朝阳区', '海淀区', '东城区'],
  '上海市': ['浦东新区', '黄浦区', '徐汇区'],
  '广州市': ['天河区', '越秀区', '海珠区'],
  '深圳市': ['南山区', '福田区', '罗湖区']
}

const loadAddress = async (id: number) => {
  try {
    const data: Address = await addressApi.getById(id)
    addressForm.value = {
      receiverName: data.receiverName,
      receiverPhone: data.receiverPhone,
      province: data.province,
      city: data.city,
      district: data.district,
      detailAddress: data.detailAddress,
      postalCode: data.postalCode,
      isDefault: data.isDefault
    }
  } catch (error) {
    console.error('Failed to load address:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

onLoad(async (options: { id?: string }) => {
  const user = uni.getStorageSync('user')
  if (user) {
    currentUserId.value = user.id
  }
  
  if (options.id) {
    addressId.value = Number(options.id)
    await loadAddress(addressId.value)
  }
})

const validateForm = () => {
  if (!addressForm.value.receiverName) {
    uni.showToast({ title: '请输入收货人姓名', icon: 'none' })
    return false
  }
  if (!addressForm.value.receiverPhone) {
    uni.showToast({ title: '请输入手机号', icon: 'none' })
    return false
  }
  if (!/^1[3-9]\d{9}$/.test(addressForm.value.receiverPhone)) {
    uni.showToast({ title: '手机号格式不正确', icon: 'none' })
    return false
  }
  if (!addressForm.value.province || !addressForm.value.city || !addressForm.value.district) {
    uni.showToast({ title: '请选择完整地区', icon: 'none' })
    return false
  }
  if (!addressForm.value.detailAddress) {
    uni.showToast({ title: '请输入详细地址', icon: 'none' })
    return false
  }
  return true
}

const submitAddress = async () => {
  if (!validateForm()) return

  loading.value = true
  try {
    const data = {
      ...addressForm.value,
      userId: currentUserId.value
    }
    
    if (addressId.value) {
      await addressApi.update(addressId.value, data)
      uni.showToast({ title: '修改成功', icon: 'success' })
    } else {
      await addressApi.create(data)
      uni.showToast({ title: '添加成功', icon: 'success' })
    }
    
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error) {
    console.error('Failed to save address:', error)
    uni.showToast({ title: '保存失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  uni.navigateBack()
}
</script>

<template>
  <view class="page">
    <view class="form-section">
      <view class="form-item">
        <view class="form-label">收货人</view>
        <input 
          v-model="addressForm.receiverName" 
          class="form-input" 
          placeholder="请输入收货人姓名" 
          placeholder-class="input-placeholder"
        />
      </view>

      <view class="form-item">
        <view class="form-label">手机号</view>
        <input 
          v-model="addressForm.receiverPhone" 
          class="form-input" 
          type="number" 
          placeholder="请输入手机号" 
          placeholder-class="input-placeholder"
        />
      </view>

      <view class="form-item">
        <view class="form-label">所在地区</view>
        <view class="region-selector">
          <picker :value="0" :range="provinces" @change="addressForm.province = provinces[$event.detail.value]">
            <view class="picker">
              {{ addressForm.province || '请选择省份' }}
              <text class="picker-arrow">›</text>
            </view>
          </picker>
          <picker 
            :value="0" 
            :range="cities[addressForm.province] || []" 
            @change="addressForm.city = (cities[addressForm.province] || [])[$event.detail.value]"
          >
            <view class="picker">
              {{ addressForm.city || '请选择城市' }}
              <text class="picker-arrow">›</text>
            </view>
          </picker>
          <picker 
            :value="0" 
            :range="districts[addressForm.city] || []" 
            @change="addressForm.district = (districts[addressForm.city] || [])[$event.detail.value]"
          >
            <view class="picker">
              {{ addressForm.district || '请选择区县' }}
              <text class="picker-arrow">›</text>
            </view>
          </picker>
        </view>
      </view>

      <view class="form-item">
        <view class="form-label">详细地址</view>
        <textarea 
          v-model="addressForm.detailAddress" 
          class="form-textarea" 
          placeholder="请输入详细地址（街道、门牌号等）" 
          placeholder-class="input-placeholder"
          :maxlength="200"
        />
      </view>

      <view class="form-item">
        <view class="form-label">邮政编码</view>
        <input 
          v-model="addressForm.postalCode" 
          class="form-input" 
          type="number" 
          placeholder="请输入邮政编码（可选）" 
          placeholder-class="input-placeholder"
        />
      </view>

      <view class="form-item switch-item">
        <view class="form-label">设为默认地址</view>
        <switch 
          v-model="addressForm.isDefault" 
          color="#667eea"
        />
      </view>
    </view>

    <view class="footer">
      <button 
        class="submit-btn" 
        :class="{ loading }" 
        @click="submitAddress"
        :disabled="loading"
      >
        {{ loading ? '保存中...' : '保存' }}
      </button>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.form-section {
  background: #fff;
  margin: 20rpx 24rpx;
  border-radius: 20rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.form-item {
  margin-bottom: 32rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .form-label {
    font-size: 28rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 16rpx;
    display: block;
  }
  
  .form-input {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    background: #f8f9fa;
    border-radius: 12rpx;
    padding: 0 24rpx;
    font-size: 28rpx;
    color: #333;
    border: 2rpx solid transparent;
    transition: all 0.3s ease;
    
    &:focus {
      border-color: #667eea;
      background: #fff;
    }
  }
  
  .form-textarea {
    width: 100%;
    min-height: 160rpx;
    background: #f8f9fa;
    border-radius: 12rpx;
    padding: 20rpx 24rpx;
    font-size: 28rpx;
    color: #333;
    border: 2rpx solid transparent;
    transition: all 0.3s ease;
    
    &:focus {
      border-color: #667eea;
      background: #fff;
    }
  }
  
  .input-placeholder {
    color: #adb5bd;
  }
  
  &.switch-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .form-label {
      margin-bottom: 0;
    }
  }
}

.region-selector {
  display: flex;
  gap: 12rpx;
  
  .picker {
    flex: 1;
    height: 88rpx;
    line-height: 88rpx;
    background: #f8f9fa;
    border-radius: 12rpx;
    padding: 0 24rpx;
    font-size: 26rpx;
    color: #333;
    border: 2rpx solid transparent;
    transition: all 0.3s ease;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    &:active {
      border-color: #667eea;
      background: #fff;
    }
    
    .picker-arrow {
      color: #adb5bd;
      font-size: 32rpx;
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
  
  .submit-btn {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    font-size: 32rpx;
    font-weight: 600;
    border-radius: 44rpx;
    border: none;
    
    &.loading {
      opacity: 0.7;
    }
    
    &:active {
      opacity: 0.9;
      transform: scale(0.98);
    }
  }
}
</style>
