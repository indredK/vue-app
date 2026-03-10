const BASE_URL = '/api';

const request = (url: string, options: any = {}) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}${url}`,
      ...options,
      success: (res: any) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          reject(res);
        }
      },
      fail: (err: any) => {
        reject(err);
      }
    });
  });
};

export const goodsApi = {
  getList: () => request('/goods'),
  getById: (id: number) => request(`/goods/${id}`),
  getBatch: (ids: number[]) => request(`/goods/batch/${ids.join(',')}`)
};

export const userApi = {
  getInfo: (id: number = 1) => request(`/users/${id}`),
  update: (id: number, data: any) => request(`/users/${id}`, {
    method: 'PUT',
    data
  })
};

export const cartApi = {
  getList: (userId: number = 1) => request(`/cart/${userId}`),
  add: (data: any) => request('/cart', {
    method: 'POST',
    data
  }),
  update: (id: number, data: any) => request(`/cart/${id}`, {
    method: 'PUT',
    data
  }),
  remove: (id: number) => request(`/cart/${id}`, {
    method: 'DELETE'
  }),
  clear: (userId: number = 1) => request(`/cart/clear/${userId}`, {
    method: 'DELETE'
  })
};

export const orderApi = {
  getList: (userId: number = 1) => request(`/orders/${userId}`),
  getDetail: (id: number) => request(`/orders/detail/${id}`),
  create: (data: any) => request('/orders', {
    method: 'POST',
    data
  }),
  updateStatus: (id: number, status: string) => request(`/orders/${id}/status`, {
    method: 'PUT',
    data: { status }
  })
};

export default {
  goods: goodsApi,
  user: userApi,
  cart: cartApi,
  order: orderApi
};
