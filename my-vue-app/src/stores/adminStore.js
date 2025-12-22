import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { adminApi } from '../api/index.js'

export const useAdminStore = defineStore('admin', () => {
    // 操作日志相关状态
    const operationLogs = ref([])
    const currentLogDetail = ref(null)
    const logPagination = ref({
        page: 1,
        pageSize: 20,
        total: 0
    })

    // 实时统计状态
    const realtimeStats = ref(null)
    const userActivityStats = ref([])
    const systemStats = ref(null)
    const onlineUsers = ref([])

    // 加载状态
    const loading = ref(false)
    const exporting = ref(false)
    const deleting = ref(false)

    // 筛选条件
    const filters = ref({
        operator: '',
        operationType: '',
        startDate: '',
        endDate: '',
        ipAddress: '',
        keyword: ''
    })

    // 操作类型映射
    const operationTypeMap = {
        'login': { label: '用户登录', color: 'success', icon: 'UserFilled' },
        'logout': { label: '用户登出', color: 'info', icon: 'User' },
        'create_exam': { label: '创建考试', color: 'primary', icon: 'DocumentAdd' },
        'update_exam': { label: '更新考试', color: 'warning', icon: 'Edit' },
        'delete_exam': { label: '删除考试', color: 'danger', icon: 'Delete' },
        'submit_practice': { label: '提交练习', color: 'success', icon: 'Check' },
        'view_exam': { label: '查看试卷', color: 'info', icon: 'View' },
        'download_file': { label: '下载文件', color: '', icon: 'Download' },
        'upload_file': { label: '上传文件', color: '', icon: 'Upload' },
        'system': { label: '系统操作', color: 'danger', icon: 'Setting' },
        'other': { label: '其他操作', color: '', icon: 'More' }
    }

    // 获取操作类型信息
    const getOperationTypeInfo = (type) => {
        return operationTypeMap[type] || {
            label: type,
            color: 'info',
            icon: 'QuestionFilled'
        }
    }

    // 计算属性
    const formattedLogs = computed(() => {
        return operationLogs.value.map(log => ({
            ...log,
            operationTypeInfo: getOperationTypeInfo(log.operationType),
            formattedTime: new Date(log.createdAt).toLocaleString('zh-CN')
        }))
    })

    // 获取操作日志列表
    async function fetchOperationLogs(params = {}) {
        try {
            loading.value = true

            const queryParams = {
                page: logPagination.value.page,
                pageSize: logPagination.value.pageSize,
                ...filters.value,
                ...params
            }

            // 清理空值
            Object.keys(queryParams).forEach(key => {
                if (queryParams[key] === '') {
                    delete queryParams[key]
                }
            })

            const result = await adminApi.getOperationLogs(queryParams)

            operationLogs.value = result.items || result.data || []
            logPagination.value = {
                page: result.page || 1,
                pageSize: result.pageSize || 20,
                total: result.total || 0
            }

            return { success: true, data: result }
        } catch (error) {
            console.error('获取操作日志失败:', error)
            return { success: false, error: error.message }
        } finally {
            loading.value = false
        }
    }

    // 搜索操作日志
    async function searchLogs(searchParams) {
        try {
            loading.value = true
            const result = await adminApi.searchOperationLogs(searchParams)

            operationLogs.value = result.items || result.data || []
            logPagination.value.total = result.total || result.data?.length || 0

            return { success: true, data: result }
        } catch (error) {
            console.error('搜索操作日志失败:', error)
            return { success: false, error: error.message }
        } finally {
            loading.value = false
        }
    }

    // 获取操作日志详情
    async function fetchLogDetail(id) {
        try {
            const result = await adminApi.getOperationLogDetail(id)
            currentLogDetail.value = result
            return { success: true, data: result }
        } catch (error) {
            console.error('获取日志详情失败:', error)
            return { success: false, error: error.message }
        }
    }

    // 获取实时统计数据
    async function fetchRealtimeStats() {
        try {
            const result = await adminApi.getRealtimeStats()
            realtimeStats.value = result
            return { success: true, data: result }
        } catch (error) {
            console.error('获取实时统计失败:', error)
            return { success: false, error: error.message }
        }
    }

    // 获取用户活动统计
    async function fetchUserActivityStats(params = {}) {
        try {
            const result = await adminApi.getUserActivityStats(params)
            userActivityStats.value = result
            return { success: true, data: result }
        } catch (error) {
            console.error('获取用户活动统计失败:', error)
            return { success: false, error: error.message }
        }
    }

    // 获取系统统计
    async function fetchSystemStats() {
        try {
            const result = await adminApi.getSystemStats()
            systemStats.value = result
            return { success: true, data: result }
        } catch (error) {
            console.error('获取系统统计失败:', error)
            return { success: false, error: error.message }
        }
    }

    // 获取在线用户
    async function fetchOnlineUsers() {
        try {
            const result = await adminApi.getOnlineUsers()
            onlineUsers.value = result
            return { success: true, data: result }
        } catch (error) {
            console.error('获取在线用户失败:', error)
            return { success: false, error: error.message }
        }
    }

    // 导出操作日志
    async function exportLogs(params = {}) {
        try {
            exporting.value = true
            const response = await adminApi.exportOperationLogs({
                ...filters.value,
                ...params
            })

            // 创建下载链接
            const url = window.URL.createObjectURL(new Blob([response]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `operation-logs-${new Date().getTime()}.xlsx`)
            document.body.appendChild(link)
            link.click()
            link.remove()

            return { success: true }
        } catch (error) {
            console.error('导出操作日志失败:', error)
            return { success: false, error: error.message }
        } finally {
            exporting.value = false
        }
    }

    // 删除操作日志
    async function deleteLog(id) {
        try {
            deleting.value = true
            await adminApi.deleteOperationLog(id)

            // 从列表中移除
            operationLogs.value = operationLogs.value.filter(log => log.id !== id)
            logPagination.value.total--

            return { success: true }
        } catch (error) {
            console.error('删除操作日志失败:', error)
            return { success: false, error: error.message }
        } finally {
            deleting.value = false
        }
    }

    // 批量删除操作日志
    async function batchDeleteLogs(ids) {
        try {
            deleting.value = true
            await adminApi.batchDeleteOperationLogs({ ids })

            // 从列表中移除
            operationLogs.value = operationLogs.value.filter(log => !ids.includes(log.id))
            logPagination.value.total -= ids.length

            return { success: true }
        } catch (error) {
            console.error('批量删除操作日志失败:', error)
            return { success: false, error: error.message }
        } finally {
            deleting.value = false
        }
    }

    // 更新筛选条件
    function updateFilters(newFilters) {
        filters.value = { ...filters.value, ...newFilters }
    }

    // 重置筛选条件
    function resetFilters() {
        filters.value = {
            operator: '',
            operationType: '',
            startDate: '',
            endDate: '',
            ipAddress: '',
            keyword: ''
        }
    }

    // 设置分页
    function setPagination(page, pageSize) {
        logPagination.value.page = page
        logPagination.value.pageSize = pageSize
    }

    // 初始化数据
    async function init() {
        await Promise.all([
            fetchOperationLogs(),
            fetchRealtimeStats(),
            fetchSystemStats(),
            fetchOnlineUsers()
        ])
    }

    return {
        // 状态
        operationLogs: formattedLogs,
        currentLogDetail,
        logPagination,
        realtimeStats,
        userActivityStats,
        systemStats,
        onlineUsers,
        filters,
        loading,
        exporting,
        deleting,

        // 方法
        fetchOperationLogs,
        searchLogs,
        fetchLogDetail,
        fetchRealtimeStats,
        fetchUserActivityStats,
        fetchSystemStats,
        fetchOnlineUsers,
        exportLogs,
        deleteLog,
        batchDeleteLogs,
        updateFilters,
        resetFilters,
        setPagination,
        init,
        getOperationTypeInfo
    }
})