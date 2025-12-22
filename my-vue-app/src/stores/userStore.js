import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
// import axios from 'axios'

export const useUserStore = defineStore('user', () => {
    const token = ref('')
    const userInfo = ref(null)
    const isLoggedIn = computed(() => !!token.value)

    // 解析 JWT payload
    function parseJWT(token) {
        try {
            const payload = token.split('.')[1]
            return JSON.parse(atob(payload))
        } catch (e) {
            console.error('JWT解析失败', e)
            return null
        }
    }

    // 设置用户信息（模拟后端返回）
    function setUserFromResponse(responseData) {
        token.value = responseData.token
        localStorage.setItem('token', responseData.token)
        // axios.defaults.headers.common['Authorization'] = `Bearer ${responseData.token}`

        const payload = parseJWT(responseData.token)
        userInfo.value = {
            id: responseData.id,
            name: responseData.name,
            userName: responseData.userName,
            role: payload?.role,
            userId: payload?.userId,
            exp: payload?.exp
        }
    }

    // 登出
    function logout() {
        token.value = ''
        userInfo.value = null
        localStorage.removeItem('token')
        // axios.defaults.headers.common['Authorization'] = ''
    }

    // 初始化（从 localStorage 或模拟数据）
    function initUser() {
        // // 尝试从 localStorage 恢复
        // const savedToken = localStorage.getItem('token')
        // if (savedToken) {
        //     token.value = savedToken
        //     // axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`
        //     const payload = parseJWT(savedToken)
        //     userInfo.value = {
        //         id: payload?.userId || null,
        //         name: '', // localStorage 没有 name 时可以空
        //         userName: payload?.username || '',
        //         role: payload?.role,
        //         exp: payload?.exp
        //     }
        // } else {
            // 模拟后端返回数据
            const mockResponse = {
                id: 2,
                name: "杨源",
                token: "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoxLCJ1c2VySWQiOjIsInVzZXJuYW1lIjoiMjg2Mzg0ODkxMUBxcS5jb20iLCJleHAiOjQ3NjU1MTA0NjZ9.puWPHiC6OM3965aRJ7S9sO3i8N2EAOcE4JfFFAQs0ig",
                userName: "2863848911@qq.com"
            }
            setUserFromResponse(mockResponse)
        // }
    }

    return {
        token,
        userInfo,
        isLoggedIn,
        setUserFromResponse,
        logout,
        initUser
    }
})
