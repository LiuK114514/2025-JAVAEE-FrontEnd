import { createWebHashHistory, createRouter } from 'vue-router'
import Login from '../pages/loginRegister/loginRegister.vue'
import Layout from '../components/Layout/layout.vue'
import LoginRegister from "../pages/loginRegister/loginRegister.vue";
import createTest from "../pages/createTest.vue";
import joinExam from "../pages/joinExam.vue";
import dailyTest from "../pages/dailyTest.vue";
const routes = [
    { path: '/',
      component: Layout,
      children:[

      ]
    },
    // {
    //     path: '/login',
    //     component: LoginRegister,
    //     meta:{
    //         title:"登录注册"
    //     }
    // },
    // {
    //     path: '/create',
    //     component: createTest,
    //     meta:{
    //         title:"创建考试"
    //     }
    // },
    // {
    //     path:'/joinExam',
    //     component: joinExam,
    //     meta:{
    //         title:"参与考试"
    //     }
    // },
    {
        path:'/dailyTest',
        component: dailyTest,
        meta:{
            title: "每日练习"
        }
    },
    {
        path: '/admin',
        name: 'AdminDashboard',
        component: () => import('../pages/admin.vue'),
        meta: {
            title: '后台管理',
            requiresAuth: true,
            requiresAdmin: true
        },
        //beforeEnter: checkAdminPermission
    },
    {
        path: '/admin/operation-logs',
        name: 'OperationLog',
        component: () => import('../pages/operationLog.vue'),
        meta: {
            title: '操作日志详情',
            requiresAuth: true,
            requiresAdmin: true
        },
        //beforeEnter: checkAdminPermission
    }

]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

// const checkAdminPermission = (to, from, next) => {
//     const userStore = useUserStore?.() || { hasRole: () => false }
//
//     if (userStore.hasRole('admin')) {
//         next()
//     } else {
//         next('/practice')
//         ElMessage.error('权限不足，无法访问管理后台')
//     }
// }

// 全局路由守卫
// router.beforeEach((to, from, next) => {
//     // 设置页面标题
//     if (to.meta.title) {
//         document.title = `${to.meta.title} - 考试练习系统`
//     }
//
//     // 检查是否需要登录
//     if (to.meta.requiresAuth) {
//         const token = localStorage.getItem('token')
//         if (!token) {
//             next('/practice')
//             ElMessage.error('请先登录')
//             return
//         }
//     }
//
//     next()
// })


export default router