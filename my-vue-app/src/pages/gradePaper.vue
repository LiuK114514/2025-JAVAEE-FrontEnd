
<template>
  <div class="grading-paper">
    <div class="grading-paper-page">
      <!-- 顶部信息栏 -->
      <el-card class="paper-header" shadow="never">
        <div class="header-left">
<!--          <h2>{{ examData.examName }}</h2>-->
          <span class="student-info">
            考生：{{ paperData.studentName }}
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
const gradeStore = useGradeStore()
const answerCardStore = useAnswerCardStore()
const route = useRoute()
const router = useRouter()

// 从路由获取参数
const examId = route.params.examId
const paperId = route.params.paperId

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
  studentName: '',
  answers: [] // 学生作答数组
})

// 模拟接口请求加载数据
onMounted(async () => {
  // TODO: 替换成真实接口
  examData.value = await gradeStore.fetchExamData(examId)
  paperData.value = await gradeStore.fetchPaperData(paperId)
  // 将题目和学生答案同步到 gradeStore
  gradeStore.initGrading(paperData.value.paperId,examData.value.examId,examData.value.questions, paperData.value.answers)
})

// 提交批改
const submitGrading = async () => {
  const totalScore = gradeStore.calculateTotalScore()
  try {
    await submitGradingApi(paperId, gradeStore.questions)
    ElMessage.success(`批改提交成功，总分 ${totalScore}`)
    router.back()
  } catch (error) {
    ElMessage.error('批改提交失败')
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