import { createWebHashHistory, createRouter } from 'vue-router'
import Index from '../pages/index.vue'
import Login from '../pages/loginRegister/loginRegister.vue'
import PublishTest from '../pages/publishTest.vue'
import Layout from '../components/Layout/layout.vue'
import PublishedExams from '../pages/publishedExams.vue'
import AnswerExam from '../pages/answerExam.vue'

const routes = [
    { path: '/',
      component: Layout,
      children:[
          {
              path:'publishTest',
              component:PublishTest,
              meta:{title:"发布考试"}
          },
          {
              path:'',
              component:PublishTest,
              meta:{title:"发布考试"}
          },
          {
              path:'publishedExams',
              component:PublishedExams,
              meta: {title: "我发布的考试"}
          },
          {
              path:'answerExam',
              component:AnswerExam,
              meta: {title: "我参与的考试"}
          },
          {
              path: 'answerExam/:id',
              component:AnswerExam,
              meta: {
                  title: '在线考试',
                  fullscreen: true
              }
          }
      ]

    },

]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

export default router
