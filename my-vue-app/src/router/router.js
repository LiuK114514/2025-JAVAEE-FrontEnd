import { createWebHashHistory, createRouter } from 'vue-router'
import Login from '../pages/loginRegister/loginRegister.vue'
import PublishTest from '../pages/publishTest.vue'
import Layout from '../components/Layout/layout.vue'
import PublishedExams from '../pages/publishedExams.vue'
import AnswerExam from '../pages/answerExam.vue'
import GradingPaper from '../pages/gradePaper.vue'
import MyExams from "../pages/myExams.vue";
import Review from '../pages/reviewPaper.vue'
import LoginRegister from "../pages/loginRegister/loginRegister.vue";
import createTest from "../pages/createTest.vue";
import joinExam from "../pages/joinExam.vue";
import dailyTest from "../pages/dailyTest.vue";
import QueryExam from "../pages/queryExam.vue";
import {ElMessage} from "element-plus";
import {useUserStore} from "../stores/userStore.js";
const checkAdminPermission = (to, from, next) => {
    const userStore = useUserStore?.() || { hasRole: () => false }

    if (userStore.isAdmin) {
        next()
    } else {
        next('/')
        ElMessage.error('权限不足，无法访问管理后台')
    }
}

const routes = [
    { path: '/',
      component: Layout,
      children:[
          {
              path:'publishTest',
              component:PublishTest,
              meta:{
                  title:"发布考试",
                  requiresAuth: true
              }
          },
          {
              path:'',
              component:PublishTest,
              meta:{
                  title:"发布考试",
                  requiresAuth: true
              }
          },
          {
              path:'publishedExams',
              component:PublishedExams,
              meta: {
                  title: "我发布的考试",
                  requiresAuth: true
              }
          },
          {
              path: 'answerExam/:id',
              component:AnswerExam,
              meta: {
                  title: '在线考试',
                  fullscreen: true,
                  requiresAuth: true
              }
          },
          {
              path:'queryExam',
              component:QueryExam,
              meta: {
                  title: "参与考试",
                  requiresAuth: true
              }
          },

          {
              path: 'grade/:examId/:paperId/:name',
              component: GradingPaper,
              meta: {
                  title: '试卷批改',
                  fullscreen: true,
                  requiresAuth: true
              }
          },
          {
            path: 'myExams',
            component: MyExams,
            meta: {
                title: "我参与的考试",
                requiresAuth: true
            }
          },
          {
              path: 'review/:examId',
              component: Review,
              meta: {
                  title: '试卷查看',
                  fullscreen: true,
                  requiresAuth: true
              }
          },
          {
              path:'dailyTest',
              component: dailyTest,
              meta:{
                  title: "每日练习"
              }
          },
      ]

    },
    {
        path: '/login',
        component: () => import('../pages/loginRegister/loginRegister.vue'),
        meta:{
            title:"登录注册"
        }
    },
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
        path: '/admin',
        name: 'AdminDashboard',
        component: () => import('../pages/admin.vue'),
        meta: {
            title: '后台管理',
            requiresAuth: true,
            requiresAdmin: true
        },
        beforeEnter: checkAdminPermission
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
        beforeEnter: checkAdminPermission
    }

]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})


//全局路由守卫
router.beforeEach((to, from, next) => {
    // 设置页面标题
    if (to.meta.title) {
        document.title = `${to.meta.title} - 考试练习系统`
    }

    // 检查是否需要登录
    if (to.meta.requiresAuth) {
        const token = localStorage.getItem('token')
        if (!token || token === 'null') {
            ElMessage.error('请先登录')
            return next('/login')
        }
    }

    next()
})

export default router
