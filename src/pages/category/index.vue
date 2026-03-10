<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { categoryApi, goodsApi } from '@/utils/api'
import type { Category, Goods } from '@/types'

declare const uni: any

const categories = ref<Category[]>([])
const goodsList = ref<Goods[]>([])
const selectedCategoryId = ref<number | null>(null)
const loading = ref(true)

const loadCategories = async () => {
  try {
    const data = await categoryApi.getTree()
    categories.value = data || []
  } catch (error) {
    console.error('Failed to load categories:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

const loadGoods = async (categoryId: number | null) => {
  try {
    loading.value = true
    const params: any = {
      page: 1,
      limit: 20
    }
    
    if (categoryId) {
      params.categoryId = categoryId
    }
    
    const data: any = await goodsApi.getList(params)
    goodsList.value = data.goods.map((item: any) => ({
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
  await loadCategories()
  await loadGoods(null)
})

const selectCategory = async (categoryId: number | null) => {
  selectedCategoryId.value = categoryId
  await loadGoods(categoryId)
}

const goToDetail = (goods: Goods) => {
  uni.navigateTo({
    url: `/pages/goods/detail?id=${goods.id}`
  })
}

const getCategoryIcon = (icon: string) => {
  const iconMap: Record<string, string> = {
    phone: '📱',
    tablet: '📱',
    computer: '💻',
    camera: '📷',
    headphone: '🎧',
    watch: '⌚',
    clothing: '👕',
    shoes: '👟',
    home: '🏠',
    food: '🍔',
    book: '📚',
    sports: '⚽',
    beauty: '💄',
    toy: '🧸'
  }
  return iconMap[icon] || '📦'
}
</script>

<template>
  <view class="page">
    <view class="category-sidebar">
      <scroll-view scroll-y class="category-list">
        <view 
          class="category-item"
          :class="{ active: selectedCategoryId === null }"
          @click="selectCategory(null)"
        >
          <text class="category-icon">🏠</text>
          <text class="category-name">全部商品</text>
        </view>
        <view 
          v-for="category in categories" 
          :key="category.id" 
          class="category-item"
          :class="{ active: selectedCategoryId === category.id }"
          @click="selectCategory(category.id)"
        >
          <text class="category-icon">{{ getCategoryIcon(category.icon) }}</text>
          <text class="category-name">{{ category.name }}</text>
          <text class="category-arrow" v-if="category.children && category.children.length > 0">›</text>
        </view>
      </scroll-view>
    </view>

    <view class="goods-content">
      <view v-if="loading" class="loading">
        <text class="loading-text">加载中...</text>
      </view>

      <view v-else-if="goodsList.length === 0" class="empty">
        <text class="empty-icon">📦</text>
        <text class="empty-text">暂无商品</text>
      </view>

      <view v-else class="goods-grid">
        <view 
          v-for="item in goodsList" 
          :key="item.id" 
          class="goods-item"
          @click="goToDetail(item)"
        >
          <image :src="item.image" mode="aspectFill" class="goods-image" />
          <view class="tags">
            <text v-for="tag in item.tags" :key="tag" class="tag">{{ tag }}</text>
          </view>
          <view class="goods-info">
            <text class="goods-name">{{ item.name }}</text>
            <view class="goods-bottom">
              <text class="goods-price">¥{{ item.price }}</text>
              <text class="goods-sales">{{ item.sales }}人付款</text>
            </view>
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
  display: flex;
  height: 100vh;
}

.category-sidebar {
  width: 200rpx;
  background: #fff;
  border-right: 1rpx solid #e0e0e0;
  height: 100vh;
  flex-shrink: 0;
}

.category-list {
  height: 100vh;
}

.category-item {
  display: flex;
  align-items: center;
  padding: 24rpx 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
  transition: all 0.3s ease;
  
  &.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    
    .category-icon, .category-name {
      color: #fff;
    }
  }
  
  .category-icon {
    font-size: 32rpx;
    margin-right: 12rpx;
  }
  
  .category-name {
    flex: 1;
    font-size: 26rpx;
    color: #333;
  }
  
  .category-arrow {
    font-size: 24rpx;
    color: #999;
  }
}

.goods-content {
  flex: 1;
  overflow-y: auto;
  height: 100vh;
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
}

.goods-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 20rpx;
  gap: 20rpx;
}

.goods-item {
  width: calc(50% - 10rpx);
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.98);
  }
  
  .goods-image {
    width: 100%;
    height: 320rpx;
    transition: transform 0.5s ease;
  }
  
  .tags {
    position: absolute;
    top: 12rpx;
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
    
    .goods-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 16rpx;
      
      .goods-price {
        color: #ff4757;
        font-size: 36rpx;
        font-weight: 800;
      }
      
      .goods-sales {
        color: #adb5bd;
        font-size: 22rpx;
      }
    }
  }
}
</style>
