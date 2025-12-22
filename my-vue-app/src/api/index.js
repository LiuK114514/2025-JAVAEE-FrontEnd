import request from '../util/request.js'

// 题库相关API
export const questionApi = {
    // 获取题目列表
    getQuestionList(params) {
        return request.get('/questions', { params })
    },

    // 创建题目
    createQuestion(data) {
        return request.post('/questions', data)
    },

    // 获取题目详情
    getQuestionDetail(id) {
        return request.get(`/questions/${id}`)
    },

    // 更新题目
    updateQuestion(id, data) {
        return request.put(`/questions/${id}`, data)
    },

    // 删除题目
    deleteQuestion(id) {
        return request.delete(`/questions/${id}`)
    },

    // 获取每日一题
    getDailyQuestion() {
        return request.get('/questions/daily')
    },

    // 提交练习答案
    submitPracticeAnswer(data) {
        return request.post('/practice/submit', data)
    },

    // 获取练习统计
    getPracticeStats() {
        return request.get('/practice/stats')
    },

    // 获取练习历史
    getPracticeHistory(params) {
        return request.get('/practice/history', { params })
    }
}


export const adminApi = {
    // 获取操作日志列表
    getOperationLogs(params) {
        return request.get('/admin/operation-logs', { params })
    },

    // 获取操作日志详情
    getOperationLogDetail(id) {
        return request.get(`/admin/operation-logs/${id}`)
    },

    // 搜索操作日志
    searchOperationLogs(params) {
        return request.get('/admin/operation-logs/search', { params })
    },

    // 导出操作日志
    exportOperationLogs(params) {
        return request.get('/admin/operation-logs/export', {
            params,
            responseType: 'blob'
        })
    },

    // 获取实时统计数据
    getRealtimeStats() {
        return request.get('/admin/stats/realtime')
    },

    // 获取用户活动统计
    getUserActivityStats(params) {
        return request.get('/admin/stats/user-activity', { params })
    },

    // 获取系统统计
    getSystemStats() {
        return request.get('/admin/stats/system')
    },

    // 获取在线用户
    getOnlineUsers() {
        return request.get('/admin/users/online')
    },

    // 获取用户行为分析
    getUserBehaviorAnalysis(params) {
        return request.get('/admin/analysis/user-behavior', { params })
    },

    // 删除操作日志
    deleteOperationLog(id) {
        return request.delete(`/admin/operation-logs/${id}`)
    },

    // 批量删除操作日志
    batchDeleteOperationLogs(ids) {
        return request.post('/admin/operation-logs/batch-delete', { ids })
    }
}
