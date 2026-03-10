<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onPullDownRefresh, onShow } from '@dcloudio/uni-app'
import { cartApi, orderApi } from '@/utils/api'
import type { CartItem } from '@/types'

declare const uni: any

const cartData = ref<CartItem[]>([])
const loading = ref(true)
const currentUserId = 1

const loadCart = async () => {
  try {
    const data: any = await cartApi.getList(currentUserId)
    cartData.value = data.map((item: any) => ({
      ...item,
      selected: item.selected ?? true
    }))
  } catch (error) {
    console.error('Failed to load cart:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadCart()
})

onShow(async () => {
  await loadCart()
})

const onPullDownRefresh = async () => {
  await loadCart()
  uni.stopPullDownRefresh()
}

const selectAll = computed(() => {
  return cartData.value.length > 0 && cartData.value.every(item => item.selected)
})

const totalPrice = computed(() => {
  return cartData.value
    .filter(item => item.selected)
    .reduce((sum, item) => sum + item.price * item.quantity, 0)
})

const selectedCount = computed(() => {
  return cartData.value.filter(item => item.selected).length
})

const toggleSelect = async (item: CartItem) => {
  item.selected = !item.selected
  try {
    await cartApi.update(item.id, { selected: item.selected })
  } catch (error) {
    item.selected = !item.selected
    uni.showToast({ title: '更新失败', icon: 'none' })
  }
}

const toggleSelectAll = async () => {
  const newValue = !selectAll.value
  try {
    for (const item of cartData.value) {
      await cartApi.update(item.id, { selected: newValue })
      item.selected = newValue
    }
  } catch (error) {
    uni.showToast({ title: '更新失败', icon: 'none' })
  }
}

const increase = async (item: CartItem) => {
  const newQuantity = item.quantity + 1
  try {
    await cartApi.update(item.id, { quantity: newQuantity })
    item.quantity = newQuantity
  } catch (error) {
    uni.showToast({ title: '更新失败', icon: 'none' })
  }
}

const decrease = async (item: CartItem) => {
  if (item.quantity > 1) {
    const newQuantity = item.quantity - 1
    try {
      await cartApi.update(item.id, { quantity: newQuantity })
      item.quantity = newQuantity
    } catch (error) {
      uni.showToast({ title: '更新失败', icon: 'none' })
    }
  }
}

const removeItem = (id: number) => {
  uni.showModal({
    title: '提示',
    content: '确定要删除该商品吗？',
    success: async (res: any) => {
      if (res.confirm) {
        try {
          await cartApi.remove(id)
          const index = cartData.value.findIndex(item => item.id === id)
          if (index > -1) {
            cartData.value.splice(index, 1)
            uni.showToast({ title: '已删除', icon: 'success' })
          }
        } catch (error) {
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    }
  })
}

const goToCheckout = async () => {
  const selectedItems = cartData.value.filter(item => item.selected)
  if (selectedItems.length === 0) {
    uni.showToast({ title: '请选择商品', icon: 'none' })
    return
  }
  try {
    await orderApi.create({
      userId: currentUserId,
      items: selectedItems.map((item: CartItem) => ({
        goodsId: item.goodsId,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity
      })),
      totalAmount: totalPrice.value
    })
    uni.showToast({ title: '购买成功', icon: 'success' })
    const data: any = await cartApi.getList(currentUserId)
    cartData.value = data.map((item: any) => ({
      ...item,
      selected: item.selected ?? true
    }))
  } catch (error) {
    uni.showToast({ title: '购买失败', icon: 'none' })
  }
}

const clearCart = () => {
  uni.showModal({
    title: '提示',
    content: '确定要清空购物车吗？',
    success: async (res: any) => {
      if (res.confirm) {
        try {
          await cartApi.clear(currentUserId)
          cartData.value = []
          uni.showToast({ title: '已清空', icon: 'success' })
        } catch (error) {
          uni.showToast({ title: '清空失败', icon: 'none' })
        }
      }
    }
  })
}

const goToGoods = () => {
  uni.switchTab({ url: '/pages/goods/index' })
}
</script>

<template>
  <view class="page">
    <view v-if="cartData.length === 0" class="empty-cart">
      <view class="empty-illustration">
        <text class="cart-emoji">🛒</text>
        <view class="cart-shadow"></view>
      </view>
      <text class="empty-title">购物车空空如也</text>
      <text class="empty-desc">快去挑选心仪的商品吧</text>
      <button class="go-shopping" @click="goToGoods">
        去逛逛
      </button>
    </view>
    
    <view v-else class="cart-content">
      <view class="cart-list">
        <view 
          v-for="item in cartData" 
          :key="item.id" 
          class="cart-item"
          :class="{ 'unselected': !item.selected }"
        >
          <view class="checkbox" :class="{ checked: item.selected }" @click="toggleSelect(item)">
            <text v-if="item.selected" class="check-icon">✓</text>
          </view>
          <view class="item-image-wrapper">
            <image :src="item.image" class="item-image" mode="aspectFill" />
          </view>
          <view class="item-info">
            <text class="item-name">{{ item.name }}</text>
            <view class="item-bottom">
              <text class="item-price">¥{{ item.price }}</text>
              <view class="quantity-control">
                <view class="qty-btn" @click="decrease(item)">
                  <text class="qty-icon">−</text>
                </view>
                <text class="qty-num">{{ item.quantity }}</text>
                <view class="qty-btn" @click="increase(item)">
                  <text class="qty-icon">+</text>
                </view>
              </view>
            </view>
          </view>
          <view class="delete-btn" @click="removeItem(item.id)">
            <text class="delete-icon">🗑️</text>
          </view>
        </view>
      </view>
    </view>
    
    <view v-if="cartData.length > 0" class="footer">
      <view class="footer-left">
        <view class="select-all" @click="toggleSelectAll">
          <view class="checkbox" :class="{ checked: selectAll }">
            <text v-if="selectAll" class="check-icon">✓</text>
          </view>
          <text class="all-text">全选</text>
        </view>
        <view class="clear-btn" @click="clearCart">清空</view>
      </view>
      <view class="footer-right">
        <view class="total-section">
          <text class="total-label">合计：</text>
          <text class="total-price">¥{{ totalPrice }}</text>
        </view>
        <view class="checkout-btn" :class="{ disabled: selectedCount === 0 }" @click="goToCheckout">
          购买{{ selectedCount > 0 ? `(${selectedCount})` : '' }}
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  background: #f5f5f5;
  padding-bottom: 120rpx;
  display: flex;
  flex-direction: column;
}

.empty-cart {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 160rpx;
  
  .empty-illustration {
    position: relative;
    margin-bottom: 40rpx;
    
    .cart-emoji {
      font-size: 160rpx;
      display: block;
    }
    
    .cart-shadow {
      position: absolute;
      bottom: -20rpx;
      left: 50%;
      transform: translateX(-50%);
      width: 120rpx;
      height: 20rpx;
      background: rgba(0, 0, 0, 0.1);
      border-radius: 50%;
    }
  }
  
  .empty-title {
    font-size: 36rpx;
    font-weight: 600;
    color: #495057;
  }
  
  .empty-desc {
    font-size: 26rpx;
    color: #868e96;
    margin-top: 12rpx;
  }
  
  .go-shopping {
    margin-top: 48rpx;
    width: 280rpx;
    height: 80rpx;
    line-height: 80rpx;
    background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
    color: #fff;
    font-size: 30rpx;
    font-weight: 500;
    border-radius: 40rpx;
    box-shadow: 0 8rpx 24rpx rgba(17, 153, 142, 0.3);
  }
}

.cart-content {
  flex: 1;
  padding: 24rpx;
  padding-bottom: 120rpx;
}

.cart-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.cart-item {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 20rpx;
  padding: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  
  &.unselected {
    opacity: 0.6;
    
    .item-image-wrapper {
      filter: grayscale(50%);
    }
  }
  
  .checkbox {
    width: 48rpx;
    height: 48rpx;
    border: 3rpx solid #dee2e6;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 20rpx;
    transition: all 0.3s ease;
    
    &.checked, &:active {
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
      border-color: transparent;
    }
    
    .check-icon {
      color: #fff;
      font-size: 28rpx;
      font-weight: bold;
    }
  }
  
  .item-image-wrapper {
    width: 180rpx;
    height: 180rpx;
    border-radius: 16rpx;
    overflow: hidden;
    flex-shrink: 0;
    
    .item-image {
      width: 100%;
      height: 100%;
    }
  }
  
  .item-info {
    flex: 1;
    margin-left: 20rpx;
    
    .item-name {
      font-size: 28rpx;
      font-weight: 600;
      color: #212529;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .item-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 20rpx;
      
      .item-price {
        color: #ff4757;
        font-size: 34rpx;
        font-weight: 800;
      }
      
      .quantity-control {
        display: flex;
        align-items: center;
        background: #f1f3f5;
        border-radius: 12rpx;
        
        .qty-btn {
          width: 52rpx;
          height: 52rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          
          .qty-icon {
            font-size: 32rpx;
            color: #495057;
            font-weight: 500;
          }
          
          &:active {
            background: #e9ecef;
            border-radius: 12rpx;
          }
        }
        
        .qty-num {
          width: 60rpx;
          text-align: center;
          font-size: 28rpx;
          font-weight: 600;
          color: #212529;
        }
      }
    }
  }
  
  .delete-btn {
    margin-left: 16rpx;
    padding: 12rpx;
    
    .delete-icon {
      font-size: 36rpx;
      opacity: 0.6;
      transition: opacity 0.3s;
    }
    
    &:active .delete-icon {
      opacity: 1;
    }
  }
}

.footer {
  position: fixed;
  bottom: calc(50px + env(safe-area-inset-bottom));
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100rpx;
  background: #fff;
  padding: 0 24rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  z-index: 100;
  
  .footer-left {
    display: flex;
    align-items: center;
    gap: 24rpx;
  }
  
  .select-all {
    display: flex;
    align-items: center;
    
    .checkbox {
      width: 44rpx;
      height: 44rpx;
      border: 2rpx solid #ddd;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 8rpx;
      
      &.checked {
        background: #ff4d4f;
        border-color: #ff4d4f;
      }
      
      .check-icon {
        color: #fff;
        font-size: 24rpx;
        font-weight: bold;
      }
    }
    
    .all-text {
      font-size: 26rpx;
      color: #333;
    }
  }
  
  .clear-btn {
    font-size: 26rpx;
    color: #666;
  }
  
  .footer-right {
    display: flex;
    align-items: center;
    gap: 20rpx;
  }
  
  .total-section {
    .total-label {
      font-size: 24rpx;
      color: #666;
    }
    
    .total-price {
      color: #ff4d4f;
      font-size: 36rpx;
      font-weight: bold;
    }
  }
  
  .checkout-btn {
    width: 180rpx;
    height: 72rpx;
    line-height: 72rpx;
    background: #ff4d4f;
    border-radius: 36rpx;
    text-align: center;
    color: #fff;
    font-size: 28rpx;
    font-weight: 500;
    
    &.disabled {
      background: #ccc;
    }
  }
}
</style>
