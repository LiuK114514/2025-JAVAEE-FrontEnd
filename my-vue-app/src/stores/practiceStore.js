import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { questionApi } from '../api'
import { useStorage } from '@vueuse/core'

export const usePracticeStore = defineStore('practice', () => {
    // 状态
        const currentQuestion = ref({
            wrongQuestionId: null,
            studentId: null,
            questionId: null,
            count: null,
            studentAnswer: "",
            correctAnswer: "",
            note: "",
            createTime: "",
            updateTime: "",
            questionType: null,
            content: "",
            optionsJson:[],
        })

    // 用户交互状态
    const selectedOption = ref("")
    const answerSubmitted = ref(false)
    // 加载状态
    const loading = ref(false)
    const submitting = ref(false)
    // 计算属性
    const isAnswerCorrect = ref(false)
    // 每日学习小贴士
    const dailyTips = [
        "研究表明，分散学习比集中学习更有效。每天坚持练习比每周一次长时间学习效果更好。",
        "解释给别人听是检验自己是否真正理解知识的好方法。",
        "学习新知识后，在24小时内复习可以大幅提升记忆保持率。",
        "交替学习不同科目可以提高学习效率，避免疲劳。",
        "充足的睡眠对巩固记忆至关重要，学习后保证良好睡眠可以提高记忆效果。"
    ]

    const dailyTip = computed(() => {
        const dayOfMonth = new Date().getDate()
        return dailyTips[dayOfMonth % dailyTips.length]
    })

    // 获取每日一题
    async function fetchDailyQuestion() {
        try {
            loading.value = true
            const result = await questionApi.getDailyQuestion()
            console.log(result)
            currentQuestion.value = result
            console.log(currentQuestion.value)
            resetQuestionState()
            return { success: true, data: result }
        } catch (error) {
            console.error('获取每日一题失败:', error)
            return { success: false, error: error.message }
        } finally {
            loading.value = false
        }
    }


    // 选择选项
    function selectOption(index) {
        if (!answerSubmitted.value) {
            selectedOption.value = String(index)
        }
    }

    // 提交练习答案
    async function submitPracticeAnswer() {
        if (selectedOption.value === null || !currentQuestion.value) {
            return { success: false, error: '请先选择答案' }
        }

        try {
            submitting.value = true
            const letterMap = ['A', 'B', 'C', 'D']
            const userLetter = letterMap[selectedOption.value]
            const result = computed(()=>{
                return userLetter === currentQuestion.value.correctAnswer;
            })
            console.log(result.value)
            isAnswerCorrect.value = result.value
            answerSubmitted.value = true
            return { success: true, data: result.value }
        } catch (error) {
            console.error('提交答案失败:', error)
            return { success: false, error: error.message }
        } finally {
            submitting.value = false
        }
    }

    // 重置问题状态
    function resetQuestionState() {
        selectedOption.value = null
        answerSubmitted.value = false
    }


    // 获取选项类名
    function getOptionClass(index) {
        if (!answerSubmitted.value) {
            return selectedOption.value === index ? 'selected' : ''
        }

        if (!currentQuestion.value) return ''

        if (index === currentQuestion.value.correctAnswer) {
            return 'correct'
        }

        if (index === selectedOption.value && index !== currentQuestion.value.correctAnswer) {
            return 'incorrect'
        }

        return ''
    }
    // 初始化
    async function init() {
        await fetchDailyQuestion()
    }

    return {
        // 状态
        currentQuestion,
        selectedOption,
        answerSubmitted,
        loading,
        submitting,

        // 计算属性
        isAnswerCorrect,
        dailyTip,

        // 方法
        fetchDailyQuestion,
        submitPracticeAnswer,
        resetQuestionState,
        selectOption,
        getOptionClass,
        init
    }
})