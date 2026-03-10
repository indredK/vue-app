const getBaseUrl = () => {
  if (import.meta.env.PROD) {
    return 'https://vue-app-backend-1olu.onrender.com/api'
  }
  return 'http://localhost:3001/api'
}

export const BASE_URL = getBaseUrl()
