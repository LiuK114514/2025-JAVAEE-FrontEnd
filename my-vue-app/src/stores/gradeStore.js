import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {postJudge} from "../api/exam.js";

export const useGradeStore = defineStore('grade', () => {
    // 当前批改的试卷数据
    const currentGrading = ref({
        questions: [],
        userAnswers: []
    })
    //考生信息
    const paperId = ref('')
    //考试信息
    const examId = ref('')
    // 主观题分数映射 { questionIndex: score }
    const questionScores = ref({})

    // 批改备注
    const gradingRemarks = ref('')

    // 加载状态
    const isLoading = ref(false)

    // 初始化批改数据（前端传入题目和学生答案）
    const initGrading = (pId, eId,questions, userAnswers) => {
        paperId.value = pId
        examId.value = eId
        // 深拷贝题目，避免修改原始数据
        currentGrading.value.questions = questions.map(q => ({
            ...q,
            userScore:  q.userScore ?? 0
        }))

        currentGrading.value.userAnswers = userAnswers || []
        console.log(currentGrading.value)
        // 初始化主观题得分映射
        questionScores.value = {}

        // // 自动评分客观题
        // const hasGraded = questions.some(q => q.userScore > 0)
        // if (!hasGraded) {
        //     autoGradeObjectiveQuestions()
        // }
    }
    // // 自动评分客观题（单选、多选、判断）
    // const autoGradeObjectiveQuestions = () => {
    //     currentGrading.value.questions.forEach((q, index) => {
    //         if (!['single', 'multiple', 'judge', 'fill'].includes(q.type)) return
    //
    //         const userAnswer = currentGrading.value.userAnswers[index]
    //         let isCorrect = false
    //
    //         if (q.type === 'single' || q.type === 'judge') {
    //             isCorrect = userAnswer === q.answer
    //             q.userScore = isCorrect ? q.score : 0
    //         }
    //         else if (q.type === 'multiple') {
    //             const correctSet = new Set(Array.isArray(q.answer) ? q.answer : [])
    //             const userSet = new Set(Array.isArray(userAnswer) ? userAnswer : [])
    //
    //             // 计算选对和选错
    //             let hit = 0
    //             let wrong = 0
    //
    //             userSet.forEach(a => {
    //                 if (correctSet.has(a)) hit++
    //                 else wrong++
    //             })
    //
    //             if (wrong > 0) {
    //                 q.userScore = 0       // 选错任何一个 → 0 分
    //             } else if (hit === correctSet.size) {
    //                 q.userScore = q.score // 全对 → 满分
    //             } else if (hit > 0) {
    //                 q.userScore = Math.round(q.score / 2 * 10) / 10  // 选对部分 → 一半分
    //             } else {
    //                 q.userScore = 0       // 没选对任何 → 0 分
    //             }
    //
    //         }else if (q.type === 'fill') {
    //             const correctArr = Array.isArray(q.answer) ? q.answer : [q.answer]
    //             const userArr = Array.isArray(userAnswer) ? userAnswer : [userAnswer]
    //
    //             isCorrect = correctArr.every((ans, i) =>
    //                 (userArr[i] || '').trim() === (ans || '').trim()
    //             )
    //             q.userScore = isCorrect ? q.score : 0
    //         }
    //
    //     })
    // }

    // 更新题目分数（手动评分）
    const updateQuestionScore = (index, score) => {
        questionScores.value[index] = score
        if (currentGrading.value.questions[index]) {
            currentGrading.value.questions[index].userScore = score
        }
    }

    // 计算总分
    const calculateTotalScore = () => {
        return currentGrading.value.questions.reduce((sum, q, index) => {

            if (['single', 'multiple', 'judge'].includes(q.type)|| q.userScore!==0) {
                return sum + (q.userScore || 0)
            }
            else {
                return sum + (questionScores.value[index] || 0)
            }
        }, 0)
    }

    // 重置批改
    const resetGrading = () => {
        currentGrading.value.questions = []
        currentGrading.value.userAnswers = []
        questionScores.value = {}
        gradingRemarks.value = ''
    }
    // 判断是否批改完成
    const isGradingComplete = () => {
        return currentGrading.value.questions.every((q, index) => {
            // 客观题自动完成
            if (['single', 'multiple', 'judge', 'fill'].includes(q.type)) return true

            // 主观题必须有分数
            const score = questionScores.value[index]
            return typeof score === 'number' && score >= 0
        })
    }
    // 提交批改结果
    const submitGrade = async (paperId) => {

        const payload = {
            examId: examId.value,
            testerId: paperId,
            totalScore: calculateTotalScore(),
            questions: currentGrading.value.questions.map(q => ({
                questionId: q.id,
                userScore: q.userScore
            }))
        }
        console.log(payload)
        try {
           await postJudge(examId.value, payload)
            return true
        } catch (err) {
            console.error('提交评分失败', err)
            return false
        }
    }


    async function fetchExamData(id) {
        // 返回试卷信息
        // return {
        //     examId: id,
        //     examName: '前端开发基础测试',
        //     totalScore: 40,
        //     questions: [
        //         // 单选题
        //         {
        //             id: 1,
        //             type: 'single',
        //             score: 5,
        //             content: 'Vue 的核心特性是？',
        //             options: [
        //                 '单向数据流',
        //                 '双向数据绑定',
        //                 '直接操作 DOM',
        //                 '模板字符串'
        //             ],
        //             answer: 'B'
        //         },
        //
        //         // 多选题
        //         {
        //             id: 2,
        //             type: 'multiple',
        //             score: 5,
        //             content: '以下哪些属于 Vue 的核心特性？',
        //             options: [
        //                 '组件化',
        //                 '响应式系统',
        //                 '虚拟 DOM',
        //                 '强制使用 TypeScript'
        //             ],
        //             answer: ['A','B','D']
        //         },
        //
        //         // 填空题
        //         {
        //             id: 3,
        //             type: 'fill',
        //             score: 10,
        //             content: 'Vue3 中使用 ____ 对象实现响应式系统。',
        //             answer: 'Proxy'
        //         },
        //
        //         // 判断题
        //         {
        //             id: 4,
        //             type: 'judge',
        //             score: 5,
        //             content: '在 Vue3 中，ref 只能用于基本数据类型。',
        //             answer: 'true'   // 或 true，按你系统约定
        //         },
        //
        //         // 简答题
        //         {
        //             id: 5,
        //             type: 'essay',
        //             score: 15,
        //             content: '请简述 Vue3 响应式系统的实现原理。',
        //             answer: 'Vue3 基于 ES6 的 Proxy 对对象进行代理，拦截数据的读取和修改操作，在依赖收集与触发更新阶段实现高效的响应式更新机制。'
        //         }
        //     ]
        // }
    }

    async function fetchPaperData(id) {
        // 返回学生答卷
        return {
            paperId: id,
            studentName: '张三',
            answers: ['C',['A','C'], 'proxy', 'false','555']
        }
    }

    return {
        currentGrading,
        questionScores,
        gradingRemarks,
        isLoading,
        calculateTotalScore,
        initGrading,
        updateQuestionScore,
        resetGrading,
        isGradingComplete,
        submitGrade,
        fetchExamData,
        fetchPaperData
    }
})