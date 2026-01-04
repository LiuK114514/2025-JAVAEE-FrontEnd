
<template>
  <div class="review-paper">
    <div class="review-paper-page">
      <!-- 顶部信息栏 -->
      <el-card class="review-paper-header" shadow="never">
        <div class="header-left">
          <span class="student-info" v-if="userStore.userInfo.name">
            考生：{{ userStore.userInfo.name}}
          </span>
        </div>

        <div class="header-right">
<!--          <el-tag type="success">已结束</el-tag>-->
          <span class="total-score">
            得分：{{totalScore }} / {{ examData.totalScore }}
          </span>
        </div>

        <el-button class="back-btn" type="info" @click="goBack" size="large">
          返回
        </el-button>
      </el-card>

      <!-- 答题卡 (查看模式) -->
      <AnswerCard
          v-if="examData"
          mode="review"
          :exam-data="examData"
          :initial-answers="paperData.answers"
      />
    </div>
  </div>
</template>
<script setup>
import {ref, onMounted, watch, computed} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import AnswerCard from '../components/answerCard.vue'
import { useExamStore } from '../stores/examStore.js'
import {useGradeStore} from "../stores/gradeStore.js";
import {useUserStore} from '../stores/userStore.js'
import { useAnswerCardStore } from "../stores/answerCardStore.js";
import {getReviewPaper} from "../api/exam.js";
const route = useRoute()
const router = useRouter()
const examStore = useExamStore()
const gradeStore = useGradeStore()
const userStore = useUserStore()
const answerCardStore = useAnswerCardStore()
/** 页面状态 */
const stage = ref('review')
const examData = ref({})
const paperData = ref({})
const totalScore = computed(() => {

  const scores = answerCardStore.userScore || []
  return scores.reduce((sum, s) => sum + s, 0)
})

/** 加载试卷数据 */

function normalizeAnswer(answer, type) {
  if (answer == null) return null

  // 多选题
  if (type === 2 || type === 'multiple') {
    return Array.isArray(answer)
        ? answer
        : String(answer)
            .replace(/,/g, '')
            .split('')
  }
  // 判断题
  if (type === 3 || type === 'judge') {
    return String(answer)
  }
  // 填空 / 简答
  return String(answer)
}
const questionTypeMap = {
  1: 'single',
  2: 'multiple',
  3: 'judge',
  4: 'fill',
  5: 'essay'
}
function adaptReviewData(data) {
  const examInfo = data.exam
  const list = data.questionDetailVOList
  const questions = list.map(item => {
    const q = item.questionSimpleInfoVO

    return {
      id: q.questionId,
      type: questionTypeMap[q.type],
      content: q.content,
      score: q.score,
      options: (q.options || []).map(opt => opt.optionText),
      answer: normalizeAnswer(item.correctAnswer, q.type),
      analysis: item.analysis
    }
  })

  const answers = list.map(item =>
      normalizeAnswer(item.userAnswer, item.questionSimpleInfoVO.type)
  )
  answerCardStore.userScore = list.map(item => item.userScore)

  return {
    exam: {
      examId: examInfo.id,
      examName: examInfo.examName,
      description: examInfo.description,
      duration: examInfo.limitMinutes,
      startTime: examInfo.startTime.split('T')[0],
      totalScore: questions.reduce((sum, q) => sum + q.score, 0),
      questions
    },
    paper: {
      answers
    }
  }
}
const loadReviewPaper = async () => {
  try {
    const examId = route.params.examId
    // const res = await getReviewPaper(examId)
    const res={
      "exam": {
        "id": 1001,
        "examName": "Java基础综合测试",
        "examCode": "2024001",
        "creatorId": 2,
        "description": "包含单选、多选、判断、填空、主观题等多种题型的综合测试",
        "startTime": "2024-01-15T09:00:00",
        "endTime": "2024-01-15T11:00:00",
        "limitMinutes": 120,
        "status": 1,
        "paperShow": true,
        "createTime": "2025-12-27T15:37:36",
        "updateTime": "2026-01-01T18:22:13",
        "isDeleted": 0
      },
      "questionDetailVOList": [
        {
          "questionSimpleInfoVO": {
            "questionId": 2004,
            "type": 1,
            "content": "Java中用于创建线程的类是？",
            "score": 5.0,
            "options": [
              {
                "optionKey": "A",
                "optionText": "Thread"
              },
              {
                "optionKey": "B",
                "optionText": "Runnable"
              },
              {
                "optionKey": "C",
                "optionText": "Executor"
              },
              {
                "optionKey": "D",
                "optionText": "Process"
              }
            ]
          },
          "correctAnswer": "A",
          "analysis": null,
          "userAnswer": "A",
          "userScore": 5.0
        },
        {
          "questionSimpleInfoVO": {
            "questionId": 2002,
            "type": 1,
            "content": "以下哪个不是Java的基本数据类型？",
            "score": 5.0,
            "options": [
              {
                "optionKey": "A",
                "optionText": "int"
              },
              {
                "optionKey": "B",
                "optionText": "double"
              },
              {
                "optionKey": "C",
                "optionText": "String"
              },
              {
                "optionKey": "D",
                "optionText": "boolean"
              }
            ]
          },
          "correctAnswer": "C",
          "analysis": null,
          "userAnswer": "C",
          "userScore": 5.0
        },
        {
          "questionSimpleInfoVO": {
            "questionId": 2003,
            "type": 1,
            "content": "String类的哪个方法用于获取字符串长度？",
            "score": 5.0,
            "options": [
              {
                "optionKey": "A",
                "optionText": "size()"
              },
              {
                "optionKey": "B",
                "optionText": "length()"
              },
              {
                "optionKey": "C",
                "optionText": "getLength()"
              },
              {
                "optionKey": "D",
                "optionText": "count()"
              }
            ]
          },
          "correctAnswer": "B",
          "analysis": null,
          "userAnswer": "A",
          "userScore": 0.0
        },
        {
          "questionSimpleInfoVO": {
            "questionId": 2005,
            "type": 2,
            "content": "以下哪些是Java的访问修饰符？",
            "score": 10.0,
            "options": [
              {
                "optionKey": "A",
                "optionText": "public"
              },
              {
                "optionKey": "B",
                "optionText": "private"
              },
              {
                "optionKey": "C",
                "optionText": "protected"
              },
              {
                "optionKey": "D",
                "optionText": "internal"
              }
            ]
          },
          "correctAnswer": "A,B,C",
          "analysis": null,
          "userAnswer": "[\"A\",\"B\",\"C\"]",
          "userScore": 0.0
        },
        {
          "questionSimpleInfoVO": {
            "questionId": 2006,
            "type": 2,
            "content": "以下哪些集合类实现了List接口？",
            "score": 10.0,
            "options": [
              {
                "optionKey": "A",
                "optionText": "ArrayList"
              },
              {
                "optionKey": "B",
                "optionText": "LinkedList"
              },
              {
                "optionKey": "C",
                "optionText": "HashMap"
              },
              {
                "optionKey": "D",
                "optionText": "HashSet"
              }
            ]
          },
          "correctAnswer": "A,B",
          "analysis": null,
          "userAnswer": "A,B",
          "userScore": 10.0
        },
        {
          "questionSimpleInfoVO": {
            "questionId": 2007,
            "type": 2,
            "content": "以下哪些是Java的关键字？",
            "score": 10.0,
            "options": [
              {
                "optionKey": "A",
                "optionText": "class"
              },
              {
                "optionKey": "B",
                "optionText": "interface"
              },
              {
                "optionKey": "C",
                "optionText": "extends"
              },
              {
                "optionKey": "D",
                "optionText": "implements"
              }
            ]
          },
          "correctAnswer": "A,B,C,D",
          "analysis": null,
          "userAnswer": "[\"A\",\"B\"]",
          "userScore": 0.0
        },
        {
          "questionSimpleInfoVO": {
            "questionId": 2011,
            "type": 3,
            "content": "Java中抽象类必须包含抽象方法。",
            "score": 5.0,
            "options": []
          },
          "correctAnswer": "false",
          "analysis": null,
          "userAnswer": "false",
          "userScore": 5.0
        },
        {
          "questionSimpleInfoVO": {
            "questionId": 2010,
            "type": 3,
            "content": "Java中一个类可以实现多个接口。",
            "score": 5.0,
            "options": []
          },
          "correctAnswer": "true",
          "analysis": null,
          "userAnswer": "true",
          "userScore": 5.0
        },
        {
          "questionSimpleInfoVO": {
            "questionId": 2012,
            "type": 4,
            "content": "Java中用于创建对象的操作符是______。",
            "score": 5.0,
            "options": []
          },
          "correctAnswer": "new",
          "analysis": null,
          "userAnswer": "new",
          "userScore": 5.0
        },
        {
          "questionSimpleInfoVO": {
            "questionId": 2013,
            "type": 4,
            "content": "Java中所有类的父类是______。",
            "score": 5.0,
            "options": []
          },
          "correctAnswer": "Object",
          "analysis": null,
          "userAnswer": "Object",
          "userScore": 5.0
        },
        {
          "questionSimpleInfoVO": {
            "questionId": 2014,
            "type": 4,
            "content": "Java中用于处理异常的语句是try-______-finally。",
            "score": 5.0,
            "options": []
          },
          "correctAnswer": "catch",
          "analysis": null,
          "userAnswer": "except",
          "userScore": 0.0
        },
        {
          "questionSimpleInfoVO": {
            "questionId": 2015,
            "type": 4,
            "content": "Java中用于定义常量的关键字是______。",
            "score": 5.0,
            "options": []
          },
          "correctAnswer": "final",
          "analysis": null,
          "userAnswer": "final",
          "userScore": 5.0
        },
        {
          "questionSimpleInfoVO": {
            "questionId": 2016,
            "type": 5,
            "content": "请简述Java中ArrayList和LinkedList的区别，并说明各自的使用场景。",
            "score": 20.0,
            "options": []
          },
          "correctAnswer": "参考答案：ArrayList基于数组实现，查询快插入慢；LinkedList基于链表实现，插入快查询慢。",
          "analysis": null,
          "userAnswer": "ArrayList基于数组实现，查询快插入慢；LinkedList基于链表实现，插入快查询慢。ArrayList适合查询多，LinkedList适合插入删除多。",
          "userScore": 0.0
        },
        {
          "questionSimpleInfoVO": {
            "questionId": 2017,
            "type": 5,
            "content": "请解释Java中多态的概念，并举例说明。",
            "score": 20.0,
            "options": []
          },
          "correctAnswer": "参考答案：多态是指同一操作作用于不同的对象，可以有不同的解释。",
          "analysis": null,
          "userAnswer": "多态是指同一操作作用于不同的对象，可以有不同的解释。例如：Animal animal = new Dog(); animal.speak();",
          "userScore": 0.0
        },
        {
          "questionSimpleInfoVO": {
            "questionId": 2018,
            "type": 5,
            "content": "请说明Java中synchronized关键字的作用和使用场景。",
            "score": 20.0,
            "options": []
          },
          "correctAnswer": "参考答案：synchronized用于实现线程同步，保证同一时刻只有一个线程访问共享资源。",
          "analysis": null,
          "userAnswer": "synchronized用于实现线程同步，保证同一时刻只有一个线程访问共享资源。",
          "userScore": 0.0
        },
        {
          "questionSimpleInfoVO": {
            "questionId": 2019,
            "type": 6,
            "content": "根据图片选择正确的答案（图片题）",
            "score": 5.0,
            "options": [
              {
                "optionKey": "A",
                "optionText": "选项A"
              },
              {
                "optionKey": "B",
                "optionText": "选项B"
              },
              {
                "optionKey": "C",
                "optionText": "选项C"
              },
              {
                "optionKey": "D",
                "optionText": "选项D"
              }
            ]
          },
          "correctAnswer": "B",
          "analysis": null,
          "userAnswer": "B",
          "userScore": 5.0
        }
      ]
    }
    const { exam, paper } = adaptReviewData(res)

    examData.value = exam
    paperData.value = paper
  } catch (e) {
    ElMessage.error('加载试卷失败')
    console.error(e)
  }
}

/** 退出查看 */
const goBack = async () => {
  if (document.fullscreenElement) {
    await document.exitFullscreen()
  }
  router.back()
}

onMounted(async () => {
  await loadReviewPaper()
})
</script>

<style scoped>

.review-paper {
  background: #f0f2f5;
  min-height: 100vh;
}

.review-paper-page {
  max-width: 1200px;
  margin: 0 auto;
}
.review-paper-header{
  display: flex;
  margin-left: 340px;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  position: relative;
}


.header-left h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
}

.student-info {
  display: inline-block;
  margin-left: 15px;
  color: #606266;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.total-score {
  font-weight: bold;
  font-size: 16px;
}

.back-btn {
  position: absolute;
  right: 20px;
  top: 20px;
}

.el-card.paper-header .el-tag {
  font-size: 14px;
  height: 28px;
  line-height: 28px;
}
</style>