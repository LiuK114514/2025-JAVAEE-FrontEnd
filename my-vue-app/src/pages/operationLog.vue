<template>
  <Layout />
  <div class="operation-log-detail">
    <!-- 返回按钮 -->
    <div class="back-button">
      <el-button type="text" :icon="ArrowLeft" @click="goBack">
        返回操作日志
      </el-button>
    </div>

    <!-- 详情卡片 -->
    <el-card shadow="always" class="detail-card" v-if="logDetail">
      <template #header>
        <div class="card-header">
          <div class="header-title">
            <h2>操作日志详情</h2>
            <el-tag :type="getOperationTypeColor(logDetail.operationType)" size="large">
              {{ getOperationTypeLabel(logDetail.operationType) }}
            </el-tag>
          </div>
          <div class="header-actions">
            <el-button type="primary" :icon="Printer" @click="printDetail">打印</el-button>
            <el-button type="danger" :icon="Delete" @click="handleDelete">删除</el-button>
          </div>
        </div>
      </template>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="操作ID">{{ logDetail.id }}</el-descriptions-item>
        <el-descriptions-item label="操作状态">
          <el-tag :type="logDetail.status === 'success' ? 'success' : 'danger'">
            {{ logDetail.status === 'success' ? '成功' : '失败' }}
          </el-tag>
        </el-descriptions-item>

        <el-descriptions-item label="操作者">
          <div class="operator-info">
            <el-avatar :size="32" :src="logDetail.operatorAvatar" class="operator-avatar">
              {{ logDetail.operatorName?.charAt(0) || 'U' }}
            </el-avatar>
            <div class="operator-detail">
              <div class="operator-name">{{ logDetail.operatorName || '匿名用户' }}</div>
              <div class="operator-id">ID: {{ logDetail.operatorId }}</div>
            </div>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="用户角色">{{ logDetail.operatorRole || '--' }}</el-descriptions-item>

        <el-descriptions-item label="操作时间">{{ formatDateTime(logDetail.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="操作耗时">
          {{ logDetail.executionTime ? `${logDetail.executionTime}ms` : '--' }}
        </el-descriptions-item>

        <el-descriptions-item label="IP地址">{{ logDetail.ipAddress || '--' }}</el-descriptions-item>
        <el-descriptions-item label="地理位置">{{ logDetail.location || '--' }}</el-descriptions-item>

        <el-descriptions-item label="设备信息" :span="2">
          {{ logDetail.userAgent || '--' }}
        </el-descriptions-item>

        <el-descriptions-item label="操作内容" :span="2">
          <div class="operation-content">
            {{ logDetail.operationContent }}
          </div>
        </el-descriptions-item>

        <el-descriptions-item label="详细参数" :span="2">
          <div class="detail-params">
            <pre>{{ formatJSON(logDetail.details) }}</pre>
          </div>
        </el-descriptions-item>

        <el-descriptions-item label="错误信息" :span="2" v-if="logDetail.error">
          <div class="error-info">
            <el-alert :title="logDetail.error.message" type="error" :closable="false">
              <template #default>
                <div v-if="logDetail.error.stack" class="error-stack">
                  <pre>{{ logDetail.error.stack }}</pre>
                </div>
              </template>
            </el-alert>
          </div>
        </el-descriptions-item>

        <el-descriptions-item label="相关资源" :span="2" v-if="logDetail.resource">
          <div class="resource-info">
            <el-tag v-if="logDetail.resource.type" type="info">{{ logDetail.resource.type }}</el-tag>
            <span v-if="logDetail.resource.id">ID: {{ logDetail.resource.id }}</span>
            <span v-if="logDetail.resource.name">名称: {{ logDetail.resource.name }}</span>
          </div>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 加载状态 -->
    <div v-else-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <el-result icon="error" title="加载失败" :sub-title="error">
        <template #extra>
          <el-button type="primary" @click="retry">重试</el-button>
        </template>
      </el-result>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft,
  Printer,
  Delete
} from '@element-plus/icons-vue'
import { useAdminStore } from '../stores/adminStore'
import Layout from '../components/Layout/layout.vue'

const route = useRoute()
const router = useRouter()
const store = useAdminStore()

const logDetail = ref(null)
const loading = ref(false)
const error = ref('')

// 格式化日期时间
const formatDateTime = (time) => {
  if (!time) return '--'
  return new Date(time).toLocaleString('zh-CN')
}

// 格式化JSON
const formatJSON = (obj) => {
  if (!obj) return '无'
  try {
    return JSON.stringify(obj, null, 2)
  } catch {
    return String(obj)
  }
}

// 获取操作类型颜色
const getOperationTypeColor = (type) => {
  const colorMap = {
    'login': 'success',
    'logout': 'info',
    'create_exam': 'primary',
    'submit_practice': 'success',
    'system': 'warning'
  }
  return colorMap[type] || 'info'
}

// 获取操作类型标签
const getOperationTypeLabel = (type) => {
  const labelMap = {
    'login': '用户登录',
    'logout': '用户登出',
    'create_exam': '创建考试',
    'update_exam': '更新考试',
    'delete_exam': '删除考试',
    'submit_practice': '提交练习',
    'view_exam': '查看试卷'
  }
  return labelMap[type] || type
}

// 加载日志详情
const loadLogDetail = async () => {
  const logId = route.query.id
  if (!logId) {
    error.value = '日志ID不存在'
    return
  }

  try {
    loading.value = true
    error.value = ''

    const result = await store.fetchLogDetail(logId)

    if (result.success) {
      logDetail.value = result.data
    } else {
      error.value = result.error || '加载失败'
    }
  } catch (err) {
    console.error('加载日志详情失败:', err)
    error.value = '加载失败，请重试'
  } finally {
    loading.value = false
  }
}

// 返回上一页
const goBack = () => {
  router.go(-1)
}

// 打印详情
const printDetail = () => {
  window.print()
}

// 删除日志
const handleDelete = async () => {
  if (!logDetail.value) return

  try {
    await ElMessageBox.confirm('确认删除这条操作日志吗？此操作不可恢复。', '警告', {
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    })

    const result = await store.deleteLog(logDetail.value.id)

    if (result.success) {
      ElMessage.success('删除成功')
      router.push({ name: 'AdminDashboard' })
    }
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 重试加载
const retry = () => {
  loadLogDetail()
}

onMounted(() => {
  loadLogDetail()
})
</script>

<style scoped>
.operation-log-detail {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.back-button {
  margin-bottom: 20px;
}

.detail-card {
  border-radius: 12px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-title h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.operator-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.operator-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.operator-detail {
  display: flex;
  flex-direction: column;
}

.operator-name {
  font-weight: 500;
  color: #303133;
}

.operator-id {
  font-size: 12px;
  color: #909399;
}

.operation-content {
  padding: 12px;
  background: #fafafa;
  border-radius: 4px;
  border-left: 4px solid #409eff;
  white-space: pre-wrap;
}

.detail-params {
  padding: 12px;
  background: #f6f8fa;
  border-radius: 4px;
  border: 1px solid #e1e4e8;
  overflow-x: auto;
}

.detail-params pre {
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  line-height: 1.5;
  color: #24292e;
}

.error-info {
  margin-top: 8px;
}

.error-stack {
  margin-top: 8px;
  padding: 8px;
  background: #fff1f0;
  border-radius: 4px;
  overflow-x: auto;
}

.error-stack pre {
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  color: #cf222e;
}

.resource-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.loading-container {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
}

.error-container {
  background: #fff;
  padding: 40px;
  border-radius: 12px;
  text-align: center;
}

/* 打印样式 */
@media print {
  .back-button,
  .header-actions,
  .header-title h2 {
    display: none;
  }

  .detail-card {
    border: none;
    box-shadow: none;
  }

  .el-descriptions {
    break-inside: avoid;
  }
}
</style>