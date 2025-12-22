<script setup>
import {ref} from "vue";
import { useRouter,useRoute } from 'vue-router';
import { menuWidthStore } from "../../stores/menu.js";
const router = useRouter();
const route = useRoute();
const menuStore = menuWidthStore()
//点击跳转
const handleSelect =(index)=>{
  const item = menuStore.menuList.find(m => m.index === index)
  router.push(item.path)

}
//首页默认路由
const defaultActive=ref(
    route.path
)


</script>

<template>
  <div class="sidebar-container" :style="{ width: menuStore.menuWidth }">

    <div class="sidebar-user">
      <el-icon><Avatar /></el-icon>
      <div class="user-info" v-if="!menuStore.isCollapse">
        <p class="user-name">你好，刘康</p>
      </div>
    </div>

    <div class="collapse-toggle" @click="menuStore.handleMenuWidthChange()">
      <el-icon class="arrow-icon" >
        <fold v-if="menuStore.isCollapse === false"/>
        <expand v-else/>
      </el-icon>

    </div>

    <el-menu
        unique-opened
        :collapse="menuStore.isCollapse"
        :collapse-transition="false"
        active-text-color="#ffffff"
        background-color="transparent"
        class="sidebar-menu"
        :default-active="defaultActive"
        text-color="rgba(255, 255, 255, 0.85)"
        @select="handleSelect"
    >
      <el-menu-item index="1" >
        <el-icon :size="40"><Tickets /></el-icon>
        <span>每日一练</span>
      </el-menu-item>

      <el-menu-item index="2">
        <el-icon :size="40"><Memo /></el-icon>
        <span>发布考试</span>

      </el-menu-item>

      <el-menu-item index="3">
        <el-icon :size="40"><Document /></el-icon>
        <span>参与考试</span>
      </el-menu-item>

      <el-sub-menu index="4">
        <template #title>
          <el-icon :size="40"><TrendCharts /></el-icon>
          <span>查看试卷</span>
        </template>
        <el-menu-item index="4-1">我发布的</el-menu-item>
        <el-menu-item index="4-2">我参与的</el-menu-item>
      </el-sub-menu>



    </el-menu>
  </div>
</template>

<style scoped>
.sidebar-container {
  height: 100vh;
  background: #1e3c72; /* 纯色 */
  box-shadow: 2px 0 10px rgba(30, 60, 114, 0.35);
  overflow-y: auto;
  overflow-x: hidden;
  margin-top: 10px;
  padding: 20px 0;
  transition: width 0.3s ease;
  position: fixed;
}

/* 用户区域 */
.sidebar-user {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  margin: 12px;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 12px;
  transition: all 0.3s;
}

.sidebar-user:hover {
  background: rgba(255, 255, 255, 0.28);
}

.user-info {
  display: flex;
  flex-direction: column;
  color: #ffffff;
}

.user-name {
  font-weight: 600;
  font-size: 18px;
}

/* 折叠隐藏文字 */
:deep(.el-menu--collapse) .sidebar-user .user-info {
  display: none;
}

/* 折叠按钮 */
.collapse-toggle {
  position: absolute;
  right: -14px;
  bottom: 40%;
  width: 42px;
  height: 42px;
  background: #1e3c72; /* 纯色 */
  border: 2px solid #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(30, 60, 114, 0.45);
}

.arrow-icon {
  color: #ffffff;
  font-size: 22px;
}

/* 滚动条 */
.sidebar-container::-webkit-scrollbar {
  width: 6px;
}

.sidebar-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.25);
  border-radius: 3px;
}

/* 菜单 */
.sidebar-menu {
  border: none;
  background: transparent;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 240px;
}

/* 一级菜单 */
:deep(.el-sub-menu .el-menu-item) {
 border-radius: 5px;
  margin: 17px 12px;
  padding-left: 5px !important;
  height: 48px;
  line-height: 48px;
  transition: all 0.2s;
  background: transparent;
  font-size: 15px !important;
}

:deep(.el-menu-item:hover) {
  background: rgba(255, 255, 255, 0.15) !important;
  color: #ffffff !important;
}

:deep(.el-menu-item.is-active) {
  background: rgba(42, 157, 143, 0.35) !important; /* 用青绿强调 */
  color: #ffffff !important;
  font-weight: 600;
}

/* 子菜单 */
:deep(.el-sub-menu) {
  margin: 4px 12px;
}
:deep(.el-sub-menu__title) {
  padding-left: 5px !important;
  height: 48px;
  line-height: 48px;
  transition: all 0.2s;
  background: transparent;
  color: rgba(255, 255, 255, 0.85) !important;
  font-size: 15px !important;

}

:deep(.el-sub-menu__title:hover) {
  background: rgba(255, 255, 255, 0.15) !important;
}

/* 子菜单展开区 */
:deep(.el-menu--inline) {
  padding-top: 2px;
  height: 150px;
  background: rgba(0, 0, 0, 0.15) !important;
  border-radius: 5px;

}

/* 图标 */
:deep(.el-icon) {
  font-size: 22px;
  color: rgba(255, 255, 255, 0.9);
}

/* 折叠弹出菜单 */
:deep(.el-menu--popup) {
  background: #1e3c72 !important;
  box-shadow: 0 6px 16px rgba(30, 60, 114, 0.35) !important;
}

</style>