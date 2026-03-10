const getBaseUrl = () => {
  if (import.meta.env.PROD) {
    return 'https://your-backend-api.com/api'
  }
  return 'http://localhost:3001/api'
}

export const BASE_URL = getBaseUrl()
