<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad, onPullDownRefresh } from '@dcloudio/uni-app'
import { goodsApi, cartApi, reviewApi, favoriteApi } from '@/utils/api'
import type { Goods, Review, ReviewStats } from '@/types'

const goods = ref<Goods | null>(null)
const currentImage = ref('')
const quantity = ref(1)
const currentUserId = ref(1)
const reviews = ref<Review[]>([])
const reviewStats = ref<ReviewStats | null>(null)
const isFavorite = ref(false)

const loadGoods = async (id: number) => {
  try {
    const data: any = await goodsApi.getById(id)
    goods.value = {
      ...data,
      specs: typeof data.specs === 'string' ? JSON.parse(data.specs) : data.specs,
      tags: typeof data.tags === 'string' ? JSON.parse(data.tags) : data.tags
    }
    if (goods.value) {
      currentImage.value = goods.value.image
    }
  } catch (error) {
    console.error('Failed to load goods:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

const loadReviews = async (goodsId: number) => {
  try {
    const data: any = await reviewApi.getGoodsReviews(goodsId)
    reviews.value = data.reviews || []
    reviewStats.value = data.stats || null
  } catch (error) {
    console.error('Failed to load reviews:', error)
  }
}

const checkFavorite = async (goodsId: number) => {
  try {
    const user = uni.getStorageSync('user')
    if (user) {
      currentUserId.value = user.id
      const result: any = await favoriteApi.check(user.id, goodsId)
      isFavorite.value = result.isFavorite || false
    }
  } catch (error) {
    console.error('Failed to check favorite:', error)
  }
}

onLoad(async (options: { id?: string }) => {
  if (options.id) {
    const id = Number(options.id)
    await loadGoods(id)
    await loadReviews(id)
    await checkFavorite(id)
  }
})

onPullDownRefresh(async () => {
  if (goods.value) {
    await loadGoods(goods.value.id)
    await loadReviews(goods.value.id)
    await checkFavorite(goods.value.id)
  }
  uni.stopPullDownRefresh()
})

const decrease = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

const increase = () => {
  quantity.value++
}

const addToCart = async () => {
  if (!goods.value) return
  try {
    await cartApi.add({
      userId: currentUserId.value,
      goodsId: goods.value.id,
      name: goods.value.name,
      price: goods.value.price,
      image: goods.value.image,
      quantity: quantity.value
    })
    uni.showToast({
      title: '已加入购物车',
      icon: 'success'
    })
  } catch (error) {
    uni.showToast({ title: '添加失败', icon: 'none' })
  }
}

const buyNow = () => {
  uni.navigateTo({
    url: `/pages/checkout/index?goodsId=${goods.value?.id}&quantity=${quantity.value}`
  })
}

const toggleFavorite = async () => {
  if (!goods.value) return
  
  try {
    const user = uni.getStorageSync('user')
    if (!user) {
      uni.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    
    if (isFavorite.value) {
      await favoriteApi.cancel(user.id, goods.value.id)
      isFavorite.value = false
      uni.showToast({ title: '已取消收藏', icon: 'success' })
    } else {
      await favoriteApi.add({ userId: user.id, goodsId: goods.value.id })
      isFavorite.value = true
      uni.showToast({ title: '已收藏', icon: 'success' })
    }
  } catch (error) {
    uni.showToast({ title: '操作失败', icon: 'none' })
  }
}

const goToReviews = () => {
  if (!goods.value) return
  uni.navigateTo({
    url: `/pages/review/list?goodsId=${goods.value.id}`
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

const getRatingStars = (rating: number) => {
  return '⭐'.repeat(Math.floor(rating))
}

const getRatingColor = (rating: number) => {
  if (rating >= 4) return '#ff4757'
  if (rating >= 3) return '#ff9800'
  if (rating >= 2) return '#ffc107'
  return '#999'
}
</script>

<template>
  <view class="page" v-if="goods">
    <view class="content">
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
        <view class="action-buttons">
          <view class="fav-btn" :class="{ active: isFavorite }" @tap="toggleFavorite">
            <text class="fav-icon">{{ isFavorite ? '❤️' : '🤍' }}</text>
          </view>
          <view class="share-btn">
            <text>📤</text>
            <text class="share-text">分享</text>
          </view>
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

      <view class="reviews-section" v-if="reviews.length > 0">
        <view class="section-header">
          <text class="section-title">用户评价</text>
          <view class="rating-summary" v-if="reviewStats">
            <text class="rating-score">{{ reviewStats.averageRating }}</text>
            <text class="rating-stars">{{ getRatingStars(reviewStats.averageRating) }}</text>
            <text class="rating-count">({{ reviewStats.total }})</text>
          </view>
        </view>

        <view class="reviews-list">
          <view 
            v-for="review in reviews.slice(0, 3)" 
            :key="review.id" 
            class="review-item"
          >
            <view class="review-header">
              <image :src="review.avatar" class="review-avatar" mode="aspectFill" />
              <view class="review-user">
                <text class="review-name">{{ review.nickname }}</text>
                <text class="review-stars" :style="{ color: getRatingColor(review.rating) }">
                  {{ getRatingStars(review.rating) }}
                </text>
              </view>
              <text class="review-time">{{ review.createdAt }}</text>
            </view>
            <text class="review-content">{{ review.content }}</text>
          </view>
        </view>

        <view class="view-all-btn" @tap="goToReviews">
          <text>查看全部评价</text>
          <text class="arrow">›</text>
        </view>
      </view>
    </view>

    <view class="bottom-bar">
      <view class="action-icons">
        <view class="icon-item" @tap="goToCart">
          <text class="icon">🛒</text>
          <text class="icon-text">购物车</text>
        </view>
      </view>
      <view class="action-buttons">
        <view class="add-cart-btn" @tap="addToCart">加入</view>
        <view class="buy-btn" @tap="buyNow">立即购买</view>
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
  
  .action-buttons {
    display: flex;
    gap: 12rpx;
    
    .fav-btn {
      width: 72rpx;
      height: 72rpx;
      border-radius: 50%;
      background: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      
      &.active {
        background: #ff4757;
        
        .fav-icon {
          color: #fff;
        }
      }
      
      .fav-icon {
        font-size: 32rpx;
        color: #666;
      }
    }
    
    .share-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      font-size: 24rpx;
      color: #666;
      
      .share-text {
        margin-top: 4rpx;
        font-size: 20rpx;
      }
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

.reviews-section {
  background: #fff;
  margin-top: 16rpx;
  padding: 24rpx;
  
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
    
    .rating-summary {
      display: flex;
      align-items: center;
      gap: 12rpx;
      
      .rating-score {
        font-size: 36rpx;
        font-weight: bold;
        color: #ff4757;
      }
      
      .rating-stars {
        font-size: 28rpx;
      }
      
      .rating-count {
        font-size: 24rpx;
        color: #999;
      }
    }
  }
  
  .reviews-list {
    .review-item {
      padding: 20rpx 0;
      border-bottom: 1rpx solid #f0f0f0;
      
      &:last-child {
        border-bottom: none;
      }
      
      .review-header {
        display: flex;
        align-items: center;
        margin-bottom: 12rpx;
        
        .review-avatar {
          width: 60rpx;
          height: 60rpx;
          border-radius: 50%;
          margin-right: 12rpx;
        }
        
        .review-user {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 12rpx;
          
          .review-name {
            font-size: 26rpx;
            font-weight: 600;
            color: #333;
          }
          
          .review-stars {
            font-size: 24rpx;
          }
        }
        
        .review-time {
          font-size: 22rpx;
          color: #999;
        }
      }
      
      .review-content {
        display: block;
        font-size: 26rpx;
        color: #666;
        line-height: 1.6;
      }
    }
  }
  
  .view-all-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20rpx;
    margin-top: 20rpx;
    background: #f8f9fa;
    border-radius: 12rpx;
    font-size: 26rpx;
    color: #667eea;
    
    .arrow {
      margin-left: 8rpx;
      font-size: 28rpx;
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
