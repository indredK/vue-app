<script setup lang="ts">
import { ref, computed } from 'vue'
import { goodsList, type Goods } from '@/mock'

const compareList = ref<Goods[]>([
  goodsList[0],
  goodsList[1],
  goodsList[3],
  goodsList[4],
])

const showSelector = ref(false)

const paramLabels = [
  { key: 'name', label: '商品名称', isImage: false },
  { key: 'image', label: '商品图片', isImage: true },
  { key: 'price', label: '价格', isHighlight: 'price' },
  { key: 'sales', label: '销量', isHighlight: 'sales' },
  { key: 'brand', label: '品牌' },
  { key: 'model', label: '型号' },
  { key: 'storage', label: '存储' },
  { key: 'color', label: '颜色' },
  { key: 'warranty', label: '保修' },
]

const getPriceScore = (price: number) => {
  const prices = goodsList.map(g => g.price)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  return Math.round(((maxPrice - price) / (maxPrice - minPrice)) * 100)
}

const getSalesScore = (sales: number) => {
  const salesList = goodsList.map(g => g.sales)
  const minSales = Math.min(...salesList)
  const maxSales = Math.max(...salesList)
  return Math.round(((sales - minSales) / (maxSales - minSales)) * 100)
}

const getValueScore = (goods: Goods) => {
  const priceScore = getPriceScore(goods.price)
  const salesScore = getSalesScore(goods.sales)
  return Math.round((priceScore + salesScore) / 2)
}

const getBestValue = computed(() => {
  if (compareList.value.length === 0) return null
  return compareList.value.reduce((best, item) => {
    return getValueScore(item) > getValueScore(best) ? item : best
  }, compareList.value[0])
})

const getBestPrice = computed(() => {
  if (compareList.value.length === 0) return null
  return compareList.value.reduce((best, item) => {
    return item.price < best.price ? item : best
  }, compareList.value[0])
})

const getBestSales = computed(() => {
  if (compareList.value.length === 0) return null
  return compareList.value.reduce((best, item) => {
    return item.sales > best.sales ? item : best
  }, compareList.value[0])
})

const removeItem = (id: number) => {
  const index = compareList.value.findIndex(item => item.id === id)
  if (index > -1) {
    compareList.value.splice(index, 1)
  }
}

const toggleGoods = (goods: Goods) => {
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

const isSelected = (id: number) => {
  return compareList.value.some(item => item.id === id)
}

const addToCart = (goods: Goods) => {
  uni.showToast({ title: '已加入购物车', icon: 'success' })
}

const goBack = () => {
  uni.navigateBack()
}

const getCellClass = (item: Goods, paramKey: string) => {
  if (paramKey === 'price' && getBestPrice.value && item.id === getBestPrice.value.id) {
    return 'best-price'
  }
  if (paramKey === 'sales' && getBestSales.value && item.id === getBestSales.value.id) {
    return 'best-sales'
  }
  return ''
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
      <text class="back-btn" @click="goBack">‹</text>
      <view class="header-center">
        <text class="title">产品对比</text>
        <text class="subtitle">{{ compareList.length }} 个商品</text>
      </view>
    </view>
    
    <view v-if="compareList.length === 0" class="empty-state">
      <view class="empty-illustration">
        <text class="empty-icon">⚖️</text>
        <view class="empty-glow"></view>
      </view>
      <text class="empty-title">暂无对比商品</text>
      <text class="empty-desc">请选择商品进行对比分析</text>
      <view class="empty-actions">
        <view class="select-goods-btn" @click="showSelector = true">选择商品</view>
      </view>
    </view>
    
    <view v-else class="compare-content">
      <view class="selector-bar" @click="showSelector = true">
        <text class="selector-text">+ 添加商品对比 ({{ compareList.length }}/4)</text>
      </view>
      
      <view class="analysis-card">
        <view class="analysis-header">
          <text class="analysis-icon">📊</text>
          <text class="analysis-title">综合分析</text>
        </view>
        <view class="analysis-grid">
          <view class="analysis-item">
            <view class="item-icon">💰</view>
            <view class="item-label">最低价</view>
            <view class="item-value">{{ getBestPrice?.name }}</view>
            <view class="item-price">¥{{ getBestPrice?.price }}</view>
          </view>
          <view class="analysis-item">
            <view class="item-icon">🔥</view>
            <view class="item-label">销量冠军</view>
            <view class="item-value">{{ getBestSales?.name }}</view>
            <view class="item-sales">{{ getBestSales?.sales }} 件</view>
          </view>
          <view class="analysis-item winner">
            <view class="item-icon">🏆</view>
            <view class="item-label">性价比最高</view>
            <view class="item-value">{{ getBestValue?.name }}</view>
            <view class="item-score">{{ getValueScore(getBestValue!) }} 分</view>
          </view>
        </view>
      </view>
      
      <view class="compare-table">
        <view class="table-header">
          <view class="param-label">参数</view>
          <view v-for="item in compareList" :key="item.id" class="goods-col">
            <image :src="item.image" class="col-img" mode="aspectFill" />
            <text class="col-name">{{ item.name }}</text>
            <view class="col-score">
              <text class="score-val">{{ getValueScore(item) }}</text>
              <text class="score-level" :class="'level-' + getValueLevel(getValueScore(item))">{{ getValueLevel(getValueScore(item)) }}</text>
            </view>
            <text class="remove-btn" @click="removeItem(item.id)">删除</text>
          </view>
        </view>
        
        <view 
          v-for="param in paramLabels" 
          :key="param.key" 
          class="table-row"
          :class="{ 'highlight-row': param.isHighlight }"
        >
          <view class="row-label">{{ param.label }}</view>
          <view 
            v-for="item in compareList" 
            :key="item.id" 
            class="row-value"
            :class="getCellClass(item, param.key)"
          >
            <template v-if="param.isImage">
              <image :src="item.image" class="value-img" mode="aspectFill" />
            </template>
            <template v-else-if="param.isHighlight === 'price'">
              <text class="price-text">¥{{ item.price }}</text>
              <view v-if="getBestPrice && item.id === getBestPrice.id" class="best-badge">最低</view>
            </template>
            <template v-else-if="param.isHighlight === 'sales'">
              <text class="sales-text">{{ item.sales }}</text>
              <view v-if="getBestSales && item.id === getBestSales.id" class="best-badge">最高</view>
            </template>
            <template v-else-if="param.key === 'name'">
              <text class="goods-name">{{ item.name }}</text>
            </template>
            <template v-else>
              {{ item.specs[param.key as keyof typeof item.specs] }}
            </template>
          </view>
        </view>
        
        <view class="table-row score-row">
          <view class="row-label">性价比评分</view>
          <view 
            v-for="item in compareList" 
            :key="item.id" 
            class="row-value"
            :class="{ 'best-score': getBestValue && item.id === getBestValue.id }"
          >
            <view class="score-display">
              <text class="score-num">{{ getValueScore(item) }}</text>
              <text class="score-unit">分</text>
            </view>
            <view v-if="getBestValue && item.id === getBestValue.id" class="winner-badge">
              <text>🏆 推荐</text>
            </view>
          </view>
        </view>
        
        <view class="table-row action-row">
          <view class="row-label">操作</view>
          <view v-for="item in compareList" :key="item.id" class="row-value">
            <button class="cart-btn" @click="addToCart(item)">加入购物车</button>
          </view>
        </view>
      </view>
    </view>
    
    <view v-if="showSelector" class="selector-modal" @click="showSelector = false">
      <view class="selector-panel" @click.stop>
        <view class="panel-header">
          <text class="panel-title">选择商品</text>
          <text class="panel-close" @click="showSelector = false">✕</text>
        </view>
        <scroll-view scroll-y class="goods-list">
          <view 
            v-for="goods in goodsList" 
            :key="goods.id" 
            class="goods-item"
            :class="{ selected: isSelected(goods.id) }"
            @click="toggleGoods(goods)"
          >
            <image :src="goods.image" class="item-img" mode="aspectFill" />
            <view class="item-info">
              <text class="item-name">{{ goods.name }}</text>
              <text class="item-price">¥{{ goods.price }}</text>
            </view>
            <view class="item-check">
              <text v-if="isSelected(goods.id)">✓</text>
            </view>
          </view>
        </scroll-view>
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
  padding: 40rpx 32rpx 24rpx;
  background: linear-gradient(135deg, #ee0979 0%, #ff6a00 100%);
  
  .back-btn {
    font-size: 56rpx;
    color: #fff;
    font-weight: 300;
  }
  
  .header-center {
    text-align: center;
    
    .title {
      display: block;
      font-size: 36rpx;
      font-weight: bold;
      color: #fff;
    }
    
    .subtitle {
      display: block;
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.8);
      margin-top: 4rpx;
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 160rpx;
  
  .empty-illustration {
    position: relative;
    margin-bottom: 40rpx;
    
    .empty-icon {
      font-size: 140rpx;
      display: block;
    }
    
    .empty-glow {
      position: absolute;
      bottom: -20rpx;
      left: 50%;
      transform: translateX(-50%);
      width: 100rpx;
      height: 20rpx;
      background: radial-gradient(ellipse, rgba(238, 9, 121, 0.3) 0%, transparent 70%);
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
  
  .empty-actions {
    margin-top: 48rpx;
    
    .select-goods-btn {
      width: 280rpx;
      height: 80rpx;
      line-height: 80rpx;
      background: linear-gradient(135deg, #ee0979 0%, #ff6a00 100%);
      color: #fff;
      font-size: 30rpx;
      font-weight: 500;
      border-radius: 40rpx;
      text-align: center;
      box-shadow: 0 8rpx 24rpx rgba(238, 9, 121, 0.3);
    }
  }
}

.compare-content {
  padding: 24rpx;
}

.selector-bar {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  text-align: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
  
  .selector-text {
    color: #ee0979;
    font-size: 28rpx;
    font-weight: 500;
  }
}

.analysis-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 28rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.06);
  
  .analysis-header {
    display: flex;
    align-items: center;
    margin-bottom: 24rpx;
    
    .analysis-icon {
      font-size: 36rpx;
      margin-right: 12rpx;
    }
    
    .analysis-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #212529;
    }
  }
  
  .analysis-grid {
    display: flex;
    gap: 16rpx;
  }
  
  .analysis-item {
    flex: 1;
    background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
    border-radius: 16rpx;
    padding: 20rpx;
    text-align: center;
    
    &.winner {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      
      .item-icon, .item-label, .item-value, .item-score {
        color: #fff;
      }
    }
    
    .item-icon {
      font-size: 36rpx;
    }
    
    .item-label {
      font-size: 22rpx;
      color: #868e96;
      margin-top: 8rpx;
    }
    
    .item-value {
      font-size: 22rpx;
      font-weight: 600;
      color: #212529;
      margin-top: 8rpx;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .item-price, .item-sales {
      font-size: 28rpx;
      font-weight: bold;
      color: #ff4757;
      margin-top: 6rpx;
    }
    
    .item-score {
      font-size: 32rpx;
      font-weight: bold;
      color: #fff700;
      margin-top: 6rpx;
    }
  }
}

.compare-table {
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.06);
}

.table-header {
  display: flex;
  background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 24rpx 0;
  
  .param-label {
    width: 160rpx;
    padding: 0 16rpx;
    font-size: 26rpx;
    color: #868e96;
    display: flex;
    align-items: center;
    font-weight: 500;
  }
  
  .goods-col {
    flex: 1;
    text-align: center;
    
    .col-img {
      width: 100rpx;
      height: 100rpx;
      border-radius: 12rpx;
    }
    
    .col-name {
      display: block;
      font-size: 22rpx;
      font-weight: 600;
      color: #212529;
      margin-top: 10rpx;
      padding: 0 10rpx;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .col-score {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8rpx;
      margin-top: 8rpx;
      
      .score-val {
        font-size: 26rpx;
        font-weight: bold;
        color: #667eea;
      }
      
      .score-level {
        font-size: 20rpx;
        padding: 4rpx 8rpx;
        border-radius: 8rpx;
        font-weight: 600;
        
        &.level-A { background: #d4edda; color: #155724; }
        &.level-B { background: #cce5ff; color: #004085; }
        &.level-C { background: #fff3cd; color: #856404; }
        &.level-D { background: #f8d7da; color: #721c24; }
      }
    }
    
    .remove-btn {
      display: block;
      font-size: 22rpx;
      color: #ff6b6b;
      margin-top: 8rpx;
    }
  }
}

.table-row {
  display: flex;
  border-bottom: 1rpx solid #f1f3f5;
  
  &.highlight-row {
    background: #fffbf0;
  }
  
  .row-label {
    width: 160rpx;
    padding: 0 16rpx;
    font-size: 24rpx;
    color: #868e96;
    display: flex;
    align-items: center;
    background: #fafafa;
    font-weight: 500;
  }
  
  .row-value {
    flex: 1;
    padding: 20rpx 12rpx;
    text-align: center;
    font-size: 24rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    
    &.best-price, &.best-sales {
      background: #fffbe6;
    }
    
    .price-text {
      color: #ff4757;
      font-weight: 800;
      font-size: 28rpx;
    }
    
    .sales-text {
      font-weight: 600;
      color: #212529;
    }
    
    .best-badge {
      font-size: 20rpx;
      color: #faad14;
      margin-left: 6rpx;
      font-weight: 600;
    }
    
    .goods-name {
      font-weight: 500;
    }
    
    .value-img {
      width: 70rpx;
      height: 70rpx;
      border-radius: 8rpx;
    }
  }
  
  &.score-row .row-value {
    background: linear-gradient(180deg, #f0f5ff 0%, #e6eeff 100%);
    
    &.best-score {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      
      .score-display {
        .score-num, .score-unit {
          color: #fff;
        }
      }
    }
    
    .score-display {
      display: flex;
      align-items: baseline;
      
      .score-num {
        font-size: 40rpx;
        font-weight: 800;
        color: #667eea;
      }
      
      .score-unit {
        font-size: 24rpx;
        color: #667eea;
        margin-left: 4rpx;
      }
    }
    
    .winner-badge {
      margin-top: 8rpx;
      font-size: 22rpx;
      color: #fff700;
    }
  }
  
  &.action-row .row-value {
    padding: 16rpx;
    
    .cart-btn {
      width: 100%;
      height: 56rpx;
      line-height: 56rpx;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      font-size: 22rpx;
      font-weight: 500;
      border-radius: 28rpx;
    }
  }
}

.selector-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
  
  .selector-panel {
    width: 100%;
    max-height: 80vh;
    background: #fff;
    border-radius: 32rpx 32rpx 0 0;
    
    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 32rpx;
      border-bottom: 1rpx solid #f0f0f0;
      
      .panel-title {
        font-size: 32rpx;
        font-weight: 600;
      }
      
      .panel-close {
        font-size: 36rpx;
        color: #999;
        padding: 10rpx;
      }
    }
    
    .goods-list {
      max-height: 60vh;
      padding: 24rpx;
      
      .goods-item {
        display: flex;
        align-items: center;
        padding: 20rpx;
        border-radius: 16rpx;
        margin-bottom: 16rpx;
        background: #f8f9fa;
        
        &.selected {
          background: #fff5f8;
          border: 2rpx solid #ee0979;
        }
        
        .item-img {
          width: 120rpx;
          height: 120rpx;
          border-radius: 12rpx;
        }
        
        .item-info {
          flex: 1;
          margin-left: 20rpx;
          
          .item-name {
            display: block;
            font-size: 28rpx;
            font-weight: 500;
            color: #212529;
          }
          
          .item-price {
            display: block;
            font-size: 32rpx;
            font-weight: bold;
            color: #ff4757;
            margin-top: 8rpx;
          }
        }
        
        .item-check {
          width: 48rpx;
          height: 48rpx;
          border-radius: 50%;
          border: 2rpx solid #dee2e6;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28rpx;
          color: #ee0979;
          font-weight: bold;
        }
      }
    }
  }
}
</style>
