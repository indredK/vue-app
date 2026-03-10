export interface Goods {
  id: number
  categoryId: number
  name: string
  price: number
  originalPrice?: number
  image: string
  images?: string[]
  sales: number
  stock: number
  specs: {
    brand: string
    model: string
    storage: string
    color: string
    warranty: string
  }
  description: string
  tags: string[]
  status: string
  isHot?: boolean
  isNew?: boolean
  isRecommend?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface Category {
  id: number
  name: string
  parentId: number
  sortOrder: number
  icon: string
  status: string
  children?: Category[]
}

export interface User {
  id: number
  username: string
  nickname: string
  phone: string
  email: string
  roleId: number
  points: number
  avatar: string
}

export interface CartItem {
  id: number
  userId: number
  goodsId: number
  name: string
  price: number
  image: string
  quantity: number
  selected: boolean
  createdAt?: string
  updatedAt?: string
}

export interface OrderItem {
  id: number
  orderId: number
  goodsId: number
  name: string
  price: number
  image: string
  quantity: number
}

export interface Order {
  id: number
  userId: number
  orderNo: string
  addressId: number
  totalAmount: number
  discountAmount: number
  pointsUsed: number
  pointsDiscount: number
  finalAmount: number
  status: string
  statusLabel: string
  paymentStatus: string
  paymentStatusLabel: string
  paymentMethod: string
  paymentTime?: string
  shippingTime?: string
  receivedTime?: string
  cancelReason: string
  remark: string
  createdAt: string
  updatedAt: string
  items: OrderItem[]
  history?: OrderHistory[]
}

export interface OrderHistory {
  id: number
  orderId: number
  status: string
  remark: string
  createdAt: string
}

export interface Address {
  id: number
  userId: number
  receiverName: string
  receiverPhone: string
  province: string
  city: string
  district: string
  detailAddress: string
  postalCode: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export interface Review {
  id: number
  userId: number
  goodsId: number
  orderId: number
  rating: number
  content: string
  images: string[]
  reply: string
  replyAt?: string
  status: string
  createdAt: string
  updatedAt: string
  nickname?: string
  avatar?: string
}

export interface ReviewStats {
  total: number
  averageRating: number
  fiveStar: number
  fourStar: number
  threeStar: number
  twoStar: number
  oneStar: number
}

export interface Favorite {
  id: number
  userId: number
  goodsId: number
  name: string
  price: number
  image: string
  sales: number
  stock: number
  status: string
  createdAt: string
}

export interface PointRecord {
  id: number
  userId: number
  type: string
  amount: number
  balance: number
  description: string
  relatedType: string
  relatedId: number
  createdAt: string
}

export interface PointBalance {
  balance: number
  stats: {
    earnCount: number
    spendCount: number
    totalEarned: number
    totalSpent: number
  }
}

export interface Notification {
  id: number
  userId: number
  type: string
  title: string
  content: string
  data?: any
  isRead: boolean
  readAt?: string
  createdAt: string
}

export interface PaymentMethod {
  id: number
  name: string
  code: string
  icon: string
  status: string
  sortOrder: number
}
