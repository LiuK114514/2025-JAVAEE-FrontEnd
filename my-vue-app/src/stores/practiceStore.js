import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { questionApi } from '../api'
import { useStorage } from '@vueuse/core'

export const usePracticeStore = defineStore('practice', () => {
    // 状态
    const currentQuestion = ref(null)
    const selectedOption = ref(null)
    const answerSubmitted = ref(false)
    const history = useStorage('practice-history', [])
    const streakDays = useStorage('practice-streak', 0)
    const practiceStats = ref(null)

    // 加载状态
    const loading = ref(false)
    const submitting = ref(false)

    // 每日学习小贴士
    const dailyTips = [
        "研究表明，分散学习比集中学习更有效。每天坚持练习比每周一次长时间学习效果更好。",
        "解释给别人听是检验自己是否真正理解知识的好方法。",
        "学习新知识后，在24小时内复习可以大幅提升记忆保持率。",
        "交替学习不同科目可以提高学习效率，避免疲劳。",
        "充足的睡眠对巩固记忆至关重要，学习后保证良好睡眠可以提高记忆效果。"
    ]

    // 计算属性
    const isAnswerCorrect = computed(() => {
        if (selectedOption.value === null || !currentQuestion.value) return false
        return selectedOption.value === currentQuestion.value.correctAnswer
    })

    const answeredCount = computed(() => history.value.length)

    const correctRate = computed(() => {
        if (history.value.length === 0) return 0
        const correctCount = history.value.filter(record => record.correct).length
        return Math.round((correctCount / history.value.length) * 100)
    })

    const recentHistory = computed(() => [...history.value].reverse().slice(0, 5))

    const dailyTip = computed(() => {
        const dayOfMonth = new Date().getDate()
        return dailyTips[dayOfMonth % dailyTips.length]
    })

    // 获取每日一题
    async function fetchDailyQuestion() {
        try {
            loading.value = true
            const result = await questionApi.getDailyQuestion()
            currentQuestion.value = result
            resetQuestionState()
            return { success: true, data: result }
        } catch (error) {
            console.error('获取每日一题失败:', error)
            return { success: false, error: error.message }
        } finally {
            loading.value = false
        }
    }

    // 提交练习答案
    async function submitPracticeAnswer() {
        if (selectedOption.value === null || !currentQuestion.value) {
            return { success: false, error: '请先选择答案' }
        }

        try {
            submitting.value = true

            const answerData = {
                questionId: currentQuestion.value.id,
                selectedOption: selectedOption.value,
                isCorrect: isAnswerCorrect.value
            }

            const result = await questionApi.submitPracticeAnswer(answerData)

            // 记录历史
            history.value.push({
                date: new Date().toISOString(),
                questionId: currentQuestion.value.id,
                category: currentQuestion.value.category,
                difficulty: currentQuestion.value.difficulty,
                correct: isAnswerCorrect.value
            })

            answerSubmitted.value = true

            // 更新连续天数
            updateStreakDays()

            return { success: true, data: result }
        } catch (error) {
            console.error('提交答案失败:', error)
            return { success: false, error: error.message }
        } finally {
            submitting.value = false
        }
    }

    // 获取练习统计
    async function fetchPracticeStats() {
        try {
            const result = await questionApi.getPracticeStats()
            practiceStats.value = result
            return { success: true, data: result }
        } catch (error) {
            console.error('获取练习统计失败:', error)
            return { success: false, error: error.message }
        }
    }

    // 获取练习历史
    async function fetchPracticeHistory(params = {}) {
        try {
            const result = await questionApi.getPracticeHistory(params)
            return { success: true, data: result }
        } catch (error) {
            console.error('获取练习历史失败:', error)
            return { success: false, error: error.message }
        }
    }

    // 更新连续天数
    function updateStreakDays() {
        const today = new Date().toDateString()
        const todayRecord = history.value.find(record =>
            new Date(record.date).toDateString() === today
        )

        if (todayRecord) {
            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)
            const yesterdayRecord = history.value.find(record =>
                new Date(record.date).toDateString() === yesterday.toDateString()
            )

            if (!yesterdayRecord) {
                streakDays.value = 1
            } else {
                streakDays.value++
            }
        }
    }

    // 重置问题状态
    function resetQuestionState() {
        selectedOption.value = null
        answerSubmitted.value = false
    }

    // 选择选项
    function selectOption(index) {
        if (!answerSubmitted.value) {
            selectedOption.value = index
        }
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

    // 格式化日期
    function formatDate(dateString) {
        const d = new Date(dateString)
        return `${d.getMonth()+1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
    }

    // 初始化
    async function init() {
        await fetchDailyQuestion()
        await fetchPracticeStats()
    }

    return {
        // 状态
        currentQuestion,
        selectedOption,
        answerSubmitted,
        history,
        streakDays,
        practiceStats,
        loading,
        submitting,

        // 计算属性
        isAnswerCorrect,
        answeredCount,
        correctRate,
        recentHistory,
        dailyTip,

        // 方法
        fetchDailyQuestion,
        submitPracticeAnswer,
        fetchPracticeStats,
        fetchPracticeHistory,
        resetQuestionState,
        selectOption,
        getOptionClass,
        formatDate,
        init
    }
})