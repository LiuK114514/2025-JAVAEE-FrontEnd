import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '../router/router.js'

// 创建axios实例
const service = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: 15000, // 请求超时时间
    headers: {
        'Content-Type': 'application/json;charset=utf-8'
    }
})

// 请求拦截器
service.interceptors.request.use(
    config => {
        // 在发送请求之前做些什么
        const token = localStorage.getItem('token')
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`
        }

        // 添加请求时间戳防止缓存
        if (config.method === 'get') {
            config.params = {
                ...config.params,
                _t: new Date().getTime()
            }
        }

        return config
    },
    error => {
        // 对请求错误做些什么
        console.error('请求配置错误:', error)
        return Promise.reject(error)
    }
)

// 响应拦截器
service.interceptors.response.use(
    response => {
        // 对响应数据做点什么
        const res = response.data

        // 根据后端接口规范调整
        if (res.code && res.code !== 200) {
            // 业务错误
            ElMessage({
                message: res.message || '请求失败',
                type: 'error',
                duration: 3000
            })

            // 处理特定的错误码
            if (res.code === 401) {
                // token过期，跳转到登录页
                localStorage.removeItem('token')
                router.push('/login')
            } else if (res.code === 403) {
                // 权限不足
                ElMessage.error('权限不足，无法访问')
            }

            return Promise.reject(new Error(res.message || '请求失败'))
        }

        return res.data || res
    },
    error => {
        // 对响应错误做点什么
        console.error('响应错误:', error)

        if (error.response) {
            // 请求已发送，服务器响应状态码不在2xx范围内
            const { status, data } = error.response

            switch (status) {
                case 400:
                    ElMessage.error(data.message || '请求参数错误')
                    break
                case 401:
                    ElMessage.error('登录已过期，请重新登录')
                    localStorage.removeItem('token')
                    router.push('/login')
                    break
                case 403:
                    ElMessage.error('权限不足，无法访问')
                    break
                case 404:
                    ElMessage.error('请求的资源不存在')
                    break
                case 500:
                    ElMessage.error('服务器内部错误')
                    break
                case 502:
                case 503:
                case 504:
                    ElMessage.error('服务器暂时不可用，请稍后重试')
                    break
                default:
                    ElMessage.error(`请求失败: ${data.message || '未知错误'}`)
            }
        } else if (error.request) {
            // 请求已发送但没有收到响应
            ElMessage.error('网络连接失败，请检查网络设置')
        } else {
            // 请求配置错误
            ElMessage.error('请求配置错误')
        }

        return Promise.reject(error)
    }
)

// 封装常用的请求方法
const request = {
    get(url, params = {}) {
        return service.get(url, { params })
    },

    post(url, data = {}) {
        return service.post(url, data)
    },

    put(url, data = {}) {
        return service.put(url, data)
    },

    delete(url, params = {}) {
        return service.delete(url, { params })
    },

    patch(url, data = {}) {
        return service.patch(url, data)
    },

    // 文件上传
    upload(url, formData) {
        return service.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    }
}

export default request