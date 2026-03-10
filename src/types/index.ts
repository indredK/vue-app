export interface Goods {
  id: number
  name: string
  price: number
  image: string
  sales: number
  specs: {
    brand: string
    model: string
    storage: string
    color: string
    warranty: string
  }
  description: string
  tags: string[]
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
}
