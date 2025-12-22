import { format, formatDistanceToNow, formatDistance } from 'date-fns'
import { zhCN } from 'date-fns/locale'

// 时间格式化过滤器
export const timeFilters = {
    // 格式化日期时间
    formatDateTime(value, formatStr = 'yyyy-MM-dd HH:mm:ss') {
        if (!value) return '--'
        return format(new Date(value), formatStr)
    },

    // 相对时间（如：3分钟前）
    relativeTime(value) {
        if (!value) return '--'
        return formatDistanceToNow(new Date(value), {
            addSuffix: true,
            locale: zhCN
        })
    },

    // 持续时间（如：2小时30分钟）
    durationTime(start, end) {
        if (!start || !end) return '--'
        return formatDistance(new Date(start), new Date(end), {
            locale: zhCN
        })
    },

    // 格式化操作类型
    formatOperationType(type) {
        const typeMap = {
            'login': '用户登录',
            'logout': '用户登出',
            'create_exam': '创建考试',
            'update_exam': '更新考试',
            'delete_exam': '删除考试',
            'submit_practice': '提交练习',
            'view_exam': '查看试卷',
            'download_file': '下载文件',
            'upload_file': '上传文件',
            'system': '系统操作',
            'other': '其他操作'
        }
        return typeMap[type] || type
    },

    // 格式化IP地址
    formatIP(ip) {
        if (!ip) return '--'
        // 可以添加IP地址美化逻辑
        return ip
    },

    // 截断长文本
    truncate(text, length = 50) {
        if (!text) return ''
        return text.length > length ? text.substring(0, length) + '...' : text
    }
}

// 注册全局过滤器
export const registerFilters = (app) => {
    Object.keys(timeFilters).forEach(key => {
        app.config.globalProperties[`$${key}`] = timeFilters[key]
        app.provide(key, timeFilters[key])
    })
}