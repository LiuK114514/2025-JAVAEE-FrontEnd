<script setup>
import loginRegister from './pages/loginRegister/loginRegister.vue'
import Layout from "./components/Layout/layout.vue";
import router from './router/router';
import {useUserStore} from "./stores/userStore.js";
import {onMounted} from "vue";
// 页面刷新时初始化用户信息

onMounted(() => {
  const userStore = useUserStore()
  userStore.initFromLocal()
})
</script>

<template>
<!--  <login-register ></login-register>-->
  <router-view></router-view>
</template>

<style scoped>

</style>
