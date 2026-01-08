import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
// import axios from 'axios'

export const useUserStore = defineStore('user', () => {
    const token = ref('')
    const userInfo = ref(null)
    const isLoggedIn = computed(() => !!token.value)
    const isAdmin=ref(false)

    // 设置用户信息（登录后调用）
    function setUser(userId, name, email, userToken) {
        token.value = userToken
        userInfo.value = { id: userId, name, email }

        // 保存到 localStorage
        localStorage.setItem('token', token.value)
        localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    }


    // 登出
    function resetUserInfo() {
        token.value = ''
        userInfo.value = null
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
    }


    // 初始化 store（刷新页面调用）
    function initFromLocal() {
        const localToken = localStorage.getItem('token')
        const localUserInfo = localStorage.getItem('userInfo')
        if (localToken && localUserInfo) {
            token.value = localToken
            userInfo.value = JSON.parse(localUserInfo)
        }
    }

    return {
        isAdmin,
        token,
        userInfo,
        isLoggedIn,
        setUser,
        resetUserInfo,
        initFromLocal
    }
})
