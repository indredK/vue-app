<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { cartApi, addressApi, orderApi, paymentApi, pointsApi } from '@/utils/api'
import type { CartItem, Address, PaymentMethod } from '@/types'

declare const uni: any

const cartItems = ref<CartItem[]>([])
const addresses = ref<Address[]>([])
const paymentMethods = ref<PaymentMethod[]>([])
const selectedAddressId = ref<number>(0)
const selectedPaymentId = ref<number>(0)
const usePoints = ref(false)
const pointsBalance = ref(0)
const pointsToUse = ref(0)
const loading = ref(false)
const currentUserId = ref(1)
const existingOrderId = ref<number | null>(null)

const selectedAddress = computed(() => {
  return addresses.value.find(addr => addr.id === selectedAddressId.value)
})

const selectedPayment = computed(() => {
  return paymentMethods.value.find(pm => pm.id === selectedPaymentId.value)
})

const totalAmount = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
})

const pointsDiscount = computed(() => {
  if (!usePoints.value) return 0
  return Math.min(pointsToUse.value, Math.floor(totalAmount.value / 100))
})

const finalAmount = computed(() => {
  return totalAmount.value - pointsDiscount.value
})

const loadData = async () => {
  try {
    const user = uni.getStorageSync('user')
    if (user) {
      currentUserId.value = user.id
    }

    const [cartData, addressData, paymentData, pointsData] = await Promise.all([
      cartApi.getList(currentUserId.value),
      addressApi.getList(currentUserId.value),
      paymentApi.getMethods(),
      pointsApi.getBalance(currentUserId.value)
    ])

    cartItems.value = cartData.filter((item: CartItem) => item.selected)
    addresses.value = addressData
    paymentMethods.value = paymentData
    pointsBalance.value = pointsData.balance

    const defaultAddress = addresses.value.find(addr => addr.isDefault)
    if (defaultAddress) {
      selectedAddressId.value = defaultAddress.id
    } else if (addresses.value.length > 0) {
      selectedAddressId.value = addresses.value[0].id
    }

    if (paymentMethods.value.length > 0) {
      selectedPaymentId.value = paymentMethods.value[0].id
    }
  } catch (error) {
    console.error('Failed to load data:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

onLoad(async (options: { orderId?: string }) => {
  if (options.orderId) {
    existingOrderId.value = Number(options.orderId)
  }
  await loadData()
})

const selectAddress = (address: Address) => {
  selectedAddressId.value = address.id
}

const selectPayment = (payment: PaymentMethod) => {
  selectedPaymentId.value = payment.id
}

const onPointsChange = (e: any) => {
  usePoints.value = e.detail.value
  if (usePoints.value) {
    const maxPoints = Math.min(pointsBalance.value, Math.floor(totalAmount.value / 100))
    pointsToUse.value = maxPoints
  } else {
    pointsToUse.value = 0
  }
}

const onPointsInput = (e: any) => {
  const value = parseInt(e.detail.value) || 0
  const maxPoints = Math.min(pointsBalance.value, Math.floor(totalAmount.value / 100))
  pointsToUse.value = Math.min(value, maxPoints)
}

const addAddress = () => {
  uni.navigateTo({
    url: '/pages/address/edit'
  })
}

const submitOrder = async () => {
  if (cartItems.value.length === 0) {
    uni.showToast({ title: '请选择商品', icon: 'none' })
    return
  }

  if (!selectedAddress.value) {
    uni.showToast({ title: '请选择收货地址', icon: 'none' })
    return
  }

  if (!selectedPayment.value) {
    uni.showToast({ title: '请选择支付方式', icon: 'none' })
    return
  }

  loading.value = true
  try {
    if (existingOrderId.value) {
      const paymentData = await paymentApi.create({
        orderId: existingOrderId.value,
        paymentMethodId: selectedPaymentId.value
      })
      
      uni.showToast({ title: '支付创建成功', icon: 'success' })
      
      setTimeout(() => {
        uni.redirectTo({
          url: `/pages/order/detail?id=${existingOrderId.value}`
        })
      }, 1500)
    } else {
      const orderData = await orderApi.create({
        userId: currentUserId.value,
        items: cartItems.value.map((item: CartItem) => ({
          goodsId: item.goodsId,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: item.quantity
        })),
        addressId: selectedAddressId.value,
        totalAmount: totalAmount.value,
        pointsUsed: pointsToUse.value,
        remark: ''
      })

      const paymentData = await paymentApi.create({
        orderId: orderData.id,
        paymentMethodId: selectedPaymentId.value
      })

      uni.showToast({ title: '订单创建成功', icon: 'success' })

      setTimeout(() => {
        uni.redirectTo({
          url: `/pages/order/detail?id=${orderData.id}`
        })
      }, 1500)
    }
  } catch (error) {
    console.error('Failed to create order:', error)
    uni.showToast({ title: '创建失败', icon: 'none' })
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
    <view class="address-section">
      <view class="section-header">
        <text class="section-title">收货地址</text>
        <text class="add-btn" @click="addAddress">+ 新增</text>
      </view>

      <view v-if="addresses.length === 0" class="empty-address" @click="addAddress">
        <text class="empty-icon">📍</text>
        <text class="empty-text">暂无收货地址，点击添加</text>
      </view>

      <view v-else class="address-list">
        <view 
          v-for="address in addresses" 
          :key="address.id" 
          class="address-item"
          :class="{ selected: selectedAddressId === address.id }"
          @click="selectAddress(address)"
        >
          <view class="address-info">
            <view class="receiver-row">
              <text class="receiver-name">{{ address.receiverName }}</text>
              <text class="receiver-phone">{{ address.receiverPhone }}</text>
            </view>
            <text class="address-detail">{{ address.province }}{{ address.city }}{{ address.district }}{{ address.detailAddress }}</text>
          </view>
          <view class="address-check">
            <text v-if="selectedAddressId === address.id" class="check-icon">✓</text>
          </view>
        </view>
      </view>
    </view>

    <view class="goods-section">
      <view class="section-header">
        <text class="section-title">商品信息</text>
        <text class="goods-count">共{{ cartItems.length }}件</text>
      </view>

      <view class="goods-list">
        <view v-for="item in cartItems" :key="item.id" class="goods-item">
          <image :src="item.image" class="goods-image" mode="aspectFill" />
          <view class="goods-info">
            <text class="goods-name">{{ item.name }}</text>
            <view class="goods-bottom">
              <text class="goods-price">¥{{ item.price }}</text>
              <text class="goods-quantity">x{{ item.quantity }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="payment-section">
      <view class="section-header">
        <text class="section-title">支付方式</text>
      </view>

      <view class="payment-list">
        <view 
          v-for="payment in paymentMethods" 
          :key="payment.id" 
          class="payment-item"
          :class="{ selected: selectedPaymentId === payment.id }"
          @click="selectPayment(payment)"
        >
          <view class="payment-info">
            <image :src="payment.icon" class="payment-icon" mode="aspectFit" />
            <text class="payment-name">{{ payment.name }}</text>
          </view>
          <view class="payment-check">
            <text v-if="selectedPaymentId === payment.id" class="check-icon">✓</text>
          </view>
        </view>
      </view>
    </view>

    <view class="points-section">
      <view class="points-header">
        <view class="points-title">
          <text class="title-text">使用积分</text>
          <text class="points-balance">（可用：{{ pointsBalance }}积分）</text>
        </view>
        <switch 
          :checked="usePoints" 
          @change="onPointsChange"
          color="#667eea"
        />
      </view>

      <view v-if="usePoints" class="points-input-wrapper">
        <input 
          v-model="pointsToUse" 
          class="points-input" 
          type="number" 
          @input="onPointsInput"
        />
        <text class="points-unit">积分</text>
        <text class="points-discount">抵扣 ¥{{ pointsDiscount }}</text>
      </view>
    </view>

    <view class="price-section">
      <view class="price-row">
        <text class="price-label">商品总额</text>
        <text class="price-value">¥{{ totalAmount }}</text>
      </view>
      <view class="price-row" v-if="pointsDiscount > 0">
        <text class="price-label">积分抵扣</text>
        <text class="price-value discount">-¥{{ pointsDiscount }}</text>
      </view>
      <view class="price-row total">
        <text class="price-label">实付金额</text>
        <text class="price-value">¥{{ finalAmount }}</text>
      </view>
    </view>

    <view class="footer">
      <view class="footer-info">
        <text class="total-label">实付：</text>
        <text class="total-price">¥{{ finalAmount }}</text>
      </view>
      <button 
        class="submit-btn" 
        :class="{ loading }" 
        @click="submitOrder"
        :disabled="loading"
      >
        {{ loading ? '提交中...' : (existingOrderId ? '立即支付' : '提交订单') }}
      </button>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 140rpx;
}

.address-section, .goods-section, .payment-section, .points-section, .price-section {
  background: #fff;
  margin: 20rpx 24rpx;
  border-radius: 20rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    
    .section-title {
      font-size: 28rpx;
      font-weight: 600;
      color: #333;
    }
    
    .add-btn, .goods-count {
      font-size: 24rpx;
      color: #667eea;
    }
  }
}

.address-section {
  .empty-address {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40rpx 0;
    
    .empty-icon {
      font-size: 80rpx;
      margin-bottom: 16rpx;
    }
    
    .empty-text {
      font-size: 26rpx;
      color: #999;
    }
  }
  
  .address-list {
    .address-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20rpx;
      border-radius: 12rpx;
      margin-bottom: 16rpx;
      border: 2rpx solid #f0f0f0;
      transition: all 0.3s ease;
      
      &.selected {
        border-color: #667eea;
        background: #f8f9ff;
      }
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .address-info {
        flex: 1;
        
        .receiver-row {
          display: flex;
          align-items: center;
          margin-bottom: 12rpx;
          
          .receiver-name {
            font-size: 28rpx;
            font-weight: 600;
            color: #333;
            margin-right: 16rpx;
          }
          
          .receiver-phone {
            font-size: 26rpx;
            color: #666;
          }
        }
        
        .address-detail {
          display: block;
          font-size: 24rpx;
          color: #999;
          line-height: 1.6;
        }
      }
      
      .address-check {
        width: 48rpx;
        height: 48rpx;
        border-radius: 50%;
        border: 2rpx solid #dee2e6;
        display: flex;
        align-items: center;
        justify-content: center;
        
        .check-icon {
          font-size: 28rpx;
          color: #667eea;
          font-weight: bold;
        }
      }
      
      &.selected .address-check {
        background: #667eea;
        border-color: #667eea;
        
        .check-icon {
          color: #fff;
        }
      }
    }
  }
}

.goods-section {
  .goods-list {
    .goods-item {
      display: flex;
      margin-bottom: 20rpx;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .goods-image {
        width: 140rpx;
        height: 140rpx;
        border-radius: 12rpx;
        background: #f5f5f5;
      }
      
      .goods-info {
        flex: 1;
        margin-left: 20rpx;
        
        .goods-name {
          display: block;
          font-size: 28rpx;
          font-weight: 500;
          color: #333;
          margin-bottom: 12rpx;
        }
        
        .goods-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          
          .goods-price {
            font-size: 32rpx;
            font-weight: 600;
            color: #ff4757;
          }
          
          .goods-quantity {
            font-size: 26rpx;
            color: #999;
          }
        }
      }
    }
  }
}

.payment-section {
  .payment-list {
    .payment-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20rpx;
      border-radius: 12rpx;
      margin-bottom: 16rpx;
      border: 2rpx solid #f0f0f0;
      transition: all 0.3s ease;
      
      &.selected {
        border-color: #667eea;
        background: #f8f9ff;
      }
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .payment-info {
        display: flex;
        align-items: center;
        
        .payment-icon {
          width: 48rpx;
          height: 48rpx;
          margin-right: 16rpx;
        }
        
        .payment-name {
          font-size: 28rpx;
          color: #333;
        }
      }
      
      .payment-check {
        width: 48rpx;
        height: 48rpx;
        border-radius: 50%;
        border: 2rpx solid #dee2e6;
        display: flex;
        align-items: center;
        justify-content: center;
        
        .check-icon {
          font-size: 28rpx;
          color: #667eea;
          font-weight: bold;
        }
      }
      
      &.selected .payment-check {
        background: #667eea;
        border-color: #667eea;
        
        .check-icon {
          color: #fff;
        }
      }
    }
  }
}

.points-section {
  .points-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .points-title {
      display: flex;
      align-items: center;
      
      .title-text {
        font-size: 28rpx;
        font-weight: 600;
        color: #333;
        margin-right: 12rpx;
      }
      
      .points-balance {
        font-size: 24rpx;
        color: #999;
      }
    }
  }
  
  .points-input-wrapper {
    display: flex;
    align-items: center;
    margin-top: 20rpx;
    padding: 20rpx;
    background: #f8f9fa;
    border-radius: 12rpx;
    
    .points-input {
      flex: 1;
      font-size: 28rpx;
      color: #333;
    }
    
    .points-unit {
      font-size: 26rpx;
      color: #666;
      margin-left: 12rpx;
    }
    
    .points-discount {
      font-size: 26rpx;
      color: #ff4757;
      margin-left: auto;
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

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 24rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 100;
  
  .footer-info {
    display: flex;
    align-items: baseline;
    
    .total-label {
      font-size: 26rpx;
      color: #666;
    }
    
    .total-price {
      font-size: 40rpx;
      font-weight: bold;
      color: #ff4757;
    }
  }
  
  .submit-btn {
    width: 240rpx;
    height: 80rpx;
    line-height: 80rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    font-size: 30rpx;
    font-weight: 600;
    border-radius: 40rpx;
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
