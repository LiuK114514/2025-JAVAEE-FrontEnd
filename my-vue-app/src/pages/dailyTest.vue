<template>
  <div class="daily-practice-container">
    <el-container class="main-container">
      <!-- 头部 -->
      <el-header class="app-header">
        <div class="header-content">
          <h1><i class="fas fa-brain"></i> 每日练习题</h1>
          <p class="subtitle">每天一道题，提升你的知识水平</p>
          <div class="date-info">
            <i class="far fa-calendar-alt"></i>
            <span>{{ currentDate }}</span>
          </div>
        </div>
      </el-header>

      <el-container class="content-container">
        <!-- 左侧题目区域 -->
        <el-main class="question-section">
          <!-- 加载状态 -->
          <div v-if="store.loading" class="loading-container">
            <el-skeleton :rows="10" animated />
          </div>

          <!-- 题目内容 -->
          <template v-else>
            <el-card class="question-card" shadow="always">
              <div class="question-header">
                <el-tag
                    :type="getDifficultyType(store.currentQuestion?.difficulty)"
                    size="large"
                >
                  难度：{{ difficultyText }}
                </el-tag>
              </div>

              <div class="question-content">
                <h3 class="question-text">{{ store.currentQuestion?.content || '加载中...' }}</h3>

                <div class="options-container">
                  <el-radio-group
                      v-model="store.selectedOption"
                      :disabled="store.answerSubmitted || store.submitting"
                      class="options-group"
                  >
                    <el-radio
                        v-for="(option, index) in store.currentQuestion?.options || []"
                        :key="index"
                        :label="index"
                        :class="store.getOptionClass(index)"
                        class="option-item"
                        @click="store.selectOption(option.optionKey)"
                    >
                      <div class="option-content">
                        <span class="option-letter">{{ option.optionKey }}: </span>
                        <span class="option-text">{{ option.optionText }}</span>
                      </div>
                    </el-radio>
                  </el-radio-group>
                </div>

                <div class="actions">
                  <el-button
                      type="primary"
                      :disabled="store.selectedOption === null || store.answerSubmitted || store.submitting"
                      @click="handleSubmitAnswer"
                      class="submit-btn"
                      size="large"
                      :loading="store.submitting"
                  >
                    <template #loading>
                      <i class="fas fa-spinner fa-spin"></i>
                      提交中...
                    </template>
                    <template #default>
                      <i class="fas fa-paper-plane"></i>
                      {{ store.answerSubmitted ? '已提交' : '提交答案' }}
                    </template>
                  </el-button>

                  <el-button
                      @click="getRandomQuestion"
                      type="info"
                      plain
                      size="large"
                      :disabled="store.loading"
                  >
                    <i class="fas fa-random"></i>
                    随机题目
                  </el-button>
                </div>

                <!-- 结果展示 -->
                <el-alert
                    v-if="store.answerSubmitted"
                    :title="store.isAnswerCorrect ? '回答正确！' : '回答错误！'"
                    :type="store.isAnswerCorrect ? 'success' : 'error'"
                    :closable="false"
                    show-icon
                    class="result-alert"
                >
                  <div v-if="!store.isAnswerCorrect && store.currentQuestion">
                    <p>正确答案是: <strong>{{ store.currentQuestion.correctAnswer }}</strong></p>
                  </div>
<!--                  <div class="explanation" v-if="store.currentQuestion?.explanation">-->
<!--                    <p><strong>解析：</strong> {{ store.currentQuestion.explanation }}</p>-->
<!--                  </div>-->
                </el-alert>
              </div>
            </el-card>
          </template>
        </el-main>

        <!-- 右侧统计区域 -->
        <el-aside width="320px" class="stats-section">
          <PracticeStats
              :answered-count="answeredCount"
              :total-questions="10"
              :progress-percentage="progressPercentage"/>
          <!--              :correct-rate="store.correctRate"-->
          <!--              :streak-days="store.streakDays"-->
<!--          />-->

          <!-- 历史记录 -->
          <el-card class="history-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span><i class="fas fa-history"></i> 最近记录</span>
                <el-button
                    type="text"
                    size="small"
                    @click="refreshHistory"
                    :loading="refreshingHistory"
                >
                  <i class="fas fa-sync-alt" :class="{ 'fa-spin': refreshingHistory }">暂无记录</i>
                </el-button>
              </div>
            </template>

<!--            <el-scrollbar max-height="200px">-->
<!--              <div-->
<!--                  v-for="(record, index) in store.recentHistory"-->
<!--                  :key="index"-->
<!--                  class="history-item"-->
<!--                  :class="record.correct ? 'correct' : 'incorrect'"-->
<!--              >-->
<!--                <div class="history-content">-->
<!--                  <span class="history-date">{{ store.formatDate(record.date) }}</span>-->
<!--                  <span class="history-category">{{ record.category }}</span>-->
<!--                  <el-tag-->
<!--                      :type="getDifficultyType(record.difficulty)"-->
<!--                      size="small"-->
<!--                  >-->
<!--                    {{ getDifficultyText(record.difficulty) }}-->
<!--                  </el-tag>-->
<!--                </div>-->
<!--              </div>-->

<!--&lt;!&ndash;              <div v-if="store.recentHistory.length === 0" class="empty-history">&ndash;&gt;-->
<!--&lt;!&ndash;                <i class="fas fa-clipboard-list"></i>&ndash;&gt;-->
<!--&lt;!&ndash;                <p>暂无答题记录</p>&ndash;&gt;-->
<!--&lt;!&ndash;&lt;!&ndash;                <el-button type="text" @click="loadPracticeHistory">加载更多</el-button>&ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;              </div>&ndash;&gt;-->
<!--            </el-scrollbar>-->
          </el-card>

          <!-- 学习小贴士 -->
          <el-card class="tip-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span><i class="fas fa-lightbulb"></i> 学习小贴士</span>
              </div>
            </template>

            <div class="tip-content">
              <p>{{ store.dailyTip }}</p>
            </div>
          </el-card>

          <!-- 练习统计详情 -->
<!--          <el-card class="stats-detail-card" shadow="hover" v-if="store.practiceStats">-->
<!--            <template #header>-->
<!--              <div class="card-header">-->
<!--                <span><i class="fas fa-chart-bar"></i> 详细统计</span>-->
<!--              </div>-->
<!--            </template>-->
<!--            <div class="stats-detail">-->
<!--              <div class="stat-item">-->
<!--&lt;!&ndash;                <span class="stat-label">今日练习:</span>&ndash;&gt;-->
<!--&lt;!&ndash;                <span class="stat-value">{{ store.practiceStats.todayCount || 0 }} 题</span>&ndash;&gt;-->
<!--&lt;!&ndash;              </div>&ndash;&gt;-->
<!--&lt;!&ndash;              <div class="stat-item">&ndash;&gt;-->
<!--&lt;!&ndash;                <span class="stat-label">本周练习:</span>&ndash;&gt;-->
<!--&lt;!&ndash;                <span class="stat-value">{{ store.practiceStats.weekCount || 0 }} 题</span>&ndash;&gt;-->
<!--&lt;!&ndash;              </div>&ndash;&gt;-->
<!--&lt;!&ndash;              <div class="stat-item">&ndash;&gt;-->
<!--&lt;!&ndash;                <span class="stat-label">累计练习:</span>&ndash;&gt;-->
<!--&lt;!&ndash;                <span class="stat-value">{{ store.practiceStats.totalCount || 0 }} 题</span>&ndash;&gt;-->
<!--              </div>-->
<!--            </div>-->
<!--          </el-card>-->
        </el-aside>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { usePracticeStore } from '../stores/practiceStore'
import PracticeStats from '../components/PracticeStats.vue'

const store = usePracticeStore()
const refreshingHistory = ref(false)
const currentDate = ref('')
const answeredCount = ref(0)
const totalQuestions = 10

// 计算属性
const difficultyText = computed(() => {
  if (!store.currentQuestion?.difficulty) return '未知'
  const difficultyMap = {
    'easy': '简单',
    'medium': '中等',
    'hard': '困难'
  }
  return difficultyMap[store.currentQuestion.difficulty] || store.currentQuestion.difficulty
})

const progressPercentage = computed(() => {
  return answeredCount.value/totalQuestions
})

// const answeredCount = computed(() => store.history.length)

// const progressPercentage = computed(() => {
//   // 这里可以根据实际需求计算进度
//   // 例如：完成的题目数/总目标数
//   const target = 30 // 假设每月目标30题
//   return Math.min((answeredCount.value / target) * 100, 100)
// })

// 初始化当前日期
const initCurrentDate = () => {
  currentDate.value = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
}

// 组件挂载时初始化
onMounted(async () => {
  //initCurrentDate()

  try {
    // 初始化练习数据
    await store.init()
    answeredCount.value = 0
  } catch (error) {
    console.error('初始化失败:', error)
    ElMessage.error('加载练习数据失败')
  }
})

const getCategoryType = (category) => {
  if (!category) return 'info'
  const typeMap = {
    '前端开发': 'primary',
    'JavaScript': 'success',
    'CSS': 'warning',
    '算法': 'danger',
    '计算机网络': 'info',
    'Vue.js': 'primary',
    'HTML': 'warning',
    'React': 'primary',
    'TypeScript': 'info'
  }
  return typeMap[category] || 'info'
}

const getDifficultyType = (difficulty) => {
  if (!difficulty) return 'info'
  const typeMap = {
    'easy': 'success',
    'medium': 'warning',
    'hard': 'danger'
  }
  return typeMap[difficulty] || 'info'
}

const getDifficultyText = (difficulty) => {
  const difficultyMap = {
    'easy': '简单',
    'medium': '中等',
    'hard': '困难'
  }
  return difficultyMap[difficulty] || difficulty
}

const formatProgress = (percentage) => {
  return `进度: ${percentage.toFixed(1)}%`
}

// 处理提交答案
const handleSubmitAnswer = async () => {
  try {
    const result = await store.submitPracticeAnswer()

    if (result.success) {
      ElMessage.success('答案提交成功！')
      answeredCount.value++
    } else {
      ElMessage.error(result.error || '提交失败')
    }
  } catch (error) {
    console.error('提交答案错误:', error)
    ElMessage.error('提交答案失败，请重试')
  }
}
// 获取随机题目
const getRandomQuestion = async () => {
  try {
    // 注意：这里需要后端提供随机题目接口
    // 暂时使用fetchDailyQuestion作为替代
    const result = await store.fetchDailyQuestion()

    if (result.success) {
      ElMessage.success('已加载随机题目')
    } else {
      ElMessage.error('加载随机题目失败')
    }
  } catch (error) {
    console.error('获取随机题目失败:', error)
    ElMessage.error('获取随机题目失败')
  }
}
</script>

<style scoped>
/* 保持原有样式不变，只添加新增的样式 */

.loading-container {
  padding: 20px;
}

.stats-detail-card {
  border-radius: 12px;
  margin-top: 20px;
}

.stats-detail {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

.stat-value {
  font-weight: 600;
  color: #4b6cb7;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-weight: 600;
  color: #4b6cb7;
}

/* 响应式调整保持原有 */
@media (max-width: 768px) {
  .content-container {
    flex-direction: column;
  }

  .question-section {
    padding-right: 0;
    padding-bottom: 20px;
  }

  .stats-section {
    width: 100%;
  }

  .app-header {
    top:15px;
    padding: 15px 20px;
  }

  .header-content h1 {
    font-size: 1.8rem;
  }

  .actions {
    flex-direction: column;
  }

  .stats-detail-card {
    margin-top: 15px;
  }
}
</style>