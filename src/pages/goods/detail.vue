<script setup lang="ts">
import { ref, onLoad } from 'vue'
import { goodsList, getGoodsById, type Goods } from '@/mock'

const goods = ref<Goods | null>(null)
const currentImage = ref('')
const quantity = ref(1)
const showActionSheet = ref(false)

onLoad((options: any) => {
  if (options.id) {
    const data = getGoodsById(Number(options.id))
    if (data) {
      goods.value = data
      currentImage.value = data.image
    }
  }
})

const decrease = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

const increase = () => {
  quantity.value++
}

const addToCart = () => {
  uni.showToast({
    title: '已加入购物车',
    icon: 'success'
  })
}

const buyNow = () => {
  uni.showToast({
    title: '立即购买',
    icon: 'success'
  })
}

const goToCompare = () => {
  uni.navigateTo({
    url: '/pages/compare/index'
  })
}

const goBack = () => {
  uni.navigateBack()
}

const goToCart = () => {
  uni.switchTab({
    url: '/pages/cart/index'
  })
}
</script>

<template>
  <view class="page" v-if="goods">
    <scroll-view scroll-y class="content">
      <view class="image-section">
        <image :src="currentImage" mode="aspectFill" class="main-image" />
        <view class="image-count">
          <text>1/1</text>
        </view>
      </view>

      <view class="price-section">
        <view class="price-row">
          <text class="price-symbol">¥</text>
          <text class="price-value">{{ goods.price }}</text>
        </view>
        <view class="tags-row">
          <text class="tag" v-for="tag in goods.tags" :key="tag">{{ tag }}</text>
        </view>
      </view>

      <view class="title-section">
        <text class="goods-title">{{ goods.name }}</text>
        <view class="share-btn">
          <text>📤</text>
          <text class="share-text">分享</text>
        </view>
      </view>

      <view class="desc-section">
        <text class="desc-text">{{ goods.description }}</text>
      </view>

      <view class="specs-section">
        <view class="specs-title">产品参数</view>
        <view class="specs-grid">
          <view class="spec-item">
            <text class="spec-label">品牌</text>
            <text class="spec-value">{{ goods.specs.brand }}</text>
          </view>
          <view class="spec-item">
            <text class="spec-label">型号</text>
            <text class="spec-value">{{ goods.specs.model }}</text>
          </view>
          <view class="spec-item">
            <text class="spec-label">存储</text>
            <text class="spec-value">{{ goods.specs.storage }}</text>
          </view>
          <view class="spec-item">
            <text class="spec-label">颜色</text>
            <text class="spec-value">{{ goods.specs.color }}</text>
          </view>
          <view class="spec-item">
            <text class="spec-label">保修</text>
            <text class="spec-value">{{ goods.specs.warranty }}</text>
          </view>
        </view>
      </view>

      <view class="sales-section">
        <text class="sales-text">已有 {{ goods.sales }} 人付款</text>
      </view>
    </scroll-view>

    <view class="bottom-bar">
      <view class="action-icons">
        <view class="icon-item" @click="goToCart">
          <text class="icon">🛒</text>
          <text class="icon-text">购物车</text>
        </view>
        <view class="icon-item" @click="goToCompare">
          <text class="icon">⚖️</text>
          <text class="icon-text">对比</text>
        </view>
      </view>
      <view class="action-buttons">
        <view class="add-cart-btn" @click="addToCart">加入购物车</view>
        <view class="buy-btn" @click="buyNow">立即购买</view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 100rpx;
}

.content {
  height: 100vh;
}

.image-section {
  position: relative;
  background: #fff;
  
  .main-image {
    width: 100%;
    height: 750rpx;
  }
  
  .image-count {
    position: absolute;
    right: 24rpx;
    bottom: 24rpx;
    background: rgba(0, 0, 0, 0.5);
    color: #fff;
    font-size: 24rpx;
    padding: 8rpx 20rpx;
    border-radius: 20rpx;
  }
}

.price-section {
  background: #fff;
  padding: 24rpx;
  margin-bottom: 16rpx;
  
  .price-row {
    display: flex;
    align-items: baseline;
    
    .price-symbol {
      font-size: 28rpx;
      color: #ff4d4f;
      font-weight: 600;
    }
    
    .price-value {
      font-size: 52rpx;
      color: #ff4d4f;
      font-weight: bold;
    }
  }
  
  .tags-row {
    display: flex;
    gap: 12rpx;
    margin-top: 12rpx;
    
    .tag {
      background: #ff4d4f;
      color: #fff;
      font-size: 20rpx;
      padding: 4rpx 12rpx;
      border-radius: 6rpx;
    }
  }
}

.title-section {
  background: #fff;
  padding: 24rpx;
  display: flex;
  align-items: flex-start;
  
  .goods-title {
    flex: 1;
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    line-height: 1.5;
  }
  
  .share-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-left: 24rpx;
    font-size: 24rpx;
    color: #666;
    
    .share-text {
      margin-top: 4rpx;
    }
  }
}

.desc-section {
  background: #fff;
  padding: 0 24rpx 24rpx;
  
  .desc-text {
    font-size: 26rpx;
    color: #666;
    line-height: 1.6;
  }
}

.specs-section {
  background: #fff;
  margin-top: 16rpx;
  padding: 24rpx;
  
  .specs-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 20rpx;
  }
  
  .specs-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 24rpx;
    
    .spec-item {
      width: calc(50% - 12rpx);
      display: flex;
      font-size: 24rpx;
      
      .spec-label {
        color: #999;
        width: 80rpx;
      }
      
      .spec-value {
        color: #333;
        flex: 1;
      }
    }
  }
}

.sales-section {
  background: #fff;
  padding: 24rpx;
  margin-top: 16rpx;
  
  .sales-text {
    font-size: 24rpx;
    color: #999;
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
