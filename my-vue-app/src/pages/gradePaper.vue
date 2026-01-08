
<template>
  <div class="grading-paper">
    <div class="grading-paper-page">
      <!-- 顶部信息栏 -->
      <el-card class="paper-header" shadow="never">
        <div class="header-left">
<!--          <h2>{{ examData.examName }}</h2>-->
          <span class="student-info">
            考生：{{studentName }}
          </span>
        </div>

        <div class="header-right">
          <el-tag type="warning">批改中</el-tag>
          <span class="total-score">
          当前得分：{{ gradeStore.calculateTotalScore() }} / {{ examData.totalScore }}
          </span>
        </div>

        <el-button class="back-btn" type="info" @click="goBack" size="large">
          返回
        </el-button>
      </el-card>

      <!-- 答题卡 -->
      <AnswerCard
          mode="grade"
          :exam-data="examData"
          :initial-answers="paperData.answers"
          @submitGrade="submitGrading"
      />
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AnswerCard from '../components/answerCard.vue'
import { ElMessage } from 'element-plus'
import { useAnswerCardStore } from '../stores/answerCardStore.js'
import {useGradeStore} from "../stores/gradeStore.js";
import {getGradePaper, getReviewPaper} from "../api/exam.js";
const gradeStore = useGradeStore()
const answerCardStore = useAnswerCardStore()
const route = useRoute()
const router = useRouter()



// examData：试卷信息
const examData = ref({
  examId: null,
  examName: '',
  totalScore: 100,
  questions: []
})

// paperData：学生答卷信息
const paperData = ref({
  paperId: null,

  answers: [] // 学生作答数组
})
const studentName = ref({})
const isGraded=ref({})
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
    return String(answer).toLowerCase() === 'true'
  }
  // 填空 / 简答/单选
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
      analysis: item.analysis,
      userScore: item.userScore
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
// 从路由获取参数
const examId = Number(route.params.examId)
const paperId = Number(route.params.paperId)
// 模拟接口请求加载数据
onMounted(async () => {
  try {

    studentName.value =route.params.name
    const res = await getGradePaper(examId,paperId)
    console.log("批改测试", res)
    const { exam, paper } = adaptReviewData(res)

    examData.value = exam
    paperData.value = paper
  } catch (e) {
    ElMessage.error('加载试卷失败')
    console.error(e)
  }
  // 将题目和学生答案同步到 gradeStore
  gradeStore.initGrading(paperData.value.paperId,examData.value.examId,examData.value.questions, paperData.value.answers)
})

// 提交批改
const submitGrading = async () => {
  const success = await gradeStore.submitGrade(paperId)

  if (success) {
    ElMessage.success('评分提交成功')
  } else {
    ElMessage.error('评分提交失败')
  }
}
//返回
const goBack = () => {
  router.back()  // 返回上一页
  if (document.fullscreenElement) {
    document.exitFullscreen();
  }
}
</script>

<style scoped>
.paper-header {
  display: flex;
  margin-left: 340px;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  position: relative;
}

.header-left {
  display: flex;
  flex-direction: column;
}

.header-left h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.student-info {
  margin-top: 4px;
  color: #606266;
  font-size: 25px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px; /* 标签和总分之间的间距 */
}

.total-score {
  font-weight: 500;
  color: #409EFF; /* 蓝色，与 Element 风格一致 */
}


/* 返回按钮固定在右上角 */
.back-btn {
  position: absolute;
  top: 16px;
  right: 24px;
}

</style>