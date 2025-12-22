import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useAnswerCardStore = defineStore('answerCard', () => {
    const currentExam = ref(null)
    const userAnswers = ref({})
    const userScore = ref([])
    const startTime = ref(null)
    const remainingTime = ref(0)
    //保存的草稿
    const drafts = ref([])
    const isSubmitting = ref(false)

    // 已答题数量
    const answeredCount = computed(() => {
        return Object.values(userAnswers.value).filter(answer => {
            if (Array.isArray(answer)) return answer.length > 0
            return answer !== '' && answer !== null && answer !== undefined
        }).length
    })

    // 未答题数量
    const unansweredCount = computed(() => {
        if (!currentExam.value) return 0
        return currentExam.value.questions.length - answeredCount.value
    })

    // 总分
    const totalScore = computed(() => {
        if (!currentExam.value) return 0
        return currentExam.value.questions.reduce((sum, q) => sum + q.score, 0)
    })


    // 答题进度百分比
    const progressPercentage = computed(() => {
        if (!currentExam.value) return 0
        return Math.round((answeredCount.value / currentExam.value.questions.length) * 100)
    })

    // 是否全部答完
    const isAllAnswered = computed(() => {
        return unansweredCount.value === 0
    })


    // 初始化试卷
    const initExam = (examData) => {
        currentExam.value = examData
        startTime.value = Date.now()
        remainingTime.value = examData.duration * 60
        initAnswers()

    }

    // 初始化答案对象
    const initAnswers = (initialAnswers = []) => {
        const answers = {}
        currentExam.value.questions.forEach((question, index) => {
            if (initialAnswers.length) {
                answers[index] = initialAnswers[index] || (question.type === 'multiple' ? [] : null)
            } else {
                answers[index] = question.type === 'multiple' ? [] : null
            }
        })
        userAnswers.value = answers
    }
    // 更新单选答案
    const updateAnswer = (index, answer) => {
        userAnswers.value[index] = String.fromCharCode(65 + answer)
    }
    //更新多选
    const updateMultipleAnswer = (index, optIndex) => {
        const letter = String.fromCharCode(65 + optIndex)
        if (!userAnswers.value[index]) {
            userAnswers.value[index] = []  // 初始化数组
        }
        const arr = userAnswers.value[index]
        const i = arr.indexOf(letter)
        if (i === -1) {
            arr.push(letter)  // 选中
        } else {
            arr.splice(i, 1)  // 取消选中
        }
    }
    // 判断题更新答案
    const updateJudgeAnswer = (index, value) => {
        const strValue =  value === 'true' ? 'true' : 'false'

        userAnswers.value[index] = strValue
    }

    // 批量更新答案
    const updateInputAnswers = (index, value) => {
        userAnswers.value[index] = value
    }



    // 更新剩余时间
    const updateRemainingTime = (time) => {
        remainingTime.value = time
    }

    // 提交试卷
    const submitExam = async () => {
        if (!currentExam.value) return false
        if (isSubmitting.value) return false

        isSubmitting.value = true

        // 1. 组装答案（questionId + answer）
        const answers = currentExam.value.questions.map((q, index) => ({
            questionId: q.id,
            answer: userAnswers.value[index] ?? null
        }))

        // 2. 构造提交数据
        const payload = {
            examId: currentExam.value.id,
            answers,
            startTime: startTime.value,
            submitTime: Date.now(),
            duration: currentExam.value.duration * 60 - remainingTime.value
        }
        return true
        // try {
        //     const response = await fetch('/api/submitExam', {
        //         method: 'POST',
        //         headers: { 'Content-Type': 'application/json' },
        //         body: JSON.stringify(payload)
        //     })
        //
        //     const result = await response.json()
        //     return result.success === true
        // } catch (error) {
        //     console.error('提交试卷失败：', error)
        //     return false
        // } finally {
        //     isSubmitting.value = false
        // }
    }

    // 清空当前试卷状态
    const clearExam = () => {
        currentExam.value = null
        userAnswers.value = {}
        startTime.value = null
        remainingTime.value = 0
        isSubmitting.value = false
    }

    // 获取答案统计
    const getAnswerStats = () => {
        if (!currentExam.value) return null

        const stats = {
            single: { total: 0, answered: 0 },
            multiple: { total: 0, answered: 0 },
            judge: { total: 0, answered: 0 },
            fill: { total: 0, answered: 0 },
            essay: { total: 0, answered: 0 }
        }

        currentExam.value.questions.forEach((question, index) => {
            const type = question.type
            if (stats[type]) {
                stats[type].total++
                const answer = userAnswers.value[index]
                const isAnswered = Array.isArray(answer) ? answer.length > 0 : !!answer
                if (isAnswered) {
                    stats[type].answered++
                }
            }
        })

        return stats
    }
    //获取试卷信息
    async function fetchExamData(examId) {
        // try {
        //     const res = await axios.get(`/api/exams/${examId}`)
        //     if (res && res.data) {
        //         exams.value[examId] = res.data
        //         return res.data
        //     }
        //     return null
        // } catch (error) {
        //     console.error('fetchExamData error:', error)
        //     return null
        // }

        return {
            examId: examId,
            examName: '前端开发基础测试',
            totalScore: 40,
            questions: [
                // 单选题
                {
                    id: 1,
                    type: 'single',
                    score: 5,
                    content: 'Vue 的核心特性是？',
                    options: [
                        '单向数据流',
                        '双向数据绑定',
                        '直接操作 DOM',
                        '模板字符串'
                    ],
                    answer: 'B',
                    analysis:'11111111111111'
                },

                // 多选题
                {
                    id: 2,
                    type: 'multiple',
                    score: 5,
                    content: '以下哪些属于 Vue 的核心特性？',
                    options: [
                        '组件化',
                        '响应式系统',
                        '虚拟 DOM',
                        '强制使用 TypeScript'
                    ],
                    answer: ['A','B','D'],
                    analysis:'11111111111111'
                },

                // 填空题
                {
                    id: 3,
                    type: 'fill',
                    score: 10,
                    content: 'Vue3 中使用 ____ 对象实现响应式系统。',
                    answer: 'Proxy',
                    analysis:'11111111111111'
                },

                // 判断题
                {
                    id: 4,
                    type: 'judge',
                    score: 5,
                    content: '在 Vue3 中，ref 只能用于基本数据类型。',
                    answer: 'true' ,  // 或 true，按你系统约定,
                    analysis:'11111111111111'
                },

                // 简答题
                {
                    id: 5,
                    type: 'essay',
                    score: 15,
                    content: '请简述 Vue3 响应式系统的实现原理。',
                    answer: 'Vue3 基于 ES6 的 Proxy 对对象进行代理，拦截数据的读取和修改操作，在依赖收集与触发更新阶段实现高效的响应式更新机制。',
                    analysis:'11111111111111'
                }
            ]
        }
    }

    async function fetchAnswerRecord(userId) {
        // try {
        //     const res = await axios.get(`/api/answerRecords`, {
        //         params: { userId }
        //     })
        //     if (res && res.data) {
        //         answerRecords.value[userId] = res.data
        //         return res.data
        //     }
        //     return null
        // } catch (error) {
        //     console.error('fetchAnswerRecord error:', error)
        //     return null
        // }
        userScore.value=[5, 3, 10, 5, 3]
        return {
            paperId: userId,
            answers: ['C',['A','C'], 'proxy', 'false','555']
        }


    }

    return {
        currentExam,
        userAnswers,
        userScore,
        startTime,
        remainingTime,
        drafts,
        isSubmitting,
        answeredCount,
        unansweredCount,
        totalScore,
        progressPercentage,
        isAllAnswered,
        initExam,
        initAnswers,
        updateAnswer,
        updateJudgeAnswer,
        updateMultipleAnswer,
        updateInputAnswers,
        // saveDraft,
        // loadDraft,
        // deleteDraft,
        updateRemainingTime,
        submitExam,
        clearExam,
        // loadDraftsFromStorage,
        getAnswerStats,
        fetchExamData,
        fetchAnswerRecord,
    }
})