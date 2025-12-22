<template>
  <Layout />

    <!-- 注意：根据之前讨论，这里应该移除 <Layout /> -->
    <div class="admin-dashboard">
      <!-- 顶部导航 -->
      <div class="admin-header">
        <div class="header-content">
          <h1><el-icon><Monitor /></el-icon> 系统监控与管理</h1>
          <div class="header-actions">
            <el-button type="primary" :icon="Refresh" @click="refreshAll">
              刷新全部
            </el-button>
            <el-button type="info" :icon="Setting" @click="handleSettings">
              系统设置
            </el-button>
          </div>
        </div>
        <div class="header-tabs">
          <el-tabs v-model="activeTab" @tab-click="handleTabClick">
            <el-tab-pane label="操作监控" name="operation">
              <template #label>
                <el-icon><Operation /></el-icon>
                操作监控
              </template>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>

      <!-- 主要内容区域 -->
      <div class="admin-main">
        <!-- 左侧主要内容 -->
        <div class="main-content-area">

          <!-- 操作日志 -->
          <div v-if="activeTab === 'operation'" class="operation-section">
            <OperationLogList
                ref="logListRef"
                :auto-refresh="true"
                @log-click="handleLogClick"
                @refresh="handleLogRefresh"
            />
          </div>
        </div>

        <!-- 右侧信息卡区域 -->
        <div class="info-sidebar">
          <el-card shadow="hover" class="sidebar-card">
            <template #header>
              <div class="card-header">
                <span><el-icon><InfoFilled /></el-icon> 系统信息</span>
              </div>
            </template>

            <div class="system-info">
              <div class="info-item">
                <span class="info-label">系统版本</span>
                <span class="info-value">v2.1.0</span>
              </div>
              <div class="info-item">
                <span class="info-label">启动时间</span>
                <span class="info-value">{{ systemUptime }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">总用户数</span>
                <span class="info-value">{{ systemStats?.totalUsers || 0 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">总操作数</span>
                <span class="info-value">{{ formatNumber(systemStats?.totalOperations || 0) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">存储使用</span>
                <div class="storage-progress">
                  <el-progress
                      :percentage="storagePercentage"
                      :stroke-width="12"
                      :show-text="false"
                  />
                  <span class="storage-text">{{ storageText }}</span>
                </div>
              </div>
            </div>
          </el-card>

          <el-card shadow="hover" class="sidebar-card">
            <template #header>
              <div class="card-header">
                <span><el-icon><Bell /></el-icon> 系统通知</span>
              </div>
            </template>

            <div class="notifications">
              <div v-if="notifications.length === 0" class="empty-notifications">
                <el-icon :size="40" color="#909399"><Bell /></el-icon>
                <p>暂无通知</p>
              </div>

              <div v-for="notification in notifications" :key="notification.id"
                   class="notification-item" :class="{ unread: !notification.read }">
                <div class="notification-icon">
                  <el-icon :color="getNotificationColor(notification.type)">
                    <component :is="getNotificationIcon(notification.type)" />
                  </el-icon>
                </div>
                <div class="notification-content">
                  <div class="notification-title">{{ notification.title }}</div>
                  <div class="notification-time">{{ formatRelativeTime(notification.time) }}</div>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Monitor,
  Refresh,
  Setting,
  Operation,
  User,
  DataLine,
  Lock,
  Plus,
  InfoFilled,
  Bell,
  Warning,
  Check,
  Close
} from '@element-plus/icons-vue'
import { useAdminStore } from '../stores/adminStore'
import Layout from '../components/Layout/layout.vue'
import OperationLogList from '../components/admin/OperationLogList.vue'

const router = useRouter()
const store = useAdminStore()
const logListRef = ref(null)
const activeTab = ref('operation')
const systemUptime = ref('')
const notifications = ref([])

const systemStats = computed(() => store.systemStats || {})

const storagePercentage = computed(() => {
  if (!systemStats.value.storage) return 0
  const used = systemStats.value.storage.used || 0
  const total = systemStats.value.storage.total || 1
  return Math.round((used / total) * 100)
})

const storageText = computed(() => {
  if (!systemStats.value.storage) return '0/0 GB'
  const used = (systemStats.value.storage.used / 1024).toFixed(1)
  const total = (systemStats.value.storage.total / 1024).toFixed(1)
  return `${used}/${total} GB`
})

// 格式化数字
const formatNumber = (num) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 格式化相对时间
const formatRelativeTime = (time) => {
  if (!time) return ''
  const now = new Date()
  const target = new Date(time)
  const diff = now - target

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return `${Math.floor(diff / 86400000)}天前`
}

// 获取通知图标
const getNotificationIcon = (type) => {
  const iconMap = {
    'warning': Warning,
    'success': Check,
    'error': Close,
    'info': Bell
  }
  return iconMap[type] || Bell
}

// 获取通知颜色
const getNotificationColor = (type) => {
  const colorMap = {
    'warning': '#e6a23c',
    'success': '#67c23a',
    'error': '#f56c6c',
    'info': '#909399'
  }
  return colorMap[type] || '#909399'
}

// 处理标签点击
const handleTabClick = (tab) => {
  // 可以在这里添加标签切换时的逻辑
  console.log('切换到标签:', tab.props.name)
}

// 处理日志点击
const handleLogClick = (log) => {
  console.log('日志被点击:', log)
  // 可以在这里显示日志详情
}

// 处理日志刷新
const handleLogRefresh = () => {
  console.log('日志已刷新')
}

// 刷新所有数据
const refreshAll = async () => {
  try {
    await store.init()
    ElMessage.success('数据已刷新')
  } catch (error) {
    ElMessage.error('刷新失败')
  }
}

// 处理系统设置
const handleSettings = () => {
  ElMessage.info('系统设置功能开发中')
}

// 计算系统运行时间
const calculateUptime = () => {
  const startTime = new Date('2024-01-01T00:00:00')
  const now = new Date()
  const diff = now - startTime

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  systemUptime.value = `${days}天${hours}小时${minutes}分钟`
}

// 模拟通知数据
const loadNotifications = () => {
  notifications.value = [
    {
      id: 1,
      type: 'warning',
      title: '系统将在1小时后进行维护',
      time: new Date(Date.now() - 30 * 60000),
      read: false
    },
    {
      id: 2,
      type: 'success',
      title: '数据库备份成功',
      time: new Date(Date.now() - 2 * 3600000),
      read: true
    },
    {
      id: 3,
      type: 'info',
      title: '新用户注册成功',
      time: new Date(Date.now() - 5 * 3600000),
      read: true
    }
  ]
}

// 初始化
onMounted(async () => {
  calculateUptime()
  loadNotifications()

  try {
    await store.init()
  } catch (error) {
    console.error('初始化后台管理失败:', error)
  }

  // 每分钟更新一次运行时间
  setInterval(calculateUptime, 60000)
})

onUnmounted(() => {
  // 清理定时器
})
</script>
<style scoped>
.admin-dashboard {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
  /* 为侧边栏留出空间 */
  margin-left: 280px; /* 与侧边栏宽度一致 */
  transition: margin-left 0.3s ease;
  width: calc(100% - 280px);
}

/* 当侧边栏折叠时 */
:deep(.el-menu--collapse) ~ .admin-dashboard {
  margin-left: 64px;
  width: calc(100% - 64px);
}

.admin-header {
  background: #fff;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.header-content h1 {
  margin: 0;
  font-size: 24px;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.header-tabs {
  padding: 0 24px;
}

:deep(.el-tabs__header) {
  margin: 0;
}

:deep(.el-tabs__item) {
  display: flex;
  align-items: center;
  gap: 8px;
}

.admin-main {
  display: grid;
  grid-template-columns: 1fr 300px; /* 主要内容区和侧边信息卡区 */
  gap: 20px;
}

.main-content-area {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.operation-section,
.user-section,
.statistics-section,
.security-section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* 侧边信息卡区域 */
.info-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sidebar-card {
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.system-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.info-label {
  color: #606266;
  font-size: 14px;
}

.info-value {
  color: #303133;
  font-weight: 500;
}

.storage-progress {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.storage-text {
  font-size: 12px;
  color: #909399;
  min-width: 60px;
  text-align: right;
}

.notifications {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-notifications {
  text-align: center;
  padding: 20px;
  color: #909399;
}

.empty-notifications p {
  margin-top: 8px;
}

.notification-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: #fafafa;
  transition: all 0.3s;
  cursor: pointer;
}

.notification-item:hover {
  background: #f0f0f0;
}

.notification-item.unread {
  background: #f0f9ff;
}

.notification-item.unread:hover {
  background: #e6f7ff;
}

.notification-icon {
  font-size: 20px;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-size: 14px;
  color: #303133;
  margin-bottom: 4px;
}

.notification-time {
  font-size: 12px;
  color: #909399;
}

/* 实时统计组件样式调整 */
.real-time-stats {
  margin-bottom: 0;
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .admin-main {
    grid-template-columns: 1fr;
  }

  .info-sidebar {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

@media (max-width: 1200px) {
  .admin-dashboard {
    margin-left: 64px;
    width: calc(100% - 64px);
  }

  .info-sidebar {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .admin-dashboard {
    margin-left: 0;
    width: 100%;
    padding: 15px;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
    padding: 15px;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .admin-main {
    gap: 15px;
  }

  .operation-section,
  .user-section,
  .statistics-section,
  .security-section {
    padding: 15px;
  }

  /* 调整统计卡片 */
  :deep(.el-col) {
    margin-bottom: 15px;
  }

  :deep(.el-col:last-child) {
    margin-bottom: 0;
  }
}

/* 移动端隐藏标签图标 */
@media (max-width: 576px) {
  :deep(.el-tabs__item .el-icon) {
    display: none;
  }
}
</style>