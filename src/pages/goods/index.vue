<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { goodsApi, cartApi } from '@/utils/api'
import type { Goods } from '@/types'

declare const uni: any

const goodsList = ref<Goods[]>([])
const cartCount = ref(0)
const loading = ref(true)

const loadGoods = async () => {
  try {
    const data: any = await goodsApi.getList()
    goodsList.value = data.map((item: any) => ({
      ...item,
      specs: typeof item.specs === 'string' ? JSON.parse(item.specs) : item.specs,
      tags: typeof item.tags === 'string' ? JSON.parse(item.tags) : item.tags
    }))
  } catch (error) {
    console.error('Failed to load goods:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadGoods()
})

const onPullDownRefresh = async () => {
  await loadGoods()
  uni.stopPullDownRefresh()
}

const handleBuyNow = () => {
  uni.switchTab({
    url: '/pages/cart/index'
  })
}

const goToCart = () => {
  uni.switchTab({
    url: '/pages/cart/index'
  })
}

const goToDetail = (goods: Goods) => {
  uni.navigateTo({
    url: `/pages/goods/detail?id=${goods.id}`
  })
}

const addToCart = async (goods: Goods) => {
  try {
    await cartApi.add({
      userId: 1,
      goodsId: goods.id,
      name: goods.name,
      price: goods.price,
      image: goods.image,
      quantity: 1
    })
    cartCount.value++
    uni.showToast({
      title: '已加入购物车',
      icon: 'success'
    })
  } catch (error) {
    uni.showToast({ title: '添加失败', icon: 'none' })
  }
}

const handleAddAllToCart = () => {
  uni.showToast({
    title: '已加入购物车',
    icon: 'success'
  })
}
</script>

<template>
  <view class="page">
    <view class="search-bar">
      <view class="search-input">
        <text class="search-icon">🔍</text>
        <text class="search-placeholder">搜索商品...</text>
      </view>
    </view>
    
    <view class="goods-grid">
        <view v-for="item in goodsList" :key="item.id" class="goods-item">
          <view class="image-wrapper" @click="goToDetail(item)">
            <image :src="item.image" mode="aspectFill" class="goods-image" />
            <view class="tags">
              <text v-for="tag in item.tags" :key="tag" class="tag">{{ tag }}</text>
            </view>
          </view>
          <view class="goods-info">
            <text class="goods-name" @click="goToDetail(item)">{{ item.name }}</text>
            <text class="goods-desc" @click="goToDetail(item)">{{ item.description }}</text>
            <view class="goods-bottom" @click="goToDetail(item)">
              <view class="price-wrapper">
                <text class="goods-price">¥{{ item.price }}</text>
              </view>
              <text class="goods-sales">{{ item.sales }}人付款</text>
            </view>
            <view class="goods-actions">
              <button class="add-btn" @click="addToCart(item)">
                <text class="btn-text">+ 加入</text>
              </button>
            </view>
          </view>
        </view>
      </view>
    
    <view class="floating-btns">
      <view class="float-btn cart-btn" @click="goToCart">
        <text class="float-icon">🛒</text>
        <text v-if="cartCount > 0" class="float-badge">{{ cartCount }}</text>
      </view>
    </view>

    <view class="bottom-bar">
      <view class="action-icons">
        <view class="icon-item" @click="goToCart">
          <text class="icon">🛒</text>
          <text class="icon-text">购物车</text>
        </view>
      </view>
      <view class="action-buttons">
        <view class="add-cart-btn" @click="handleAddAllToCart">加入</view>
        <view class="buy-btn" @click="handleBuyNow">立即购买</view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
  display: flex;
  flex-direction: column;
}

.search-bar {
  position: sticky;
  top: 44px;
  z-index: 99;
  background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 24rpx 32rpx 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  
  .search-input {
    display: flex;
    align-items: center;
    background: #fff;
    border-radius: 50rpx;
    padding: 20rpx 32rpx;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
    
    .search-icon {
      font-size: 28rpx;
      margin-right: 16rpx;
    }
    
    .search-placeholder {
      color: #adb5bd;
      font-size: 28rpx;
    }
  }
}

.goods-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 24rpx;
  gap: 24rpx;
}

.goods-item {
  width: calc(50% - 12rpx);
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.98);
  }
  
  .image-wrapper {
    position: relative;
    width: 100%;
    height: 320rpx;
    overflow: hidden;
    
    .goods-image {
      width: 100%;
      height: 100%;
      transition: transform 0.5s ease;
    }
    
    .tags {
      position: absolute;
      bottom: 12rpx;
      left: 12rpx;
      display: flex;
      gap: 8rpx;
      
      .tag {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #fff;
        font-size: 20rpx;
        padding: 6rpx 14rpx;
        border-radius: 20rpx;
        font-weight: 500;
      }
    }
  }
  
  .goods-info {
    padding: 20rpx;
    
    .goods-name {
      font-size: 28rpx;
      font-weight: 600;
      color: #212529;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .goods-desc {
      font-size: 22rpx;
      color: #868e96;
      margin-top: 8rpx;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      line-height: 1.5;
    }
    
    .goods-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 16rpx;
      
      .price-wrapper {
        .goods-price {
          color: #ff4757;
          font-size: 36rpx;
          font-weight: 800;
        }
      }
      
      .goods-sales {
        color: #adb5bd;
        font-size: 22rpx;
      }
    }
    
    .value-row {
      margin-top: 14rpx;
      
      .value-badge {
        display: inline-flex;
        align-items: center;
        padding: 8rpx 16rpx;
        border-radius: 10rpx;
        gap: 8rpx;
        
        .value-label {
          font-size: 20rpx;
          opacity: 0.9;
        }
        
        .value-score {
          font-size: 24rpx;
          font-weight: bold;
        }
        
        &.level-A {
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
          color: #fff;
        }
        
        &.level-B {
          background: linear-gradient(135deg, #56ab2f 0%, #a8e063 100%);
          color: #fff;
        }
        
        &.level-C {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: #fff;
        }
        
        &.level-D {
          background: linear-gradient(135deg, #868e96 0%, #adb5bd 100%);
          color: #fff;
        }
      }
    }
    
    .goods-actions {
  display: flex;
  gap: 12rpx;
  margin-top: 16rpx;
  
  .add-btn {
    flex: 1;
    height: 56rpx;
    line-height: 56rpx;
    font-size: 22rpx;
    border-radius: 28rpx;
    border: none;
    font-weight: 500;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6rpx;
    box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.4);
    
    .btn-text {
      font-size: 26rpx;
      font-weight: bold;
    }
    
    &:active {
      opacity: 0.9;
      transform: scale(0.98);
    }
  }
}
  }
}

.floating-btns {
  position: fixed;
  right: 24rpx;
  bottom: 200rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  z-index: 100;
  
  .float-btn {
    width: 96rpx;
    height: 96rpx;
    background: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
    position: relative;
    
    .float-icon {
      font-size: 44rpx;
    }
    
    .float-badge {
      position: absolute;
      top: -8rpx;
      right: -8rpx;
      background: #ff4757;
      color: #fff;
      font-size: 22rpx;
      font-weight: bold;
      min-width: 36rpx;
      height: 36rpx;
      line-height: 36rpx;
      text-align: center;
      border-radius: 18rpx;
      padding: 0 8rpx;
    }
  }
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background: #fff;
  display: flex;
  align-items: center;
  padding: 0 24rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  z-index: 100;
  
  .action-icons {
    display: flex;
    gap: 40rpx;
    margin-right: 24rpx;
    
    .icon-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      font-size: 20rpx;
      color: #666;
      
      .icon {
        font-size: 36rpx;
      }
      
      .icon-text {
        margin-top: 4rpx;
      }
    }
  }
  
  .action-buttons {
    flex: 1;
    display: flex;
    height: 72rpx;
    border-radius: 36rpx;
    overflow: hidden;
    
    .add-cart-btn, .buy-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28rpx;
      font-weight: 500;
    }
    
    .add-cart-btn {
      background: linear-gradient(135deg, #ff9800 0%, #ff6b00 100%);
      color: #fff;
    }
    
    .buy-btn {
      background: linear-gradient(135deg, #ff4d4f 0%, #f00 100%);
      color: #fff;
    }
  }
}
</style>

