const BASE_URL = 'http://localhost:3001/api'

const getToken = () => {
  return uni.getStorageSync('token') || ''
}

const request = (url: string, options: any = {}) => {
  const token = getToken()
  
  let requestUrl = `${BASE_URL}${url}`
  
  if (options.params && Object.keys(options.params).length > 0) {
    const queryString = Object.keys(options.params)
      .map(key => {
        const value = options.params[key]
        if (value !== undefined && value !== null && value !== '') {
          return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
        }
        return null
      })
      .filter(Boolean)
      .join('&')
    
    if (queryString) {
      requestUrl += `?${queryString}`
    }
  }
  
  return new Promise((resolve, reject) => {
    uni.request({
      url: requestUrl,
      header: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.header
      },
      ...options,
      success: (res: any) => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve(res.data)
        } else if (res.statusCode === 401) {
          uni.removeStorageSync('token')
          uni.removeStorageSync('user')
          uni.showToast({ title: '登录已过期', icon: 'none' })
          setTimeout(() => {
            uni.reLaunch({ url: '/pages/auth/login' })
          }, 1500)
          reject(res)
        } else {
          reject(res)
        }
      },
      fail: (err: any) => {
        reject(err)
      }
    })
  })
}

export const goodsApi = {
  getList: (params?: any) => request('/goods', { params }),
  getById: (id: number) => request(`/goods/${id}`),
  getBatch: (ids: number[]) => request(`/goods/batch/${ids.join(',')}`),
  getHot: (limit = 10) => request('/goods/hot', { params: { limit } }),
  getNew: (limit = 10) => request('/goods/new', { params: { limit } }),
  getRecommend: (limit = 10) => request('/goods/recommend', { params: { limit } }),
  create: (data: any) => request('/goods', { method: 'POST', data }),
  update: (id: number, data: any) => request(`/goods/${id}`, { method: 'PUT', data }),
  delete: (id: number) => request(`/goods/${id}`, { method: 'DELETE' }),
  updateStock: (id: number, data: any) => request(`/goods/${id}/stock`, { method: 'PUT', data })
}

export const categoryApi = {
  getTree: () => request('/categories'),
  getFlat: () => request('/categories/flat'),
  getById: (id: number) => request(`/categories/${id}`),
  getGoods: (id: number, params?: any) => request(`/categories/${id}/goods`, { params }),
  create: (data: any) => request('/categories', { method: 'POST', data }),
  update: (id: number, data: any) => request(`/categories/${id}`, { method: 'PUT', data }),
  delete: (id: number) => request(`/categories/${id}`, { method: 'DELETE' })
}

export const authApi = {
  register: (data: any) => request('/auth/register', { method: 'POST', data }),
  login: (data: any) => request('/auth/login', { method: 'POST', data })
}

export const userApi = {
  getInfo: (id: number = 1) => request(`/users/${id}`),
  update: (id: number, data: any) => request(`/users/${id}`, { method: 'PUT', data })
}

export const cartApi = {
  getList: (userId: number = 1) => request(`/cart/user/${userId}`),
  add: (data: any) => request('/cart', { method: 'POST', data }),
  update: (id: number, data: any) => request(`/cart/${id}`, { method: 'PUT', data }),
  remove: (id: number) => request(`/cart/${id}`, { method: 'DELETE' }),
  clear: (userId: number = 1) => request(`/cart/clear/${userId}`, { method: 'DELETE' }),
  selectAll: (userId: number, selected: boolean) => request(`/cart/select-all/${userId}`, { method: 'PUT', data: { selected } })
}

export const orderApi = {
  getList: (userId: number = 1) => request(`/orders/user/${userId}`),
  getDetail: (id: number) => request(`/orders/detail/${id}`),
  create: (data: any) => request('/orders', { method: 'POST', data }),
  updateStatus: (id: number, data: any) => request(`/orders/${id}/status`, { method: 'PUT', data }),
  updatePaymentStatus: (id: number, data: any) => request(`/orders/${id}/payment-status`, { method: 'PUT', data }),
  cancel: (id: number, data: any) => request(`/orders/${id}`, { method: 'DELETE', data })
}

export const paymentApi = {
  getMethods: () => request('/payments/methods'),
  create: (data: any) => request('/payments/create', { method: 'POST', data }),
  getStatus: (paymentId: number) => request(`/payments/status/${paymentId}`)
}

export const reviewApi = {
  getGoodsReviews: (goodsId: number, params?: any) => request(`/reviews/goods/${goodsId}`, { params }),
  getUserReviews: (userId: number) => request(`/reviews/user/${userId}`),
  create: (data: any) => request('/reviews', { method: 'POST', data }),
  update: (id: number, data: any) => request(`/reviews/${id}`, { method: 'PUT', data }),
  delete: (id: number) => request(`/reviews/${id}`, { method: 'DELETE' }),
  reply: (id: number, data: any) => request(`/reviews/${id}/reply`, { method: 'PUT', data }),
  updateStatus: (id: number, data: any) => request(`/reviews/${id}/status`, { method: 'PUT', data })
}

export const favoriteApi = {
  getList: (userId: number = 1) => request(`/favorites/user/${userId}`),
  check: (userId: number, goodsId: number) => request(`/favorites/check/${userId}/${goodsId}`),
  add: (data: any) => request('/favorites', { method: 'POST', data }),
  delete: (id: number) => request(`/favorites/${id}`, { method: 'DELETE' }),
  cancel: (userId: number, goodsId: number) => request(`/favorites/user/${userId}/goods/${goodsId}`, { method: 'DELETE' })
}

export const addressApi = {
  getList: (userId: number = 1) => request(`/addresses/user/${userId}`),
  getById: (id: number) => request(`/addresses/${id}`),
  create: (data: any) => request('/addresses', { method: 'POST', data }),
  update: (id: number, data: any) => request(`/addresses/${id}`, { method: 'PUT', data }),
  delete: (id: number) => request(`/addresses/${id}`, { method: 'DELETE' }),
  setDefault: (id: number) => request(`/addresses/${id}/default`, { method: 'PUT' })
}

export const pointsApi = {
  getRecords: (userId: number = 1) => request(`/points/user/${userId}`),
  getBalance: (userId: number = 1) => request(`/points/balance/${userId}`),
  earn: (data: any) => request('/points/earn', { method: 'POST', data }),
  spend: (data: any) => request('/points/spend', { method: 'POST', data }),
  refund: (data: any) => request('/points/refund', { method: 'POST', data })
}

export const notificationApi = {
  getList: (userId: number = 1, params?: any) => request(`/notifications/user/${userId}`, { params }),
  getUnreadCount: (userId: number = 1) => request(`/notifications/unread-count/${userId}`),
  getById: (id: number) => request(`/notifications/${id}`),
  create: (data: any) => request('/notifications', { method: 'POST', data }),
  markRead: (id: number) => request(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllRead: (userId: number = 1) => request(`/notifications/read-all/${userId}`, { method: 'PUT' }),
  delete: (id: number) => request(`/notifications/${id}`, { method: 'DELETE' })
}

export const statisticsApi = {
  getOverview: () => request('/statistics/overview'),
  getSales: (days = 30) => request('/statistics/sales', { params: { days } }),
  getOrders: () => request('/statistics/orders'),
  getGoods: () => request('/statistics/goods'),
  getUsers: () => request('/statistics/users')
}

export const logsApi = {
  getList: (params?: any) => request('/logs', { params }),
  getById: (id: number) => request(`/logs/${id}`),
  getStats: (days = 7) => request('/logs/stats/summary', { params: { days } }),
  cleanup: (data: any) => request('/logs/cleanup', { method: 'DELETE', data })
}

export default {
  goods: goodsApi,
  category: categoryApi,
  auth: authApi,
  user: userApi,
  cart: cartApi,
  order: orderApi,
  payment: paymentApi,
  review: reviewApi,
  favorite: favoriteApi,
  address: addressApi,
  points: pointsApi,
  notification: notificationApi,
  statistics: statisticsApi,
  logs: logsApi
}
