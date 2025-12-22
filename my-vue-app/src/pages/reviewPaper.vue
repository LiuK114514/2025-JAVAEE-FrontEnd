
<template>
  <div class="review-paper">
    <div class="review-paper-page">
      <!-- 顶部信息栏 -->
      <el-card class="review-paper-header" shadow="never">
        <div class="header-left">
          <span class="student-info" v-if="paperData.studentName">
            考生：{{ paperData.studentName }}
          </span>
        </div>

        <div class="header-right">
          <el-tag type="success">已结束</el-tag>
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
const loadReviewPaper = async () => {
  try {
    const userId = '2'
    const examId = route.params.examId
    // 获取试卷信息
    examData.value = await answerCardStore.fetchExamData(examId)
    // 获取当前用户的答卷
    paperData.value = await answerCardStore.fetchAnswerRecord(userId)
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