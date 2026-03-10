<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { goodsApi, cartApi, categoryApi, favoriteApi } from '@/utils/api'
import type { Goods, Category } from '@/types'

declare const uni: any

const goodsList = ref<Goods[]>([])
const categories = ref<Category[]>([])
const cartCount = ref(0)
const loading = ref(true)
const searchKeyword = ref('')
const selectedCategoryId = ref<number | null>(null)
const priceRange = ref({ min: '', max: '' })
const sortBy = ref('default')
const showFilter = ref(true)
const showFilterModal = ref(false)

const sortOptions = [
  { key: 'default', label: '默认' },
  { key: 'sales', label: '销量' },
  { key: 'price_asc', label: '价格从低到高' },
  { key: 'price_desc', label: '价格从高到低' }
]

const loadGoods = async () => {
  try {
    loading.value = true
    const params: any = {
      page: 1,
      limit: 20
    }
    
    if (searchKeyword.value) {
      params.keyword = searchKeyword.value
    }
    
    if (selectedCategoryId.value) {
      params.categoryId = selectedCategoryId.value
    }
    
    if (priceRange.value.min) {
      params.minPrice = Number(priceRange.value.min)
    }
    
    if (priceRange.value.max) {
      params.maxPrice = Number(priceRange.value.max)
    }
    
    if (sortBy.value !== 'default') {
      if (sortBy.value === 'sales') {
        params.sort = 'sales'
        params.order = 'DESC'
      } else if (sortBy.value === 'price_asc') {
        params.sort = 'price'
        params.order = 'ASC'
      } else if (sortBy.value === 'price_desc') {
        params.sort = 'price'
        params.order = 'DESC'
      }
    }
    
    console.log('Loading goods with params:', params)
    const data: any = await goodsApi.getList(params)
    console.log('API response:', data)
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

const loadCategories = async () => {
  try {
    const data: any = await categoryApi.getTree()
    categories.value = data || []
  } catch (error) {
    console.error('Failed to load categories:', error)
    categories.value = []
  }
}

onMounted(async () => {
  await loadCategories()
  await loadGoods()
})

const onPullDownRefresh = async () => {
  await loadGoods()
  uni.stopPullDownRefresh()
}

const handleSearch = () => {
  loadGoods()
}

const handleFilter = () => {
  loadGoods()
  showFilterModal.value = false
}

const handleSort = (option: any) => {
  sortBy.value = option.key
  loadGoods()
}

const resetFilter = () => {
  searchKeyword.value = ''
  selectedCategoryId.value = null
  priceRange.value = { min: '', max: '' }
  sortBy.value = 'default'
  loadGoods()
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

const toggleFavorite = async (goods: Goods) => {
  try {
    const user = uni.getStorageSync('user')
    if (!user) {
      uni.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    
    const checkResult: any = await favoriteApi.check(user.id, goods.id)
    if (checkResult.isFavorite) {
      await favoriteApi.cancel(user.id, goods.id)
      uni.showToast({ title: '已取消收藏', icon: 'success' })
    } else {
      await favoriteApi.add({ userId: user.id, goodsId: goods.id })
      uni.showToast({ title: '已收藏', icon: 'success' })
    }
  } catch (error) {
    uni.showToast({ title: '操作失败', icon: 'none' })
  }
}

const selectCategory = (categoryId: number | null) => {
  selectedCategoryId.value = categoryId
  loadGoods()
}
</script>

<template>
  <view class="page">
    <view class="search-bar">
      <view class="search-input">
        <text class="search-icon">🔍</text>
        <input 
          v-model="searchKeyword" 
          class="search-field" 
          placeholder="搜索商品..." 
          @confirm="handleSearch"
        />
      </view>
      <view class="filter-btn" @tap="showFilter = !showFilter">
        <text class="filter-icon">⚙️</text>
      </view>
    </view>

    <view class="category-bar" v-if="showFilter">
      <scroll-view scroll-x class="category-scroll">
        <view class="category-list">
          <view 
            class="category-item"
            :class="{ active: selectedCategoryId === null }"
            @tap="selectCategory(null)"
          >
            <text class="category-text">全部</text>
          </view>
          <view 
            v-for="category in categories" 
            :key="category.id" 
            class="category-item"
            :class="{ active: selectedCategoryId === category.id }"
            @tap="selectCategory(category.id)"
          >
            <text class="category-text">{{ category.name }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <view class="sort-bar" v-if="showFilter">
      <view 
        v-for="option in sortOptions" 
        :key="option.key" 
        class="sort-item"
        :class="{ active: sortBy === option.key }"
        @tap="handleSort(option)"
      >
        <text class="sort-text">{{ option.label }}</text>
      </view>
    </view>
    
    <view class="goods-grid">
        <view v-for="item in goodsList" :key="item.id" class="goods-item">
          <view class="image-wrapper" @tap="goToDetail(item)">
            <image :src="item.image" mode="aspectFill" class="goods-image" />
            <view class="tags">
              <text v-for="tag in item.tags" :key="tag" class="tag">{{ tag }}</text>
            </view>
          </view>
          <view class="goods-info">
            <text class="goods-name" @tap="goToDetail(item)">{{ item.name }}</text>
            <text class="goods-desc" @tap="goToDetail(item)">{{ item.description }}</text>
            <view class="goods-bottom" @tap="goToDetail(item)">
              <view class="price-wrapper">
                <text class="goods-price">¥{{ item.price }}</text>
              </view>
              <text class="goods-sales">{{ item.sales }}人付款</text>
            </view>
            <view class="goods-actions">
              <button class="fav-btn" @tap="toggleFavorite(item)">
                <text class="btn-text">❤️</text>
              </button>
              <button class="add-btn" @tap="addToCart(item)">
                <text class="btn-text">+ 加入</text>
              </button>
            </view>
          </view>
        </view>
      </view>
    
    <view class="floating-btns">
      <view class="float-btn cart-btn" @tap="goToCart">
        <text class="float-icon">🛒</text>
        <text v-if="cartCount > 0" class="float-badge">{{ cartCount }}</text>
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
  display: flex;
  align-items: center;
  gap: 16rpx;
  
  .search-input {
    flex: 1;
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
    
    .search-field {
      flex: 1;
      font-size: 28rpx;
      color: #212529;
    }
  }
  
  .filter-btn {
    width: 72rpx;
    height: 72rpx;
    background: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
    
    .filter-icon {
      font-size: 32rpx;
    }
  }
}

.category-bar {
  background: #fff;
  padding: 16rpx 0;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  
  .category-scroll {
    white-space: nowrap;
  }
  
  .category-list {
    display: inline-flex;
    padding: 0 24rpx;
    gap: 24rpx;
    
    .category-item {
      padding: 12rpx 24rpx;
      border-radius: 24rpx;
      background: #f5f5f5;
      transition: all 0.3s ease;
      
      &.active {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #fff;
      }
      
      .category-text {
        font-size: 26rpx;
        color: #666;
        
        .active & {
          color: #fff;
        }
      }
    }
  }
}

.sort-bar {
  background: #fff;
  padding: 16rpx 24rpx;
  display: flex;
  gap: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  
  .sort-item {
    padding: 8rpx 20rpx;
    border-radius: 20rpx;
    background: #f5f5f5;
    transition: all 0.3s ease;
    
    &.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
    }
    
    .sort-text {
      font-size: 24rpx;
      color: #666;
      
      .active & {
        color: #fff;
      }
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
  
  .fav-btn {
    flex: 1;
    height: 56rpx;
    line-height: 56rpx;
    font-size: 22rpx;
    border-radius: 28rpx;
    border: none;
    font-weight: 500;
    background: #f5f5f5;
    color: #666;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .btn-text {
      font-size: 26rpx;
    }
    
    &:active {
      opacity: 0.9;
      transform: scale(0.98);
    }
  }
  
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

.filter-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
  
  .filter-panel {
    width: 100%;
    background: #fff;
    border-radius: 32rpx 32rpx 0 0;
    padding: 32rpx;
    
    .filter-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32rpx;
      
      .filter-title {
        font-size: 32rpx;
        font-weight: 600;
      }
      
      .filter-close {
        font-size: 36rpx;
        color: #999;
        padding: 10rpx;
      }
    }
    
    .filter-section {
      margin-bottom: 32rpx;
      
      .filter-label {
        font-size: 28rpx;
        font-weight: 600;
        color: #333;
        margin-bottom: 16rpx;
      }
      
      .price-inputs {
        display: flex;
        align-items: center;
        gap: 16rpx;
        
        .price-input {
          flex: 1;
          height: 80rpx;
          line-height: 80rpx;
          background: #f8f9fa;
          border-radius: 12rpx;
          padding: 0 24rpx;
          font-size: 28rpx;
          color: #333;
        }
        
        .price-separator {
          font-size: 28rpx;
          color: #999;
        }
      }
    }
    
    .filter-actions {
      display: flex;
      gap: 16rpx;
      
      .reset-btn, .confirm-btn {
        flex: 1;
        height: 88rpx;
        line-height: 88rpx;
        font-size: 30rpx;
        font-weight: 600;
        border-radius: 44rpx;
        border: none;
      }
      
      .reset-btn {
        background: #f5f5f5;
        color: #666;
      }
      
      .confirm-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #fff;
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
</style>

