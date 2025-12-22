import { createWebHashHistory, createRouter } from 'vue-router'
import Index from '../pages/index.vue'
import Login from '../pages/loginRegister/loginRegister.vue'
import PublishTest from '../pages/publishTest.vue'
import Layout from '../components/Layout/layout.vue'
import PublishedExams from '../pages/publishedExams.vue'
import AnswerExam from '../pages/answerExam.vue'
import GradingPaper from '../pages/gradePaper.vue'
import MyExams from "../pages/myExams.vue";
import Review from '../pages/reviewPaper.vue'
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
              meta: {title: "参与考试"}
          },
          {
              path: 'answerExam/:id',
              component:AnswerExam,
              meta: {
                  title: '在线考试',
                  fullscreen: true
              }
          },
          {
              path: 'grade/:examId/:paperId',
              component: GradingPaper,
              meta: {
                  title: '试卷批改',
                  fullscreen: true
              }
          },
          {
            path: 'myExams',
            component: MyExams,
            meta: {title: "我参与的考试"}
          },
          {
              path: 'review/:examId',
              component: Review,
              meta: {
                  title: '试卷查看',
                  fullscreen: true
              }
          },
      ]

    },

]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

export default router
