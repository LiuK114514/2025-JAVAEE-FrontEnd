import { defineStore } from 'pinia'
export const menuWidthStore = defineStore("menuWidth" , {
    state: () => ({
        // 侧边栏宽度
        menuWidth: '240px',
        // 或者用布尔值更简洁
        isCollapse: false,
        //路径映射
        menuList: [
            { index: '1', path: '/#', name: '每日一练' },
            { index: '2', path: '/publishTest', name: '发布考试' },
            { index: '3', path: '/answerExam', name: '参与考试' },
            { index: '4', path: '/#', name: '查看试卷' },
            { index: '4-1', path: '/publishedExams', name: '我发布的' },
            { index: '4-2', path: '/myExams', name: '我参与的' },

        ],
    }),

    actions: {
        // 切换菜单宽度
        handleMenuWidthChange() {
            this.menuWidth = this.menuWidth === '240px' ? '64px' : '240px'
            this.isCollapse = !this.isCollapse
        },

        // 设置菜单宽度
        setMenuWidth(width) {
            this.menuWidth = width
        },

        // 设置折叠状态
        setCollapse(value) {
            this.isCollapse = value
            this.menuWidth = value ? '64px' : '240px'
        },

    },

    getters: {
        // 获取当前是否折叠
        getIsCollapse: (state) => state.menuWidth === '64px'
    }
})