<script setup lang="ts">
import { ref, computed } from 'vue'
import { goodsList, type Goods } from '@/mock'

const cartCount = ref(0)
const compareList = ref<Goods[]>([])
const showCompare = ref(false)

const goToCompare = () => {
  if (compareList.value.length < 2) {
    uni.showToast({ title: '请至少选择2个商品', icon: 'none' })
    return
  }
  uni.navigateTo({
    url: '/pages/compare/index'
  })
}

const addToCart = (goods: Goods) => {
  cartCount.value++
  uni.showToast({
    title: '已加入购物车',
    icon: 'success'
  })
}

const toggleCompare = (goods: Goods) => {
  const index = compareList.value.findIndex(item => item.id === goods.id)
  if (index > -1) {
    compareList.value.splice(index, 1)
  } else {
    if (compareList.value.length >= 4) {
      uni.showToast({ title: '最多对比4个商品', icon: 'none' })
      return
    }
    compareList.value.push(goods)
  }
}

const isInCompare = (goods: Goods) => {
  return compareList.value.some(item => item.id === goods.id)
}

const getPriceScore = (price: number) => {
  const minPrice = Math.min(...goodsList.map(g => g.price))
  const maxPrice = Math.max(...goodsList.map(g => g.price))
  return ((maxPrice - price) / (maxPrice - minPrice) * 100).toFixed(0)
}

const getSalesScore = (sales: number) => {
  const minSales = Math.min(...goodsList.map(g => g.sales))
  const maxSales = Math.max(...goodsList.map(g => g.sales))
  return ((sales - minSales) / (maxSales - minSales) * 100).toFixed(0)
}

const getValueScore = (goods: Goods) => {
  const priceScore = parseFloat(getPriceScore(goods.price))
  const salesScore = parseFloat(getSalesScore(goods.sales))
  return ((priceScore + salesScore) / 2).toFixed(0)
}

const getValueLevel = (score: number) => {
  if (score >= 80) return 'A'
  if (score >= 60) return 'B'
  if (score >= 40) return 'C'
  return 'D'
}
</script>

<template>
  <view class="page">
    <view class="header">
      <view class="header-content">
        <text class="title">精选商品</text>
        <text class="subtitle">发现好物</text>
      </view>
      <view class="header-right">
        <view class="compare-btn" @click="goToCompare">
          <text class="btn-icon">⚖️</text>
          <text v-if="compareList.length > 0" class="compare-badge">{{ compareList.length }}</text>
        </view>
        <view class="cart-icon" @click="uni.switchTab({ url: '/pages/cart/index' })">
          <text class="btn-icon">🛒</text>
          <text v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</text>
        </view>
      </view>
    </view>
    
    <view class="search-bar">
      <view class="search-input">
        <text class="search-icon">🔍</text>
        <text class="search-placeholder">搜索商品...</text>
      </view>
    </view>
    
    <view v-if="compareList.length > 0" class="compare-bar">
      <view class="compare-info">
        <text class="compare-text">已选 {{ compareList.length }} 个商品对比</text>
      </view>
      <view class="compare-actions">
        <text class="clear-compare" @click="compareList = []">清空</text>
        <view class="go-compare" @click="goToCompare">开始对比</view>
      </view>
    </view>
    
    <view class="goods-grid">
      <view 
        v-for="item in goodsList" 
        :key="item.id" 
        class="goods-item"
      >
        <view class="compare-checkbox" @click="toggleCompare(item)">
          <text v-if="isInCompare(item)" class="check-icon">✓</text>
        </view>
        <view class="image-wrapper">
          <image :src="item.image" mode="aspectFill" class="goods-image" />
          <view class="tags">
            <text v-for="tag in item.tags" :key="tag" class="tag">{{ tag }}</text>
          </view>
        </view>
        <view class="goods-info">
          <text class="goods-name">{{ item.name }}</text>
          <text class="goods-desc">{{ item.description }}</text>
          <view class="goods-bottom">
            <view class="price-wrapper">
              <text class="goods-price">¥{{ item.price }}</text>
            </view>
            <text class="goods-sales">{{ item.sales }}人付款</text>
          </view>
          <view class="value-row">
            <view class="value-badge" :class="'level-' + getValueLevel(Number(getValueScore(item)))">
              <text class="value-label">性价比</text>
              <text class="value-score">{{ getValueScore(item) }}分</text>
            </view>
          </view>
          <view class="goods-actions">
            <button class="compare-btn-item" @click="toggleCompare(item)">
              {{ isInCompare(item) ? '已添加' : '对比' }}
            </button>
            <button class="add-btn" @click="addToCart(item)">
              <text class="btn-text">+</text> 加入购物车
            </button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40rpx 32rpx 32rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: visible;
  
  .header-content {
    .title {
      display: block;
      font-size: 44rpx;
      font-weight: bold;
      color: #fff;
    }
    
    .subtitle {
      display: block;
      font-size: 26rpx;
      color: rgba(255, 255, 255, 0.8);
      margin-top: 8rpx;
    }
  }
  
  .header-right {
    display: flex;
    align-items: center;
    gap: 16rpx;
  }
  
  .compare-btn, .cart-icon {
    position: relative;
    width: 72rpx;
    height: 72rpx;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(10px);
    
    .btn-icon {
      font-size: 32rpx;
    }
    
    .compare-badge, .cart-badge {
      position: absolute;
      top: -4rpx;
      right: -4rpx;
      background: #ff4757;
      color: #fff;
      font-size: 20rpx;
      font-weight: bold;
      min-width: 32rpx;
      height: 32rpx;
      line-height: 32rpx;
      text-align: center;
      border-radius: 16rpx;
      padding: 0 8rpx;
    }
  }
}

.search-bar {
  padding: 0 32rpx;
  position: relative;
  z-index: 10;
  
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

.compare-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 24rpx 32rpx;
  padding: 20rpx 24rpx;
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  border-radius: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(252, 182, 159, 0.3);
  
  .compare-info {
    .compare-text {
      color: #d35400;
      font-size: 26rpx;
      font-weight: 500;
    }
  }
  
  .compare-actions {
    display: flex;
    align-items: center;
    gap: 20rpx;
    
    .clear-compare {
      color: #999;
      font-size: 24rpx;
    }
    
    .go-compare {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: #fff;
      padding: 12rpx 28rpx;
      border-radius: 30rpx;
      font-size: 24rpx;
      font-weight: 500;
      box-shadow: 0 4rpx 12rpx rgba(245, 87, 108, 0.3);
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
  
  .compare-checkbox {
    position: absolute;
    top: 16rpx;
    left: 16rpx;
    width: 48rpx;
    height: 48rpx;
    background: rgba(255, 255, 255, 0.95);
    border: 3rpx solid #dee2e6;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    transition: all 0.3s ease;
    
    .check-icon {
      color: #667eea;
      font-size: 28rpx;
      font-weight: bold;
    }
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
      
      .compare-btn-item, .add-btn {
        flex: 1;
        height: 56rpx;
        line-height: 56rpx;
        font-size: 22rpx;
        border-radius: 28rpx;
        border: none;
        font-weight: 500;
      }
      
      .compare-btn-item {
        background: #f1f3f5;
        color: #495057;
        
        &:active {
          background: #e9ecef;
        }
      }
      
      .add-btn {
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
</style>
