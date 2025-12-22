<template>
  <div class="operation-log-list">
    <!-- 筛选工具栏 -->
    <div class="filter-toolbar">
      <el-row :gutter="20" align="middle">
        <el-col :span="4">
          <el-input
              v-model="localFilters.operator"
              placeholder="操作者"
              clearable
              @clear="handleFilterChange"
              @keyup.enter="handleFilterChange"
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-col>

        <el-col :span="4">
          <el-select
              v-model="localFilters.operationType"
              placeholder="操作类型"
              clearable
              @change="handleFilterChange"
          >
            <el-option label="全部" value="" />
            <el-option v-for="type in operationTypes" :key="type.value" :label="type.label" :value="type.value" />
          </el-select>
        </el-col>

        <el-col :span="8">
          <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              @change="handleDateChange"
              style="width: 100%"
          />
        </el-col>

        <el-col :span="4">
          <el-input
              v-model="localFilters.keyword"
              placeholder="搜索关键字"
              clearable
              @clear="handleFilterChange"
              @keyup.enter="handleFilterChange"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>

        <el-col :span="4">
          <el-button-group>
            <el-button type="primary" @click="handleFilterChange">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="handleReset">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </el-button-group>
        </el-col>
      </el-row>
    </div>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <el-button
          type="primary"
          :loading="store.exporting"
          @click="handleExport"
      >
        <el-icon><Download /></el-icon>
        导出日志
      </el-button>

      <el-button
          type="danger"
          :disabled="selectedLogs.length === 0"
          @click="handleBatchDelete"
      >
        <el-icon><Delete /></el-icon>
        批量删除
      </el-button>

      <el-button
          type="info"
          @click="handleRefresh"
      >
        <el-icon><Refresh /></el-icon>
        刷新
      </el-button>
    </div>

    <!-- 日志表格 -->
    <div class="log-table-container" ref="tableContainer">
      <el-table
          ref="logTable"
          :data="store.operationLogs"
          :loading="store.loading"
          style="width: 100%"
          @selection-change="handleSelectionChange"
          @row-click="handleRowClick"
          :row-class-name="tableRowClassName"
      >
        <el-table-column type="selection" width="55" />

        <el-table-column prop="operator" label="操作者" width="120">
          <template #default="{ row }">
            <div class="operator-cell">
              <el-avatar :size="24" :src="row.operatorAvatar" class="operator-avatar">
                {{ row.operatorName?.charAt(0) || 'U' }}
              </el-avatar>
              <span class="operator-name">{{ row.operatorName || '匿名用户' }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="operationTypeInfo.label" label="操作类型" width="120">
          <template #default="{ row }">
            <el-tag :type="row.operationTypeInfo.color" size="small">
              <el-icon :size="14">
                <component :is="row.operationTypeInfo.icon" />
              </el-icon>
              {{ row.operationTypeInfo.label }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="operationContent" label="操作内容" min-width="200">
          <template #default="{ row }">
            <div class="operation-content">
              <span class="content-text">{{ row.operationContent }}</span>
              <el-tooltip
                  v-if="row.details"
                  :content="JSON.stringify(row.details, null, 2)"
                  placement="top"
              >
                <el-icon class="detail-icon"><InfoFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="ipAddress" label="IP地址" width="140">
          <template #default="{ row }">
            <span class="ip-address">{{ row.ipAddress || '--' }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="userAgent" label="客户端" width="160">
          <template #default="{ row }">
            <el-tooltip :content="row.userAgent || '未知'" placement="top">
              <span class="user-agent">{{ truncateText(row.userAgent, 20) }}</span>
            </el-tooltip>
          </template>
        </el-table-column>

        <el-table-column prop="createdAt" label="操作时间" width="180">
          <template #default="{ row }">
            <div class="time-cell">
              <div class="absolute-time">{{ row.formattedTime }}</div>
              <div class="relative-time">{{ formatRelativeTime(row.createdAt) }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'success' ? 'success' : 'danger'" size="small">
              {{ row.status === 'success' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button-group size="small">
              <el-button
                  type="primary"
                  @click.stop="handleViewDetail(row)"
                  :icon="View"
              />
              <el-button
                  type="danger"
                  @click.stop="handleDelete(row)"
                  :icon="Delete"
                  :loading="store.deleting"
              />
            </el-button-group>
          </template>
        </el-table-column>

        <!-- 空状态 -->
        <template #empty>
          <div class="empty-state">
            <el-icon :size="48" color="#909399"><Document /></el-icon>
            <p>暂无操作日志</p>
          </div>
        </template>
      </el-table>

      <!-- 无限滚动加载 -->
      <div
          v-if="store.logPagination.total > store.operationLogs.length"
          class="load-more"
      >
        <el-button
            type="text"
            :loading="store.loading"
            @click="loadMore"
        >
          加载更多
        </el-button>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
          v-model:current-page="store.logPagination.page"
          v-model:page-size="store.logPagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="store.logPagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  User,
  Search,
  Refresh,
  Download,
  Delete,
  View,
  InfoFilled,
  Document
} from '@element-plus/icons-vue'
import { useAdminStore } from '../../stores/adminStore'

const props = defineProps({
  autoRefresh: {
    type: Boolean,
    default: false
  },
  refreshInterval: {
    type: Number,
    default: 30000 // 30秒
  }
})

const emit = defineEmits(['log-click', 'refresh', 'filter-change'])

const router = useRouter()
const store = useAdminStore()
const tableContainer = ref(null)
const logTable = ref(null)
const dateRange = ref([])
const selectedLogs = ref([])
let refreshTimer = null

// 本地筛选条件
const localFilters = ref({
  operator: '',
  operationType: '',
  keyword: ''
})

// 操作类型选项
const operationTypes = computed(() => {
  return [
    { value: 'login', label: '用户登录' },
    { value: 'logout', label: '用户登出' },
    { value: 'create_exam', label: '创建考试' },
    { value: 'update_exam', label: '更新考试' },
    { value: 'delete_exam', label: '删除考试' },
    { value: 'submit_practice', label: '提交练习' },
    { value: 'view_exam', label: '查看试卷' },
    { value: 'download_file', label: '下载文件' },
    { value: 'upload_file', label: '上传文件' },
    { value: 'system', label: '系统操作' },
    { value: 'other', label: '其他操作' }
  ]
})

// 截断文本
const truncateText = (text, length = 50) => {
  if (!text) return '--'
  return text.length > length ? text.substring(0, length) + '...' : text
}

// 格式化相对时间
const formatRelativeTime = (time) => {
  if (!time) return ''
  const now = new Date()
  const target = new Date(time)
  const diff = now - target

  if (diff < 60000) return '刚刚' // 1分钟内
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前` // 1小时内
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前` // 1天内
  return `${Math.floor(diff / 86400000)}天前` // 超过1天
}

// 处理筛选变化
const handleFilterChange = () => {
  if (dateRange.value) {
    localFilters.value.startDate = dateRange.value[0]?.toISOString() || ''
    localFilters.value.endDate = dateRange.value[1]?.toISOString() || ''
  } else {
    localFilters.value.startDate = ''
    localFilters.value.endDate = ''
  }

  store.updateFilters(localFilters.value)
  store.fetchOperationLogs()
  emit('filter-change', localFilters.value)
}

// 处理日期变化
const handleDateChange = () => {
  handleFilterChange()
}

// 重置筛选
const handleReset = () => {
  localFilters.value = {
    operator: '',
    operationType: '',
    keyword: ''
  }
  dateRange.value = []
  store.resetFilters()
  store.fetchOperationLogs()
}

// 处理导出
const handleExport = async () => {
  try {
    await ElMessageBox.confirm('确认导出操作日志吗？', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await store.exportLogs()
    ElMessage.success('导出成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('导出失败')
    }
  }
}

// 处理批量删除
const handleBatchDelete = async () => {
  if (selectedLogs.value.length === 0) return

  try {
    await ElMessageBox.confirm(`确认删除选中的 ${selectedLogs.value.length} 条日志吗？`, '警告', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    })

    const ids = selectedLogs.value.map(log => log.id)
    const result = await store.batchDeleteLogs(ids)

    if (result.success) {
      ElMessage.success('删除成功')
      selectedLogs.value = []
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 处理刷新
const handleRefresh = () => {
  store.fetchOperationLogs()
  emit('refresh')
}

// 处理选择变化
const handleSelectionChange = (selection) => {
  selectedLogs.value = selection
}

// 处理行点击
const handleRowClick = (row) => {
  emit('log-click', row)
}

// 查看详情
const handleViewDetail = (row) => {
  router.push({
    name: 'OperationLog',
    query: { id: row.id }
  })
}

// 删除单条日志
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确认删除这条操作日志吗？', '警告', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    })

    const result = await store.deleteLog(row.id)

    if (result.success) {
      ElMessage.success('删除成功')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 加载更多
const loadMore = () => {
  const currentPage = store.logPagination.page
  store.setPagination(currentPage + 1, store.logPagination.pageSize)
  store.fetchOperationLogs()
}

// 表格行类名
const tableRowClassName = ({ row }) => {
  if (row.status === 'failed') {
    return 'warning-row'
  }
  return ''
}

// 分页大小变化
const handleSizeChange = (size) => {
  store.setPagination(1, size)
  store.fetchOperationLogs()
}

// 当前页变化
const handleCurrentChange = (page) => {
  store.setPagination(page, store.logPagination.pageSize)
  store.fetchOperationLogs()
}

// 自动刷新
const startAutoRefresh = () => {
  if (props.autoRefresh) {
    refreshTimer = setInterval(() => {
      handleRefresh()
    }, props.refreshInterval)
  }
}

// 停止自动刷新
const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

// 初始化
onMounted(() => {
  store.fetchOperationLogs()
  startAutoRefresh()
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped>
.operation-log-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.filter-toolbar {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.action-buttons {
  margin-bottom: 16px;
  display: flex;
  gap: 12px;
}

.log-table-container {
  flex: 1;
  overflow: hidden;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

:deep(.el-table) {
  flex: 1;
}

:deep(.el-table__body-wrapper) {
  overflow-y: auto;
  max-height: calc(100vh - 400px);
}

.operator-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.operator-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.operator-name {
  font-weight: 500;
}

.operation-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.content-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-icon {
  color: #409eff;
  cursor: pointer;
}

.detail-icon:hover {
  color: #337ecc;
}

.ip-address {
  font-family: 'Courier New', monospace;
  color: #666;
}

.user-agent {
  color: #909399;
}

.time-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.absolute-time {
  font-weight: 500;
  color: #303133;
}

.relative-time {
  font-size: 12px;
  color: #909399;
}

.empty-state {
  padding: 40px;
  text-align: center;
  color: #909399;
}

.empty-state p {
  margin-top: 12px;
  font-size: 14px;
}

.load-more {
  padding: 16px;
  text-align: center;
  border-top: 1px solid #ebeef5;
}

.pagination-container {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-top: 16px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

:deep(.warning-row) {
  background-color: #fff2f0;
}

:deep(.warning-row:hover > td) {
  background-color: #ffeae6 !important;
}
</style>