<template>
    <!-- 正式答题页 -->
    <AnswerCard
        mode="answer"
        :exam-data="examData"
        @submit="handleSubmit"
    />

</template>
<script setup>
import AnswerCard from "../components/answerCard.vue";
import {nextTick, onBeforeUnmount, onMounted, ref, watch} from "vue";
import {ElMessage} from "element-plus";
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import router from "../router/router.js";
import {useAnswerCardStore} from "../stores/answerCardStore.js";
import {useExamStore} from "../stores/examStore.js";
import {getExamByCode, getExamQuestions, postAbnormal} from "../api/exam.js";
const answerCardStore = useAnswerCardStore()
const route = useRoute()
const answerStore = useAnswerCardStore()
const examStore = useExamStore()
// const isExamPage = computed(() => !!route.params.id)
// const examStarted = ref(false)

let autoSaveTimer = null
const examData = ref(null)
//打乱题目顺序
function shuffleArray(arr) {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

//检测到异常行为弹出警告
const abnormalLock = ref(false)

function handleAbnormal(type) {
  if (abnormalLock.value) return

  abnormalLock.value = true

  let message = ''
  switch (type) {
    case 'fullscreen':
      message = '检测到退出全屏，请勿切换页面'
      break
    case 'blur':
      message = '检测到页面失去焦点，请勿切换窗口'
      break
    case 'visibility':
      message = '检测到页面被切换或隐藏'
      break
    case 'copy':
      message = '考试中禁止复制'
      break
    case 'paste':
      message = '考试中禁止粘贴'
      break
    case 'rightClick':
      message = '考试中禁止使用右键'
      break
    default:
      message = '检测到异常行为'
  }

  ElMessage({
    message,
    type: 'warning',
    duration: 2000,  // 2秒后自动消失
    showClose: true
  })

  // 解除锁（防止疯狂弹窗）
  setTimeout(() => {
    abnormalLock.value = false
  }, 2000)


}
function handleFullscreen() {
  if (!document.fullscreenElement && !document.webkitFullscreenElement){
    handleAbnormal('fullscreen')
  examStore.reportAbnormal('FULLSCREEN_EXIT', '用户退出全屏')
  }
}

function handleBlur() {
  handleAbnormal('blur')
  examStore.reportAbnormal('WINDOW_BLUR', '用户窗口失焦')
}

function handleVisibility() {
  if (document.hidden) {
    handleAbnormal('visibility')
    examStore.reportAbnormal('TAB_HIDDEN', '用户当前标签页消失')
  }
}

function handleCopy(e) {
  e.preventDefault()
  handleAbnormal('copy')
  examStore.reportAbnormal('COPY', '用户尝试复制内容')
}

function handleRightClick(e) {
  e.preventDefault()
  handleAbnormal('rightClick')
  examStore.reportAbnormal('RIGHT_CLICK', '用户点击右键')
}

function handlePaste(e) {
  e.preventDefault()
  handleAbnormal('paste')
  examStore.reportAbnormal('PASTE', '用户尝试粘贴内容')
}
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
  if (type === 4 || type === 'judge') {
    return String(answer).toLowerCase() === 'true'
  }
  // 填空 / 简答
  return String(answer)
}
function transformQuestions(rawData) {
  return rawData.map(item => {
    // 映射题型
    let typeMap = {
      1: 'single',
      2: 'multiple',
      3: 'judge',
      4: 'fill',
      5: 'essay'
    }

    return {
      id: item.questionId,
      type: typeMap[item.type] ||'',
      content: item.content || '',
      score: item.score || 0,
      options: item.options ? item.options.map(o => o.optionText) : [],
      answer: item.userAnswer??'',
      analysis: ''
    }
  })
}
onMounted(async () => {
  // 绑定事件
  document.addEventListener('fullscreenchange', handleFullscreen)
  window.addEventListener('blur', handleBlur)
  document.addEventListener('visibilitychange', handleVisibility)
  document.addEventListener('copy', handleCopy)
  document.addEventListener('paste', handlePaste)
  document.addEventListener('contextmenu', handleRightClick)
  console.log('监听器已绑定')
  if (!autoSaveTimer) {
    autoSaveTimer = setInterval(answerCardStore.autoSaveExam, 5 * 1000)
  }
  //获取试卷
  const examId=route.params.id
  console.log(examStore.exam)
  try {
    const res = await getExamQuestions(examId)
    console.log(res)

    examData.value = {
      id: examStore.exam.id,
      examCode: examStore.exam.examCode,
      examName: examStore.exam.examName,
      duration: examStore.exam.duration,
      description: examStore.exam.description,
      startDate: examStore.exam.startDate,
      startTime: examStore.exam.startTime,
      status: examStore.exam.status,
      questions: shuffleArray(transformQuestions(res))
    }
    answerStore.initExam(examData.value)
    console.log(examData.value)
  } catch (e) {
    console.log(e)
    ElMessage.error('获取考试题目失败')
  }
})


  // 组件卸载时解绑
  onBeforeUnmount(() => {
    document.removeEventListener('fullscreenchange', handleFullscreen)
    window.removeEventListener('blur', handleBlur)
    document.removeEventListener('visibilitychange', handleVisibility)
    document.removeEventListener('copy', handleCopy)
    document.removeEventListener('paste', handlePaste)
    document.removeEventListener('contextmenu', handleRightClick)
    if (autoSaveTimer) {
      clearInterval(autoSaveTimer)
      autoSaveTimer = null
    }
  })



const handleSubmit =async () => {
  const success=await answerStore.submitExam()
  console.log("异常行为测试",examStore.abnormalList)
  const success2=await postAbnormal(examData.value.id,examStore.abnormalList)
  if (success&&success2) {
    ElMessage.success('试卷提交成功')
    console.log(answerCardStore.userAnswers)
    router.back()  // 返回上一页
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
  } else {
    ElMessage.error('试卷提交失败，请重试')
  }

}



</script>
<style scoped>

.query-panel,
.exam-infoo {
  background: #fff;
  padding: 30px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  margin-top: 20px;
}


.title {
  margin-bottom: 20px;
}


.exam-info h2 {
  margin-bottom: 10px;
}


.desc {
  color: #666;
  margin-bottom: 16px;
}


.meta {
  margin-bottom: 24px;
  padding-left: 16px;
}


.meta li {
  line-height: 1.8;
}
</style>