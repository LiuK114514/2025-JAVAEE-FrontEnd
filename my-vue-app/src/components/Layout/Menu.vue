<script setup>
import {ref} from "vue";
import { menuWidthStore } from "../../stores/menu.js";
const menuStore = menuWidthStore()

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
        default-active="1"
        text-color="rgba(255, 255, 255, 0.85)"

    >
      <el-menu-item index="1">
        <el-icon :size="40"><Tickets /></el-icon>
        <span>发布考试</span>
      </el-menu-item>

      <el-menu-item index="2">
        <el-icon :size="40"><Tickets /></el-icon>
        <span>参与考试</span>
      </el-menu-item>

      <el-sub-menu index="3">
        <template #title>
          <el-icon :size="40"><Tickets /></el-icon>
          <span>查看试卷</span>
        </template>
        <el-menu-item index="3-1">我发布的</el-menu-item>
        <el-menu-item index="3-2">我参与的</el-menu-item>
      </el-sub-menu>


      <el-menu-item index="4">
        <el-icon :size="40"><Document /></el-icon>
        <span>练习中心</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<style scoped>
.sidebar-container {
  height: 100vh;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  box-shadow: 2px 0 8px rgba(102, 126, 234, 0.15);
  overflow-y: auto;
  overflow-x: hidden;
  margin-top: 10px;
  padding: 20px 0;
  transition: width 0.3s ease;
  position: fixed;
}

/*欢迎用户区域*/
.sidebar-user {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 10px 10px 10px;
  margin: 10px;
  transition: all 0.3s;
  background: linear-gradient(135deg, #8e7cc3, #c5a4e0);
  border-radius: 15%;

}
.user-info {
  display: flex;
  flex-direction: column;
  color: #fff;
}

.user-name {
  font-weight: 600;
  font-size: 20px;
  margin: 0;
}


/* 折叠状态下隐藏文字 */
:deep(.el-menu--collapse) .sidebar-user .user-info {
  display: none;
}
/* 折叠控制箭头 */
.collapse-toggle {
  position: absolute;
  right: -12px;
  bottom: 40%;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 2px solid white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
  transition: all 0.3s;
  z-index: 10;
}

.collapse-toggle:hover {
  transform: scale(1.15);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.5);
}

.collapse-toggle:active {
  transform: scale(0.95);
}

.arrow-icon {
  color: white;
  font-size: 24px;
  transition: transform 0.3s;
}


/* 自定义滚动条 */
.sidebar-container::-webkit-scrollbar {
  width: 6px;
}

.sidebar-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.sidebar-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

.sidebar-container::-webkit-scrollbar-track {
  background: transparent;
}

/* 菜单整体样式 */
.sidebar-menu {
  border: none;
  background: transparent;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 240px;
}

/* 一级菜单项 */
:deep(.el-menu-item) {
  margin: 20px 12px;
  border-radius: 10px;
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
  background: rgba(255, 255, 255, 0.25) !important;
  color: #ffffff !important;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 折叠状态下的菜单项 */
:deep(.el-menu--collapse .el-menu-item) {
  margin: 20px 12px;
  padding: 0 !important;
  text-align: center;
}

/* 子菜单 */
:deep(.el-sub-menu) {
  margin: 4px 12px;
}

:deep(.el-sub-menu__title) {
  border-radius: 10px;
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
  color: #ffffff !important;
}

/* 折叠状态下的子菜单 */
:deep(.el-menu--collapse .el-sub-menu) {
  margin: 4px 12px;
}

:deep(.el-menu--collapse .el-sub-menu__title) {
  padding: 0 !important;
  text-align: center;
}

/* 子菜单图标 */
:deep(.el-sub-menu__icon-arrow) {
  color: rgba(255, 255, 255, 0.85);
}

/* 子菜单展开的背景 */
:deep(.el-menu--inline) {
  background: rgba(0, 0, 0, 0.1) !important;
  border-radius: 10px;
  margin: 4px 0;
  padding: 4px 0;
}

:deep(.el-menu--inline .el-menu-item) {
  margin: 2px 8px;
  padding-left: 48px !important;
  height: 42px;
  line-height: 42px;
  min-width: auto;
}

:deep(.el-menu--inline .el-menu-item:hover) {
  background: rgba(255, 255, 255, 0.1) !important;
}

:deep(.el-menu--inline .el-menu-item.is-active) {
  background: rgba(255, 255, 255, 0.2) !important;
  font-weight: 600;
}

/* 图标样式 */
:deep(.el-icon) {
  font-size: 26px;
  margin-right: 8px;
  color: rgba(255, 255, 255, 0.9);
}

:deep(.el-menu-item.is-active .el-icon) {
  color: #ffffff;
}

/* 折叠状态下的图标 */
:deep(.el-menu--collapse .el-icon) {
  margin-right: 0;
}

/* 禁用状态 */
:deep(.el-menu-item.is-disabled) {
  opacity: 0.4;
  cursor: not-allowed;
}

/* 折叠时的弹出菜单样式 */
:deep(.el-menu--popup) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  border: none !important;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3) !important;
}

:deep(.el-menu--popup .el-menu-item) {
  background: transparent !important;
  color: rgba(255, 255, 255, 0.85) !important;
}

:deep(.el-menu--popup .el-menu-item:hover) {
  background: rgba(255, 255, 255, 0.15) !important;
  color: #ffffff !important;
}

:deep(.el-menu--popup .el-menu-item.is-active) {
  background: rgba(255, 255, 255, 0.25) !important;
  color: #ffffff !important;
}
</style>