<script setup lang="ts">
import { ref, onMounted, onShow } from 'vue'
import { onPullDownRefresh } from '@dcloudio/uni-app'
import { favoriteApi } from '@/utils/api'
import type { Favorite } from '@/types'

declare const uni: any

const favorites = ref<Favorite[]>([])
const loading = ref(true)
const currentUserId = ref(1)

const loadFavorites = async () => {
  try {
    const user = uni.getStorageSync('user')
    if (user) {
      currentUserId.value = user.id
    }
    const data = await favoriteApi.getList(currentUserId.value)
    favorites.value = data
  } catch (error) {
    console.error('Failed to load favorites:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadFavorites()
})

onShow(async () => {
  await loadFavorites()
})

onPullDownRefresh(async () => {
  await loadFavorites()
  uni.stopPullDownRefresh()
})

const goToDetail = (favorite: Favorite) => {
  uni.navigateTo({
    url: `/pages/goods/detail?id=${favorite.goodsId}`
  })
}

const removeFavorite = (favorite: Favorite) => {
  uni.showModal({
    title: '提示',
    content: '确定要取消收藏吗？',
    success: async (res: any) => {
      if (res.confirm) {
        try {
          await favoriteApi.cancel(currentUserId.value, favorite.goodsId)
          uni.showToast({ title: '已取消收藏', icon: 'success' })
          await loadFavorites()
        } catch (error) {
          uni.showToast({ title: '操作失败', icon: 'none' })
        }
      }
    }
  })
}

const addToCart = (favorite: Favorite) => {
  uni.showToast({ title: '已加入购物车', icon: 'success' })
}
</script>

<template>
  <view class="page">
    <view v-if="loading" class="loading">
      <text class="loading-text">加载中...</text>
    </view>

    <view v-else-if="favorites.length === 0" class="empty">
      <text class="empty-icon">❤️</text>
      <text class="empty-text">暂无收藏</text>
      <button class="go-shopping" @click="() => uni.switchTab({ url: '/pages/goods/index' })">
        去逛逛
      </button>
    </view>

    <view v-else class="favorites-list">
      <view 
        v-for="item in favorites" 
        :key="item.id" 
        class="favorite-item"
        @click="goToDetail(item)"
      >
        <image :src="item.image" class="goods-image" mode="aspectFill" />
        <view class="goods-info">
          <text class="goods-name">{{ item.name }}</text>
          <view class="goods-bottom">
            <text class="goods-price">¥{{ item.price }}</text>
            <text class="goods-sales">{{ item.sales }}人付款</text>
          </view>
          <view class="goods-actions">
            <button class="action-btn cart-btn" @click.stop="addToCart(item)">
              加入购物车
            </button>
            <button class="action-btn delete-btn" @click.stop="removeFavorite(item)">
              取消收藏
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
  background: #f5f5f5;
  padding-bottom: 20rpx;
}

.loading, .empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
  
  .loading-text, .empty-text {
    font-size: 28rpx;
    color: #999;
    margin-bottom: 32rpx;
  }
  
  .empty-icon {
    font-size: 120rpx;
    margin-bottom: 20rpx;
  }
  
  .go-shopping {
    width: 280rpx;
    height: 80rpx;
    line-height: 80rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    font-size: 30rpx;
    font-weight: 500;
    border-radius: 40rpx;
    border: none;
  }
}

.favorites-list {
  padding: 20rpx;
}

.favorite-item {
  display: flex;
  background: #fff;
  border-radius: 20rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
  
  .goods-image {
    width: 200rpx;
    height: 200rpx;
    flex-shrink: 0;
  }
  
  .goods-info {
    flex: 1;
    padding: 20rpx;
    display: flex;
    flex-direction: column;
    
    .goods-name {
      font-size: 28rpx;
      font-weight: 600;
      color: #333;
      margin-bottom: 12rpx;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .goods-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16rpx;
      
      .goods-price {
        font-size: 36rpx;
        font-weight: 800;
        color: #ff4757;
      }
      
      .goods-sales {
        font-size: 24rpx;
        color: #999;
      }
    }
    
    .goods-actions {
      display: flex;
      gap: 12rpx;
      margin-top: auto;
      
      .action-btn {
        flex: 1;
        height: 64rpx;
        line-height: 64rpx;
        font-size: 24rpx;
        border-radius: 32rpx;
        border: none;
        
        &.cart-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #fff;
        }
        
        &.delete-btn {
          background: #f5f5f5;
          color: #666;
        }
      }
    }
  }
}
</style>
