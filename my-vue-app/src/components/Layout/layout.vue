<script setup>
import Header from './Header.vue'
import Menu from './Menu.vue'
import { menuWidthStore } from "../../stores/menu.js";
const menuStore = menuWidthStore()
import { computed } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
const isFullscreen = computed(() => route.meta.fullscreen === true)
</script>

<template>
  <el-container>
    <el-header v-if="!isFullscreen"  >
      <Header style="z-index: 100" ></Header>
    </el-header>
    <el-container>
        <el-aside v-if="!isFullscreen"  :width="menuStore.menuWidth">
          <Menu ></Menu>
        </el-aside>
        <el-main style=" background:#EBEDF0; ">
        <router-view></router-view>
        </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>


.el-main {
  height: calc(100vh - 60px);
}

</style>