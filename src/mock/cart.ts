export interface CartItem {
  id: number
  goodsId: number
  name: string
  price: number
  image: string
  quantity: number
  selected: boolean
}

export const cartList: CartItem[] = [
  { id: 1, goodsId: 1, name: 'iPhone 15 Pro', price: 7999, image: 'https://picsum.photos/400/400?random=1', quantity: 1, selected: true },
  { id: 2, goodsId: 3, name: 'AirPods Pro', price: 1999, image: 'https://picsum.photos/400/400?random=3', quantity: 2, selected: true },
  { id: 3, goodsId: 5, name: 'Apple Watch', price: 2999, image: 'https://picsum.photos/400/400?random=5', quantity: 1, selected: false },
]

export const getCartItems = (): CartItem[] => {
  return [...cartList]
}

export const addCartItem = (item: Omit<CartItem, 'id'>): CartItem => {
  const newItem: CartItem = {
    ...item,
    id: Date.now()
  }
  cartList.push(newItem)
  return newItem
}

export const removeCartItem = (id: number): boolean => {
  const index = cartList.findIndex(item => item.id === id)
  if (index > -1) {
    cartList.splice(index, 1)
    return true
  }
  return false
}

export const updateCartItemQuantity = (id: number, quantity: number): boolean => {
  const item = cartList.find(item => item.id === id)
  if (item) {
    item.quantity = quantity
    return true
  }
  return false
}

export const toggleCartItemSelected = (id: number): boolean => {
  const item = cartList.find(item => item.id === id)
  if (item) {
    item.selected = !item.selected
    return true
  }
  return false
}

export const clearCart = (): void => {
  cartList.length = 0
}
