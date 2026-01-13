import axios from 'axios'

const api = axios.create({ baseURL: '/api', withCredentials: true })

let store = { access: localStorage.getItem('accessToken') || null }

export function setAccessToken(token){ 
  store.access = token
  if (token) {
    localStorage.setItem('accessToken', token)
  } else {
    localStorage.removeItem('accessToken')
  }
}

api.interceptors.request.use((config)=>{
  if (store.access) config.headers.Authorization = `Bearer ${store.access}`
  return config
})

api.interceptors.response.use((res)=>res, async (err)=>{
  const original = err.config
  if (err.response && err.response.status === 401 && !original._retry){
    original._retry = true
    try{
      const r = await api.post('/auth/refresh')
      const access = r.data.data.access
      setAccessToken(access)
      original.headers.Authorization = `Bearer ${access}`
      return api(original)
    }catch(e){
      throw e
    }
  }
  throw err
})

export default api
