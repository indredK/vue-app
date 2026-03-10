<script setup lang="ts">
import { ref, computed } from 'vue'
import { getCartItems, cartList, type CartItem } from '@/mock'

const cartData = ref<CartItem[]>(getCartItems())

const selectAll = ref(cartData.value.length > 0 && cartData.value.every(item => item.selected))

const totalPrice = computed(() => {
  return cartData.value
    .filter(item => item.selected)
    .reduce((sum, item) => sum + item.price * item.quantity, 0)
})

const selectedCount = computed(() => {
  return cartData.value.filter(item => item.selected).length
})

const toggleSelect = (item: CartItem) => {
  item.selected = !item.selected
  selectAll.value = cartData.value.length > 0 && cartData.value.every(item => item.selected)
}

const toggleSelectAll = () => {
  selectAll.value = !selectAll.value
  cartData.value.forEach(item => {
    item.selected = selectAll.value
  })
}

const increase = (item: CartItem) => {
  item.quantity++
}

const decrease = (item: CartItem) => {
  if (item.quantity > 1) {
    item.quantity--
  }
}

const removeItem = (id: number) => {
  uni.showModal({
    title: '提示',
    content: '确定要删除该商品吗？',
    success: (res) => {
      if (res.confirm) {
        const index = cartData.value.findIndex(item => item.id === id)
        if (index > -1) {
          cartData.value.splice(index, 1)
          uni.showToast({ title: '已删除', icon: 'success' })
        }
      }
    }
  })
}

const goToCheckout = () => {
  const selectedItems = cartData.value.filter(item => item.selected)
  if (selectedItems.length === 0) {
    uni.showToast({ title: '请选择商品', icon: 'none' })
    return
  }
  uni.showToast({ title: '去结算', icon: 'success' })
}

const clearCart = () => {
  uni.showModal({
    title: '提示',
    content: '确定要清空购物车吗？',
    success: (res) => {
      if (res.confirm) {
        cartData.value = []
        uni.showToast({ title: '已清空', icon: 'success' })
      }
    }
  })
}
</script>

<template>
  <view class="page">
    <view class="header">
      <view class="header-left">
        <text class="title">购物车</text>
        <text class="subtitle">共 {{ cartData.length }} 件商品</text>
      </view>
      <text v-if="cartData.length > 0" class="edit-btn" @click="clearCart">清空</text>
    </view>
    
    <view v-if="cartData.length === 0" class="empty-cart">
      <view class="empty-illustration">
        <text class="cart-emoji">🛒</text>
        <view class="cart-shadow"></view>
      </view>
      <text class="empty-title">购物车空空如也</text>
      <text class="empty-desc">快去挑选心仪的商品吧</text>
      <button class="go-shopping" @click="uni.switchTab({ url: '/pages/goods/index' })">
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
          <view class="checkbox" @click="toggleSelect(item)">
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
      <view class="select-all" @click="toggleSelectAll">
        <view class="checkbox" :class="{ checked: selectAll }">
          <text v-if="selectAll" class="check-icon">✓</text>
        </view>
        <text class="all-text">全选</text>
      </view>
      <view class="total-section">
        <view class="total-info">
          <text class="total-label">合计</text>
          <view class="total-price-wrap">
            <text class="total-price">¥{{ totalPrice }}</text>
          </view>
        </view>
        <view class="checkout-btn" :class="{ disabled: selectedCount === 0 }" @click="goToCheckout">
          <text class="checkout-text">结算</text>
          <text v-if="selectedCount > 0" class="checkout-count">({{ selectedCount }})</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
  padding-bottom: 140rpx;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40rpx 32rpx 24rpx;
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  
  .header-left {
    .title {
      display: block;
      font-size: 44rpx;
      font-weight: bold;
      color: #fff;
    }
    
    .subtitle {
      display: block;
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.8);
      margin-top: 8rpx;
    }
  }
  
  .edit-btn {
    color: rgba(255, 255, 255, 0.9);
    font-size: 28rpx;
    background: rgba(255, 255, 255, 0.2);
    padding: 12rpx 24rpx;
    border-radius: 30rpx;
  }
}

.empty-cart {
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
  padding: 24rpx;
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
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 120rpx;
  background: #fff;
  padding: 0 32rpx;
  box-shadow: 0 -8rpx 32rpx rgba(0, 0, 0, 0.06);
  z-index: 100;
  
  .select-all {
    display: flex;
    align-items: center;
    
    .checkbox {
      width: 48rpx;
      height: 48rpx;
      border: 3rpx solid #dee2e6;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12rpx;
      transition: all 0.3s ease;
      
      &.checked {
        background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
        border-color: transparent;
      }
      
      .check-icon {
        color: #fff;
        font-size: 28rpx;
        font-weight: bold;
      }
    }
    
    .all-text {
      font-size: 28rpx;
      color: #495057;
    }
  }
  
  .total-section {
    display: flex;
    align-items: center;
    
    .total-info {
      margin-right: 32rpx;
      text-align: right;
      
      .total-label {
        font-size: 24rpx;
        color: #868e96;
      }
      
      .total-price-wrap {
        .total-price {
          color: #ff4757;
          font-size: 40rpx;
          font-weight: 800;
        }
      }
    }
    
    .checkout-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 200rpx;
      height: 80rpx;
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
      border-radius: 40rpx;
      box-shadow: 0 8rpx 24rpx rgba(17, 153, 142, 0.3);
      
      .checkout-text {
        color: #fff;
        font-size: 30rpx;
        font-weight: 600;
      }
      
      .checkout-count {
        color: rgba(255, 255, 255, 0.8);
        font-size: 26rpx;
        margin-left: 6rpx;
      }
      
      &.disabled {
        background: #dee2e6;
        box-shadow: none;
      }
    }
  }
}
</style>
