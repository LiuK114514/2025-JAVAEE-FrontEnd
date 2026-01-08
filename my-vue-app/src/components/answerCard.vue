<template>
  <div class="exam-answer-layout">
    <!-- 左侧答题卡导航 -->
    <div class="answer-card-sidebar"
         :class="{
        'answer-mode': mode === 'answer',
        'grade-mode': mode === 'grade' || mode === 'review'
      }">
      <!-- 考试时间信息 -->
      <div v-if="mode === 'answer'" class="exam-timer-panel">
        <div class="timer-item">
          <span class="label">考试时长</span>
          <span class="value">{{ answerStore.currentExam?.duration }} 分钟</span>
        </div>
        <div class="timer-item danger">
          <span class="label">剩余时间</span>
          <span class="value">{{ formatTime(answerStore.remainingTime) }}</span>
        </div>
      </div>

      <div class="answer-card-header">
        <span>答题卡 ({{ answerStore.answeredCount }}/{{ answerStore.currentExam?.questions.length }})</span>
      </div>
      <div class="answer-card-grid">
        <div
            v-for="(question, index) in answerStore.currentExam?.questions"
            :key="question.id"
            :class="getAnswerCardClass(index)"
            @click="jumpToQuestion(index)"
        >
          {{ index + 1 }}
        </div>
      </div>
      <div class="answer-card-legend">
        <span v-if="mode === 'answer'"><i class="legend-dot answered"></i>已答 ({{ answerStore.answeredCount }})</span>
        <span v-if="mode === 'answer'"><i class="legend-dot"></i>未答 ({{ answerStore.unansweredCount }})</span>
        <span v-if="mode === 'review'"><i class="legend-dot correct"></i>正确</span>
        <span v-if="mode === 'review'"><i class="legend-dot wrong"></i>错误</span>
      </div>
      <div v-if="mode === 'answer'" class="progress-info">
        <el-progress :percentage="answerStore.progressPercentage" :color="getProgressColor()" />
      </div>
    </div>

    <!-- 右侧题目区域 -->
    <div class="questions-panel">
      <!-- 试卷头部信息 -->
      <div class="exam-header">
        <h1 class="exam-title">{{ answerStore.currentExam?.examName }}</h1>
        <div class="exam-info">
        </div>
      </div>

      <!-- 题目列表 -->
      <div class="questions-container">
        <div
            v-for="(question, index) in answerStore.currentExam?.questions"
            :key="question.id"
            :id="'question-' + index"
            class="question-item"
        >
          <!-- 题目标题 -->
          <div class="question-header">
            <div class="question-title-row">
              <span class="question-number">{{ index + 1 }}.</span>
              <el-tag :type="getTypeTag(question.type)" size="small">
                {{ getTypeName(question.type) }}
              </el-tag>
              <span class="question-score">{{ question.score }}分</span>
              <span v-if="( mode === 'grade') && gradeStore.currentGrading.questions[index].userScore !== undefined" class="user-score">
              得分: {{gradeStore.currentGrading.questions[index].userScore }}分
              </span>
              <span v-if="mode === 'review'" class="user-score">
                得分：{{answerStore.userScore[index]}}
              </span>
            </div>
          </div>

          <!-- 题目内容 -->
          <div class="question-content" v-html="question.content"></div>

          <!-- 选项区域 (单选/多选) -->
          <div class="question-options" v-if="question.type === 'single' || question.type === 'multiple'">
            <!-- 单选题 -->
            <div class="custom-options" v-if="question.type === 'single'">
              <div
                  v-for="(option, optIndex) in question.options"
                  :key="optIndex"
                  class="option-item"
                  :class="[
                    getOptionClass(question, optIndex, index),
                    (mode === 'review' || mode === 'grade') ? 'disabled' : ''
                  ]"
                  @click=" answerStore.updateAnswer(index, optIndex)"
              >
                <span class="option-box">{{ String.fromCharCode(65 + optIndex) }}</span>
                <span class="option-text" v-html="option"></span>
                <el-icon
                    v-if="(mode === 'review' || mode === 'grade')
                    && isCorrectOption(question, optIndex,index)"
                    class="correct-icon"
                >
                  <Check />
                </el-icon>

                <el-icon
                    v-if="(mode === 'review' || mode === 'grade')
                    && isWrongOption(question, optIndex, answerStore.userAnswers[index])"
                    class="wrong-icon"
                >
                  <Close />
                </el-icon>
              </div>
            </div>

            <!-- 多选题 -->
            <div class="custom-options" v-if="question.type === 'multiple'">
              <div
                  v-for="(option, optIndex) in question.options"
                  :key="optIndex"
                  class="option-item"
                  :class="[
                    getOptionClass(question, optIndex, index),
                    (mode === 'review' || mode === 'grade') ? 'disabled' : ''
                  ]"
                  @click=" handleSingleClick(index, optIndex)"
              >
                <span class="option-box">{{ String.fromCharCode(65 + optIndex) }}</span>
                <span class="option-text" v-html="option"></span>
                <el-icon
                    v-if="(mode === 'review' || mode === 'grade')
                    && isCorrectMultipleOption(question, optIndex,index)"
                    class="correct-icon"
                >
                  <Check />
                </el-icon>

                <el-icon
                    v-if="(mode === 'review' || mode === 'grade')
                    && isWrongMultipleOption(question, optIndex, answerStore.userAnswers[index])"
                    class="wrong-icon"
                >
                  <Close />
                </el-icon>
              </div>
            </div>
          </div>

          <!-- 判断题 -->
          <div v-if="question.type === 'judge'" class="question-options">
            <el-radio-group
                :model-value="answerStore.userAnswers[index]"
                @update:model-value="(val) => answerStore.updateJudgeAnswer(index, val)"
                :disabled="mode === 'review'||mode === 'grade'" >
              <el-radio
                  label="true"
                  :class="getJudgeOptionClass(question, 'true', index)"
                  border>正确
              </el-radio>
              <el-radio
                  label="false"
                  :class="getJudgeOptionClass(question, 'false', index)"
                  border> 错误
              </el-radio>
            </el-radio-group>
          </div>

          <!-- 填空题 -->
          <div v-if="question.type === 'fill'" class="question-answer-area">
            <el-input
                v-model="answerStore.userAnswers[index]"
                type="textarea"
                :rows="3"
                placeholder="请输入答案"
                :disabled="mode === 'review'||mode==='grade'"
            />
          </div>
          <!-- 简答题 -->
          <div v-if="question.type === 'essay'" class="question-answer-area">
            <el-input
                v-model="answerStore.userAnswers[index]"
                type="textarea"
                :rows="6"
                placeholder="请输入答案"
                :disabled="mode === 'review'||mode==='grade'"
            />
          </div>

          <!-- 答案解析 (查看模式) -->
          <div v-if="mode === 'review'" class="question-analysis">
            <!-- 正确答案 -->
            <div class="correct-answer">
              <strong>正确答案：</strong>
              <span v-if="question.type === 'single' || question.type === 'judge'">
                {{ formatAnswer(question) }}
              </span>
              <span v-else-if="question.type === 'multiple'">
                {{ formatMultipleAnswer(question) }}
              </span>
              <span v-else>
                {{ question.answer }}
              </span>
            </div>

            <!-- 原有人工解析 -->
            <div v-if="question.analysis" class="analysis-content">
              <strong>答案解析：</strong>
              <span v-html="question.analysis"></span>
            </div>

            <!-- AI 解析操作区 -->
            <div class="ai-analysis">
              <el-button
                  size="small"
                  type="primary"
                  plain
                  :loading="aiLoading"
                  @click="askAI(question,index)"
              >
                问 AI
              </el-button>
            </div>

            <!-- AI 解析结果 -->
            <el-collapse v-if="aiAnswer">
              <el-collapse-item title="AI 智能解析（仅供参考）">
                <div class="ai-content" v-html="aiAnswer"></div>
              </el-collapse-item>
            </el-collapse>

          </div>

          <!-- 批改模式下的评分 -->
          <div v-if="mode === 'grade' && (question.type === 'fill' || question.type === 'essay')"
               class="grade-section"> <div class="student-answer">
            <strong>考生答案: </strong>
            <div v-html="answerStore.userAnswers[index] || '未作答'"></div>
          </div>
            <div class="reference-answer">
              <strong>参考答案: </strong>
              <div v-html="question.answer"></div>
            </div>
            <div v-if="mode === 'grade'" class="grade-input">
              <span>评分：</span>
              <el-input-number
                  v-model="gradeStore.questionScores[index]"
                  :min="0"
                  :max="question.score"
                  :step="0.5"
                  size="small"
                  @change="val => gradeStore.updateQuestionScore(index, val)"
              />
              <span>/ {{ question.score }} 分</span>
            </div>
          </div>
        </div>
          <!-- 题目分割线 -->
          <el-divider v-if="index <answerStore.currentExam?.questions.length - 1" />
        </div>
      <!-- 底部操作栏 -->
      <div class="exam-footer">
        <div class="footer-left">
          <span v-if="mode === 'answer'" class="progress-text">
            已答 {{ answerStore?.answeredCount }}/{{answerStore.currentExam?.questions.length }} 题
          </span>
        </div>
        <div class="footer-right">
<!--          <el-button v-if="mode === 'answer'" @click="handleSaveDraft">保存草稿</el-button>-->
          <el-button v-if="mode === 'answer'" type="primary" @click="handleSubmit()" :loading="answerStore.isSubmitting"
                     :disabled="!canSubmit">{{ canSubmit ? '提交试卷' : '考试开始 10 分钟后才能交卷' }}</el-button>
          <el-button v-if="mode === 'grade'" type="primary" @click="handleSubmitGrade">
            提交批改 ({{ gradeStore.calculateTotalScore() }}分)
          </el-button>
<!--          <el-button v-if="mode === 'review'" @click="handleClose">关闭</el-button>-->
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import {ref, onMounted, onUnmounted, computed, watch} from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAnswerCardStore } from '../stores/answerCardStore.js'
import { useGradeStore } from '../stores/gradeStore'
import { useExamStore } from '../stores/examStore'
import {Check, Close} from "@element-plus/icons-vue";
import router from "../router/router.js";
import {getAIAnswer} from "../api/exam.js";
import { marked } from 'marked'
const answerStore = useAnswerCardStore()
const gradeStore = useGradeStore()
const examStore = useExamStore()
const props = defineProps({
  mode: {
    type: String,
    default: 'answer',
    validator: (value) => ['answer', 'review', 'grade'].includes(value)
  },
  examData: {
    type: Object,
    required: true
  },
  initialAnswers: {
    type: Object,
    default: () => ({})
  },
  gradeId: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['submit', 'saveDraft', 'submitGrade', 'close'])


const showAnswerCard = ref(false)
const currentQuestionIndex = ref(0)
let timer = null


const typeLabelMap = {
  single: "单选题",
  multiple: "多选题",
  fill: "填空题",
  judge: "判断题",
  essay: "简答题"
}

const typeTagMap = {
  single: "success",
  multiple: "warning",
  fill: "info",
  judge: "primary",
  essay: "danger"
}

const getTypeName = (type) => typeLabelMap[type] || "未知类型"
const getTypeTag = (type) => typeTagMap[type] || ""

// ==================== 生命周期 ====================
onMounted(async () => {
  if (props.mode === 'answer') {
    // 答题模式 - 初始化试卷

    startTimer()
    window.addEventListener('beforeunload', handleBeforeUnload)
  }
  // if (props.mode === 'grade') {
  //   // 批改模式下，把题目和学生答案同步到 answerStore
  //   answerStore.initExam(props.examData)
  //   answerStore.initAnswers(props.initialAnswers)
  //   console.log(props.examData)
  // }

})
//确保试卷和答案渲染成功
const isReadyForInit = computed(() => {
  return  (props.mode === 'grade' || props.mode === 'review') &&
      props.examData?.questions?.length &&
      props.initialAnswers?.length
})
watch(
    isReadyForInit,
    (ready) => {
      if (ready) {
        answerStore.initExam(props.examData)
        answerStore.initAnswers(props.initialAnswers)
      }
    },
    { immediate: true }
)

onUnmounted(() => {
  clearTimer()
  if (props.mode === 'answer') {
    window.removeEventListener('beforeunload', handleBeforeUnload)
  }
})

// ==================== 倒计时相关 ====================

const startTimer = () => {
  timer = setInterval(() => {
    if (answerStore.remainingTime > 0) {
      answerStore.updateRemainingTime(answerStore.remainingTime - 1)
    } else {
      clearTimer()
      handleTimeUp()
    }
  }, 1000)
}
//开考10分钟内不允许交卷
const canSubmit = computed(() => {
  const exam = answerStore.currentExam
  if (!exam || !exam.duration) return false
  const usedTime =
      exam.duration* 60 - answerStore.remainingTime
  return usedTime >= 6   // 10 分钟
})
const clearTimer = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

const formatTime = (seconds) => {
  seconds = Math.max(0, Math.floor(seconds)); // 取整且保证不为负
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  // 格式化成 hh:mm:ss
  const hh = h.toString().padStart(2, '0');
  const mm = m.toString().padStart(2, '0');
  const ss = s.toString().padStart(2, '0');

  return `${hh}:${mm}:${ss}`;
}



// ==================== 答题卡相关 ====================
//单选选项渲染
const getOptionClass = (question, optIndex, index) => {
  const letter = String.fromCharCode(65 + optIndex)
  const studentAnswer = answerStore.userAnswers[index]

  if (props.mode === 'grade' || props.mode === 'review') {
    // 批改模式
    if (question.type === 'single') {
      if (studentAnswer === letter) {
        // 学生选了这个选项
        return studentAnswer === question.answer ? 'correct' : 'wrong'
      } else if (letter === question.answer) {
        // 正确答案，但学生没选
        return 'correct-unselected'
      }
    }
    // 多选题类似处理
    if (question.type === 'multiple') {
      const selected = studentAnswer || []
      if (selected.includes(letter)) {
        return question.answer.includes(letter) ? 'correct' : 'wrong'
      } else if (question.answer.includes(letter)) {
        return 'correct-unselected'
      }
    }
  } else {
    // 答题模式
    if (question.type === 'single') {
      return studentAnswer === letter ? 'selected' : ''
    }
    if (question.type === 'multiple') {
      return (studentAnswer || []).includes(letter) ? 'selected' : ''
    }
  }

  return ''
}
//多选题更新答案
const handleSingleClick=(index, optIndex)=> {
  if (props.mode !== 'review' && props.mode !== 'grade') {
    answerStore.updateMultipleAnswer (index, optIndex)
  }
}

const getAnswerCardClass = (index) => {
  const classes = ['answer-card-item']

  if (currentQuestionIndex.value === index) {
    classes.push('active')
  }

  const answer = answerStore.userAnswers[index]
  const isAnswered = Array.isArray(answer) ? answer.length > 0 : answer != null

  if (isAnswered) {
    classes.push('answered')
  }

  if (props.mode === 'grade') {
    const question =gradeStore.currentGrading.questions[index]
    const userScore = gradeStore.currentGrading.questions[index]?.userScore ?? 0 // 学生实际得分
    if (userScore === question.score) {
      classes.push('correct')
    }
    else {
      classes.push('wrong')
    }
  }
  else if(props.mode === 'review') {
    const question =answerStore.currentExam.questions[index]
    const userScore = answerStore.userScore[index] ?? 0 // 学生实际得分
    if (userScore === question.score) {
      classes.push('correct')
    }
    else {
      classes.push('wrong')
    }
  }
  return classes.join(' ')
}

const jumpToQuestion = (index) => {
  currentQuestionIndex.value = index
  const element = document.getElementById('question-' + index)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const getProgressColor = () => {
  const percentage =answerStore.progressPercentage
  if (percentage < 30) return '#f56c6c'
  if (percentage < 70) return '#e6a23c'
  return '#67c23a'
}


//判断题选项渲染
const getJudgeOptionClass = (question, value, index) => {

  const correctAnswer = String(question.answer);          // 'true' / 'false'
  const userAnswer = String(answerStore.userAnswers[index]);
  const optionValue = String(value);
  if (props.mode === 'answer') {
    if (userAnswer === optionValue) {
      return 'judge-selected';
    }
    return '';
  }

  if (props.mode === 'review' || props.mode === 'grade') {
    // 选中且正确 → 绿色
    if (userAnswer === optionValue && optionValue === correctAnswer) {
      return 'judge-selected-correct';
    }

    // 选中但错误 → 蓝色
    if (userAnswer === optionValue && optionValue !== correctAnswer) {
      return 'judge-selected-wrong';
    }

    // 正确答案（未被选） → 红色
    if (optionValue === correctAnswer) {
      return 'judge-correct-answer';
    }
  }


  return ''
}
//判断单选选项是否正确来渲染√或×
const isCorrectOption = (question, optIndex,index) => {
  const optionLabel = String.fromCharCode(65 + optIndex)

  if (question.type === 'single') {
    return question.answer === optionLabel && answerStore.userAnswers[index] === optionLabel
  }
  return false
}
//判断多选选项
const isCorrectMultipleOption= (question, optIndex,index)=>{
  const optionLabel = String.fromCharCode(65 + optIndex)
  if (question.type === 'multiple') {
    return Array.isArray(question.answer)
        && question.answer.includes(optionLabel)&& answerStore.userAnswers[index].includes(optionLabel)
  }
  return false
}
//判断单选是否是正确来决定渲染情况
const isWrongOption = (question, optIndex, userAnswer) => {
  const optionLabel = String.fromCharCode(65 + optIndex)
  return userAnswer === optionLabel && question.answer !== optionLabel
}
//判断多选是否是正确来决定渲染情况
const isWrongMultipleOption = (question, optIndex, userAnswer) => {
  const optionLabel = String.fromCharCode(65 + optIndex)
  return userAnswer && userAnswer.includes(optionLabel) && !question.answer?.includes(optionLabel)
}



const formatAnswer = (question) => {
  if (question.type === 'judge') {
    return question.answer === 'true' ? '正确' : '错误'
  }
  return question.answer
}

const formatMultipleAnswer = (question) => {
  return question.answer?.join(', ') || ''
}

const getScoreTagType = () => {
  const totalScore = gradeStore.calculateTotalScore()
  const maxScore = answerStore.totalScore
  const percentage = (totalScore / maxScore) * 100
  if (percentage >= 90) return 'success'
  if (percentage >= 60) return 'warning'
  return 'danger'
}
//有未答题时，只要用户确认，或者是自动提交，就可以提交
const isSubmitting = ref(false)
const handleSubmit = async (isAutoSubmit = false) => {
  // 防止重复提交
  if (isSubmitting.value) return

  // 手动提交 + 有未答题 → 需要确认
  if (answerStore.unansweredCount > 0 && !isAutoSubmit) {
    try {
      await ElMessageBox.confirm(
          `还有 ${answerStore.unansweredCount} 道题未作答，确定要提交吗？`,
          '提示',
          {
            confirmButtonText: '确定提交',
            cancelButtonText: '继续答题',
            type: 'warning',
            closeOnClickModal: false,
            closeOnPressEscape: false
          }
      )
    } catch {
      // 用户取消
      return
    }
  }

  // 到这里说明：
  // 1. 没有未答题
  // 2. 或有未答题但用户已确认
  // 3. 或是自动提交
  await doSubmit()
}

//时间到处理（自动提交）
const handleTimeUp = async () => {
  // 已提交则不再处理
  if (isSubmitting.value) return

  await ElMessageBox.alert(
      '考试时间已到，系统将自动提交试卷。',
      '提示',
      {
        confirmButtonText: '确定',
        showClose: false,
        closeOnClickModal: false,
        closeOnPressEscape: false
      }
  )

  await handleSubmit(true)
}

const doSubmit =async () => {
  clearTimer()
  emit('submit')
}

const handleSubmitGrade = async () => {
emit("submitGrade")
}

const handleClose = () => {
  emit('close')
}

const handleBeforeUnload = (e) => {
  if (answerStore.currentExam && !answerStore.isSubmitting) {
    e.preventDefault()
    e.returnValue = '确定要离开吗?未保存的答案将丢失'
  }
}

//问AI
const aiLoading = ref(false)
const aiAnswer = ref('')
const askAI = async (question,index) => {
  if (aiAnswer.value) return   // 已获取过，不重复请求
  aiLoading.value = true
  try {
    const prompt = {
      type:question.type,
      content:question.content,
      options:question.options||null,
      answer:question.answer,
      userAnswer:answerStore.userAnswers[index] || '未作答'
    }

    const res = await getAIAnswer(prompt)
    console.log(res)
    // 安全获取 AI 返回内容
    const content = res?.choices?.[0]?.message?.content || 'AI 未返回内容'
    // 使用 marked 转成 HTML
    aiAnswer.value = marked(content)
  } catch (e) {
    console.log(e)
    ElMessage.error('获取 AI 解析失败')
  } finally {
    aiLoading.value = false
  }
}
</script>

<style scoped>
.question-analysis {
  margin-top: 12px;
}

.ai-analysis {
  margin-top: 10px;
}

.ai-content {
  line-height: 1.8;
  color: #333;
  font-size: 14px;
}
.exam-timer-panel {
  padding: 16px;
  margin-bottom: 16px;
  background-color: #f5f7fa;
  box-shadow: inset 0 0 0 1px #e4e7ed;
}

.timer-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  font-size: 15px;
  color: #303133;
}

.timer-item + .timer-item {
  border-top: 1px dashed #dcdfe6;
}

.timer-item .label {
  font-weight: 500;
  color: #606266;
}

.timer-item .value {
  font-size: 18px;
  font-weight: 600;
}

/* 剩余时间高亮 */
.timer-item.danger .value {
  color: #f56c6c;
}

.option-item {
  display: flex;
  width: 30%;
  align-items: center;
  padding: 6px 10px;
  margin-bottom: 5px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.option-item.selected .option-box{
  background-color: #409eff;
  color: #fff;
}

.option-item.correct .option-box{
  background-color: #67c23a;
  color: #fff;
}

.option-item.wrong  .option-box{
  background-color: #409eff;
  color: #fff;
}

.option-item.correct-unselected .option-box{

  background-color: #f56c6c;
  color: #fff;
}

:deep(.is-bordered.judge-selected) {
  border-color: #409eff !important;
  background-color: #ecf5ff;
  color: #409eff;
}
:deep(.judge-selected-correct.is-bordered) {
  border-color: #67c23a !important;
  background-color: #f0f9eb;
  color: #67c23a;
}

:deep(.judge-selected-wrong.is-bordered) {
  border-color: #409eff !important;
  background-color: #ecf5ff;
  color: #409eff;
}

:deep(.judge-correct-answer.is-bordered) {
  border-color: #f56c6c !important;
  background-color: #fef0f0;
  color: #f56c6c;
}

.option-box {
  display: inline-block;
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  border-radius: 50%;
  border: 1px solid #ccc;
  margin-right: 8px;
}

.option-text {
  flex: 1;
}
.option-item.disabled {
  pointer-events: none; /* 禁止点击 */
  opacity: 0.6;         /* 显示半透明效果 */
  cursor: not-allowed;
}
/* =========================
   批改评分区（紧凑红色风格）
========================= */
.grade-section {
  margin-top: 12px;
  padding: 10px 12px;
  background: #fff1f0;           /* 浅红背景 */
  border: 1px solid #fbc4c4;
  border-radius: 4px;
  font-size: 13px;
}

/* 标题文字 */
.grade-section strong {
  color: #c45656;
  font-weight: 600;
}

/* =========================
   学生答案
========================= */
.student-answer,
.reference-answer {
  margin-top: 6px;
}

.student-answer div {
  margin-top: 4px;
  color: #5f2b2b;
  line-height: 1.5;
}

/* =========================
   参考答案（弱化，不抢视觉）
========================= */
.reference-answer div {
  margin-top: 4px;
  color: #7a4a4a;
  font-size: 12.5px;
  line-height: 1.4;
}

/* =========================
   评分输入区（紧凑）
========================= */
.grade-input {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  margin-top: 6px;
}

.grade-input span {
  font-size: 12.5px;
  color: #8c4a4a;
}

.grade-input .el-input-number {
  width: 90px;
}



.exam-answer-layout {
  display: flex;
  height: 100%;
  font-family: "Microsoft YaHei", Arial, sans-serif;
  background-color: #f9f9f9;
}

/* 左侧答题卡固定侧边栏 */
.answer-card-sidebar {
  width: 340px;
  padding: 15px;
  border-right: 1px solid #eaeaea;
  background-color: #fff;
  position: fixed;
  top: 20px;
  overflow-y: auto;
}
/* 答题模式（有时间、进度） */
.answer-card-sidebar.answer-mode {
  height: 800px;
}

/* 批改 / 查看模式（内容更少） */
.answer-card-sidebar.grade-mode {
  height: 600px;
}
/* 答题卡头部 */
.answer-card-header {
  font-weight: bold;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 答题卡网格 */
.answer-card-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  margin-bottom: 10px;
}

.answer-card-grid div {
  height: 50px;
  padding: 6px 0;
  text-align: center;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid #dcdfe6;
  font-size: 20px;
  user-select: none;
}

.answer-card-grid div.answered {
  background-color: #409eff;
  color: #fff;
  border-color: #409eff;
}

.answer-card-grid div.correct {
  border-color: #67c23a !important;
  background-color: #f0f9eb;
  color: #67c23a;
}

.answer-card-grid div.wrong {
  border-color: #f56c6c !important;
  background-color: #fef0f0;
  color: #f56c6c;
}
/* 图例 */
.answer-card-legend {
  display: flex;
  flex-direction: column;
  font-size: 16px;
  margin-top: 15px;
}

.answer-card-legend span {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.legend-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #fff;
  border: 1px solid #dcdfe6;
  margin-right: 6px;
}

.legend-dot.answered {
  background-color: #67c23a;
  border-color: #67c23a;
}

.legend-dot.correct {
  background-color: #67c23a;
  border-color: #67c23a;
}

.legend-dot.wrong {
  background-color: #f56c6c;
  border-color: #f56c6c;
}

/* 右侧题目区域 */
.questions-panel {
  flex: 1;
  margin-left:340px;
  padding: 20px 30px;
  background-color: #fff;
  overflow-y: auto;
}

/* 试卷头部信息 */
.exam-header {
  margin-bottom: 20px;
}

.exam-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

.exam-info el-tag {
  margin-right: 10px;
}

/* 题目列表 */
.questions-container {
  display: flex;

  flex-direction: column;
}

/* 每道题 */
.question-item {
  margin-bottom: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #eaeaea;
}

/* 题目标题 */
.question-header {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}

.question-number {
  font-weight: bold;
  margin-right: 6px;
}

.question-score {
  margin-left: 10px;
  font-weight: bold;
  color: #409eff;
}

.user-score {
  margin-left: 10px;
  font-weight: bold;
  color: #67c23a;
}

/* 题目内容 */
.question-content {
  margin-bottom: 8px;
  line-height: 1.6;
}

/* 选项 */
.question-options .el-radio,
.question-options .el-checkbox {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.option-label {
  margin-right: 6px;
  font-weight: bold;
}

.correct-icon {
  color: #67c23a;
  font-size: 20px;
  right: 12px;
}

.wrong-icon {
  color: #f56c6c;
  font-size: 20px;
  right: 12px;
}

/* 判断题 */
.question-options .el-radio {
  margin-bottom: 6px;
}

/* 填空题和简答题 */
.question-answer-area {
  margin-top: 6px;
}

.grade-input span {
  margin-right: 6px;
}

/* 答案解析 */
.question-analysis {
  margin-top: 6px;
  background-color: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  font-size: 14px;
}

.correct-answer {
  margin-bottom: 4px;
  font-weight: bold;
}

/* 底部操作栏 */
.exam-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-top: 1px solid #eaeaea;
  margin-top: 20px;
  background-color: #fff;
}

.footer-left {
  display: flex;
  align-items: center;
}

.footer-right el-button {
  margin-left: 10px;
}

/* 回到顶部 */
.el-backtop {
  z-index: 999;
}

/* 进度条 */
.progress-info {
  margin-top: 10px;
}
</style>