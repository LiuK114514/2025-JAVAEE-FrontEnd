import { defineStore } from 'pinia'
import {computed, ref, watch} from 'vue'
import {
    getAllExams,
    getAllStudents,
    getBehavior,
    getDistributions,
    getMyexams,
    getRange,
    getReviewedCount
} from "../api/exam.js";

export const useExamStore = defineStore('exam', () => {
    //大题时保存试卷信息
    const exam = ref(null)
    // 设置考试数据
    function setExam(data) {
        exam.value = data
    }
    //异常行为记录
    const abnormalList = ref([])
    function reportAbnormal(type, remark = '') {
        abnormalList.value.push({
            behaviorType: type,
            occurTime: new Date().toISOString().slice(0, 19),
            remark
        })
    }
    // 试卷基本信息
    const formData = ref({
        examCode: '',// 试卷码
        examName: '',
        description: '',
        startDate: '',
        startTime: '',
        duration: 60,
        showAnswers: true,//允许查看试卷
        questions: []//题目
    })

    // 题目类型映射
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


    // 新增 / 编辑题目
    const newQuestion = ref({
        id: 0,
        type: '',
        content: '',
        score: 1,
        options: [],
        answer: '',
        correctAnswer: [],
        analysis: ''
    })

    // 打开新增题目对话框时初始化
    const initNewQuestion = (type) => {
        newQuestion.value = {
            id: Date.now(),
            type,
            content: '',
            score: 1,
            options: [],
            answer: '',
            correctAnswer: [],
            analysis: ''
        }

        switch (type) {
            case 'fill':
                newQuestion.value.answer = ''
                break
            case 'single':
                newQuestion.value.options = ['', '']
                newQuestion.value.answer = ''
                break
            case 'multiple':
                newQuestion.value.options = ['', '']
                newQuestion.value.correctAnswer = []
                break
            case 'judge':
                newQuestion.value.answer = 'true'
                break
            case 'essay':
                newQuestion.value.answer = ''
                break
        }
    }
    //生成试卷码
    function generateExamCode() {
        const timePart = Date.now().toString().slice(-4) // 毫秒时间戳
        const randomPart = Math.floor(Math.random() * 100)
            .toString()
            .padStart(2, '0')
        return timePart+randomPart
    }
    // 添加选项
    const addOption = () => {
        newQuestion.value.options.push('')
    }

    // 删除选项
    const removeOption = (index) => {
        newQuestion.value.options.splice(index, 1)
    }

    // 确认保存题目（新增 or 更新）
    const saveQuestion = () => {
        let q = formData.value.questions.find(item => item.id === newQuestion.value.id)
        if (!q)
            formData.value.questions.push(JSON.parse(JSON.stringify(newQuestion.value)))
        else
            Object.assign(q, newQuestion.value)
    }


    // 列表操作
    const editQuestion = (id) => {
        const q = formData.value.questions.find(x => x.id === id)
        if (q) newQuestion.value = JSON.parse(JSON.stringify(q))
    }

    const removeQuestion = (index) => {
        formData.value.questions.splice(index, 1)
    }

    // 统计类
    const getQuestionCountByType = (type) =>
        formData.value.questions.filter(q => q.type === type).length

    const getTotalScore = () =>
        formData.value.questions.reduce((sum, q) => sum + (q.score || 0), 0)

    // ==================== 我发布的考试模块 ====================

    //所有已发布的考试
    const allExams = ref([])
    //当前选中的考试（查看详情/批阅/统计）
    const selectedExam = ref(null)
    // 搜索筛选条件
    //考试页搜索
    const examsearchForm = ref({
        examName: '',
        status:'',
        reviewStatus: '',
        dateRange: null
    })
    //批阅页搜索
    const gradesearchForm = ref({
        name: '',        // 按学生姓名搜索
        email: '',   // 按邮箱搜索
        status: ''       // 按状态过滤：graded / ungraded
    })
    //日志搜索
    const abnormalSearchForm = ref({
        name: '',
        type: ''
    })

    const abnormalTypeText = {
        FULLSCREEN_EXIT: '退出全屏',
        WINDOW_BLUR: '窗口失焦',
        TAB_HIDDEN: '标签页隐藏',
        COPY: '复制行为',
        RIGHT_CLICK: '右键点击',
        PASTE:'粘贴行为'
    }

    const getTagType = (status) => {
        switch(status) {
            case 'upcoming': return 'primary';  // 未开始
            case 'ongoing':  return 'warning';  // 进行中
            case 'ended':    return 'info';     // 已结束
            default:         return 'default';
        }
    }

    const getTagText = (status) => {
        switch(status) {
            case 'upcoming': return '未开始';
            case 'ongoing':  return '进行中';
            case 'ended':    return '已结束';
            default:         return '';
        }
    }
    // 分页
    //列表试卷分页
    const pagination = ref({
        currentPage: 1,
        pageSize: 3,
        total: 1
    })
    //批改页面分页
    const gradingPagination = ref({
        currentPage: 1,
        pageSize: 10,
        total: 1
    })
    //日志分页
    const logPagination = ref({
        currentPage: 1,
        pageSize: 10,
        total: 1
    })
    //批阅学生提交列表
    const studentSubmissions = ref([])
    // 考试统计信息
    const examStatistics = ref({
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        passRate: 0
    })
    // 分数段统计
    const scoreDistribution = ref([])

    //筛选后的考试列表
    const filteredExams = computed(() => {
        let result = allExams.value
        if (examsearchForm.value.examName) {
            result = result.filter(exam =>
                exam.examName.toLowerCase().includes(examsearchForm.value.examName.toLowerCase())
            )
        }
        if (examsearchForm.value.status) {
            result = result.filter(exam => exam.status===examsearchForm.value.status)
        }

        if (examsearchForm.value.reviewStatus !== null && examsearchForm.value.reviewStatus !== undefined) {
            result = result.filter(exam => exam.reviewStatus === examsearchForm.value.reviewStatus)
        }

        if (examsearchForm.value.dateRange?.length === 2) {
            const [start, end] = examsearchForm.value.dateRange
            result = result.filter(exam =>
                exam.startDate >= start && exam.startDate <= end
            )
        }
        // 更新分页总数
        pagination.value.total = result.length
        return result
    })
    //当前页显示的考试列表
    const displayExams = computed(() => {
        const start = (pagination.value.currentPage - 1) * pagination.value.pageSize
        return filteredExams.value.slice(start, start + pagination.value.pageSize)
    })



    // 筛选后的学生列表
    const filteredSubmissions = computed(() => {
        let result = studentSubmissions.value

        if (gradesearchForm.value.name) {
            result = result.filter(s =>
                s.name.toLowerCase().includes(gradesearchForm.value.name.toLowerCase())
            )
        }

        if (gradesearchForm.value.email) {
            result = result.filter(s =>
                s.email.toLowerCase().includes(gradesearchForm.value.email.toLowerCase())
            )
        }

        if (gradesearchForm.value.status) {
            result = result.filter(s =>
                (gradesearchForm.value.status === 'graded' ? s.status === 'graded' : s.status !== 'graded')
            )
        }

        // 更新分页总数
        gradingPagination.value.total = result.length
        return result
    })

    // 当前页显示的学生列表
    const displaySubmissions = computed(() => {
        const start = (gradingPagination.value.currentPage - 1) * gradingPagination.value.pageSize
        return filteredSubmissions.value.slice(start, start + gradingPagination.value.pageSize)
    })
    //筛选日志
    const filterAbnormalLogs = computed(()=> {
        let list = abnormalList.value

        // 按姓名过滤
        if (abnormalSearchForm.value.name) {
            list = list.filter(item =>
                item.name?.includes(abnormalSearchForm.value.name)
            )
        }

        // 按异常类型过滤
        if (abnormalSearchForm.value.type) {
            list = list.filter(item =>
                item.behaviorType === abnormalSearchForm.value.type
            )
        }
        logPagination.value.total = list.length
        return list
    })
    //显示筛选的日志
    const displayLogs = computed(() => {
        const start = (logPagination.value.currentPage - 1) * logPagination.value.pageSize
        return filterAbnormalLogs.value.slice(start, start + logPagination.value.pageSize)
    })

    function resetAbnormalSearchForm() {
        abnormalSearchForm.value.name = ''
        abnormalSearchForm.value.type = ''
        logPagination.value.currentPage = 1
    }
    // 获取已发布考试列表
    //格式处理
    const questionTypeMap = {
        1: 'single',
        2: 'multiple',
        3: 'judge',
        4: 'fill',
        5: 'essay'
    }
    //状态映射
    const statusMap = {
        0: 'upcoming',
        1: 'ongoing',
        2: 'ended',
    }
    //时间统一
    function splitDateTime(isoString) {
        if (!isoString) return { date: '', time: '' }

        const date = new Date(isoString)

        const yyyy = date.getUTCFullYear()
        const mm = String(date.getUTCMonth() + 1).padStart(2, '0')
        const dd = String(date.getUTCDate()).padStart(2, '0')

        const hh = String(date.getUTCHours()).padStart(2, '0')
        const mi = String(date.getUTCMinutes()).padStart(2, '0')

        return {
            date: `${yyyy}-${mm}-${dd}`,
            time: `${hh}:${mi}`
        }
    }
    // //比较时间判断考试状态
    // function mergeDateTime(date, time) {
    //     return `${date}T${time}:00`
    // }
    // function calcExamStatus(startDate, startTime, duration) {
    //     const start = mergeDateTime(startDate, startTime)
    //
    //     // 结束时间 = 开始时间 + duration 分钟
    //     const startDateObj = new Date(start)
    //     const endDateObj = new Date(startDateObj.getTime() + duration * 60 * 1000)
    //
    //     const now = new Date()
    //
    //     if (now < startDateObj) return 'upcoming'
    //     if (now > endDateObj) return 'ended'
    //     return 'ongoing'
    // }
    function formatExamList(records) {
        return records.map(exam => {
            const start = splitDateTime(exam.startTime)
            // const status = calcExamStatus(
            //     start.date,
            //     start.time,
            //     exam.limitMinutes
            // )
            return {
                id: exam.examId,
                examName: exam.examName,
                examCode: exam.examCode,
                description: exam.description,
                startDate: start.date,
                startTime: start.time,
                duration: exam.limitMinutes,
                status: statusMap[exam.status],
                showAnswer: exam.showAnswer === 1,
                graded:0,
                submitted:0,
                questions: exam.questionDetailVOList.map(q => ({
                    id: q.questionSimpleInfoVO.questionId,
                    type: questionTypeMap[q.questionSimpleInfoVO.type],
                    content: q.questionSimpleInfoVO.content,
                    score: q.questionSimpleInfoVO.score,
                    options: q.questionSimpleInfoVO.options.map(o => o.optionText),
                    correctAnswer: q.correctAnswer,
                    analysis: q.analysis
                }))
            }
        })
    }
    //加载已发布的考试
    const fetchPublishedExams = async () => {
        // TODO: API
        //重置搜索条件
        resetExamesearchForm()
        const res = await getAllExams()
        allExams.value = formatExamList(res.records)
        console.log(allExams.value)
        await loadReviewProgress()
        // allExams.value = [
        //     {
        //         id: 3,
        //         examCode: 'MATH6A',
        //         examName: '高等数学（一）期中考试',
        //         startDate: '2024-12-14',
        //         startTime: '09:00',
        //         duration: 120,
        //         showAnswers: true,
        //         questions: [
        //             { id: 1, type: 'single', content: '极限计算', score: 5 },
        //             { id: 2, type: 'multiple', content: '函数性质', score: 10 }
        //         ],
        //         status: 'ended',
        //         participants: 160,
        //         submitted: 158,
        //         graded: 150
        //     },
        //     {
        //         id: 102,
        //         examCode: 'LINALG',
        //         examName: '线性代数期中测试',
        //         startDate: '2024-12-16',
        //         startTime: '14:00',
        //         duration: 90,
        //         showAnswers: true,
        //         questions: [
        //             { id: 1, type: 'single', content: '矩阵运算', score: 5 },
        //             { id: 2, type: 'multiple', content: '行列式', score: 10 }
        //         ],
        //         status: 'ongoing',
        //         participants: 140,
        //         submitted: 80,
        //         graded: 0
        //     },
        //     {
        //         id: 103,
        //         examCode: 'PHY101',
        //         examName: '大学物理期中考试',
        //         startDate: '2024-12-10',
        //         startTime: '10:00',
        //         duration: 100,
        //         showAnswers: true,
        //         questions: [
        //             { id: 1, type: 'judge', content: '牛顿定律判断', score: 5 },
        //             { id: 2, type: 'single', content: '动量守恒', score: 5 }
        //         ],
        //         status: 'ended',
        //         participants: 180,
        //         submitted: 180,
        //         graded: 175
        //     },
        //     {
        //         id: 104,
        //         examCode: 'CSBAS1',
        //         examName: '计算机基础期末考试',
        //         startDate: '2024-12-18',
        //         startTime: '15:00',
        //         duration: 120,
        //         showAnswers: true,
        //         questions: [
        //             { id: 1, type: 'single', content: '操作系统基础', score: 5 },
        //             { id: 2, type: 'multiple', content: '计算机网络', score: 10 }
        //         ],
        //         status: 'upcoming',
        //         participants: 150,
        //         submitted: 0,
        //         graded: 0
        //     },
        //     {
        //         id: 105,
        //         examCode: 'ENGT01',
        //         examName: '大学英语综合测试',
        //         startDate: '2024-12-22',
        //         startTime: '09:30',
        //         duration: 60,
        //         showAnswers: false,
        //         questions: [
        //             { id: 1, type: 'single', content: '词汇选择', score: 5 },
        //             { id: 2, type: 'essay', content: '阅读理解', score: 15 }
        //         ],
        //         status: 'upcoming',
        //         participants: 190,
        //         submitted: 0,
        //         graded: 0
        //     },
        //     {
        //         id: 106,
        //         examCode: 'DS2024',
        //         examName: '数据结构期末考试',
        //         startDate: '2024-12-25',
        //         startTime: '10:00',
        //         duration: 120,
        //         showAnswers: true,
        //         questions: [
        //             { id: 1, type: 'single', content: '链表操作', score: 5 },
        //             { id: 2, type: 'multiple', content: '二叉树遍历', score: 10 }
        //         ],
        //         status: 'upcoming',
        //         participants: 165,
        //         submitted: 0,
        //         graded: 0
        //     },
        //     {
        //         id: 107,
        //         examCode: 'PROSTA',
        //         examName: '概率论与数理统计期中考试',
        //         startDate: '2024-12-12',
        //         startTime: '13:30',
        //         duration: 90,
        //         showAnswers: true,
        //         questions: [
        //             { id: 1, type: 'single', content: '随机变量', score: 5 },
        //             { id: 2, type: 'multiple', content: '概率分布', score: 10 }
        //         ],
        //         status: 'ended',
        //         participants: 135,
        //         submitted: 135,
        //         graded: 130
        //     },
        //     {
        //         id: 108,
        //         examCode: 'DISMAT',
        //         examName: '离散数学期末考试',
        //         startDate: '2024-12-27',
        //         startTime: '14:00',
        //         duration: 100,
        //         showAnswers: true,
        //         questions: [
        //             { id: 1, type: 'single', content: '命题逻辑', score: 5 },
        //             { id: 2, type: 'multiple', content: '图论基础', score: 10 }
        //         ],
        //         status: 'upcoming',
        //         participants: 145,
        //         submitted: 0,
        //         graded: 0
        //     },
        //     {
        //         id: 109,
        //         examCode: 'CHEM01',
        //         examName: '大学化学期中考试',
        //         startDate: '2024-12-08',
        //         startTime: '11:00',
        //         duration: 90,
        //         showAnswers: true,
        //         questions: [
        //             { id: 1, type: 'single', content: '化学反应速率', score: 5 },
        //             { id: 2, type: 'judge', content: '化学平衡判断', score: 5 }
        //         ],
        //         status: 'ended',
        //         participants: 150,
        //         submitted: 148,
        //         graded: 145
        //     },
        //     {
        //         id: 110,
        //         examCode: 'OOPFIN',
        //         examName: '面向对象程序设计期末考试',
        //         startDate: '2024-12-30',
        //         startTime: '13:00',
        //         duration: 120,
        //         showAnswers: false,
        //         questions: [
        //             { id: 1, type: 'single', content: '类与对象', score: 5 },
        //             { id: 2, type: 'essay', content: '设计模式简述', score: 15 }
        //         ],
        //         status: 'upcoming',
        //         participants: 175,
        //         submitted: 0,
        //         graded: 0
        //     }
        // ]
        pagination.value.total = allExams.value.length
    }
    //加载批改状况
    const loadReviewProgress = async () => {
        if (!allExams.value.length) return
        await Promise.all(
            allExams.value.map(async exam => {
                try {
                    const res = await getReviewedCount(exam.id)

                    const { reviewedCount, totalCount } = res

                    exam.graded = reviewedCount
                    exam.submitted = totalCount
                } catch (e) {
                    console.error(`获取考试 ${exam.id} 批改进度失败`, e)
                }
            })
        )
    }
    //获取考试详情
    const fetchExamDetail = async (id) => {
        selectedExam.value = allExams.value.find(e => e.id === id)
    }
    //获取学生提交列表（批阅页）
    function formatStudentSubmissions(records) {
        return records.map(item => ({
            id: item.userId,
            name: item.realName,
            email: item.email,
            submitTime: formatDateTime(item.submitTime),
            status: item.status === 1 ? 'graded' : 'ungraded',
            score: item.score
        }))
    }
    function formatDateTime(isoTime) {
        if (!isoTime) return ''
        return isoTime.replace('T', ' ').slice(0, 16)
    }
    const fetchSubmissions = async (examId) => {
        const res=await getAllStudents(examId)
        studentSubmissions.value = formatStudentSubmissions(res.records)
        // if (examId === 3) {
        //     studentSubmissions.value = [
        //         { id: 1, name: '张三', email: '1358709071@qq.com', submitTime: '2024-12-08 16:25', status: 'graded', score: 85 },
        //         { id: 2, name: '李四', email: 'lisi01@example.com', submitTime: '2024-12-08 16:32', status: 'graded', score: 90 },
        //         { id: 3, name: '王五', email: 'wangwu02@example.com', submitTime: '2024-12-08 16:40', status: 'ungraded', score: null },
        //         { id: 4, name: '赵六', email: 'zhaoliu03@example.com', submitTime: '2024-12-08 16:45', status: 'graded', score: 76 },
        //         { id: 5, name: '钱七', email: 'qianqi04@example.com', submitTime: '2024-12-08 16:50', status: 'ungraded', score: null },
        //         { id: 6, name: '孙八', email: 'sunba05@example.com', submitTime: '2024-12-08 16:58', status: 'graded', score: 92 },
        //         { id: 7, name: '周九', email: 'zhoujiu06@example.com', submitTime: '2024-12-08 17:02', status: 'graded', score: 67 },
        //         { id: 8, name: '吴十', email: 'wushi07@example.com', submitTime: '2024-12-08 17:10', status: 'graded', score: 88 },
        //         { id: 9, name: '郑一', email: 'zhengyi08@example.com', submitTime: '2024-12-08 17:15', status: 'ungraded', score: null },
        //         { id: 10, name: '王二', email: 'wanger09@example.com', submitTime: '2024-12-08 17:19', status: 'graded', score: 81 },
        //
        //         { id: 11, name: '冯三', email: 'fengsan10@example.com', submitTime: '2024-12-08 17:22', status: 'graded', score: 95 },
        //         { id: 12, name: '陈四', email: 'chensi11@example.com', submitTime: '2024-12-08 17:29', status: 'ungraded', score: null },
        //         { id: 13, name: '褚五', email: 'chuwu12@example.com', submitTime: '2024-12-08 17:34', status: 'graded', score: 73 },
        //         { id: 14, name: '魏六', email: 'weiliu13@example.com', submitTime: '2024-12-08 17:40', status: 'graded', score: 89 },
        //         { id: 15, name: '陶七', email: 'taoqi14@example.com', submitTime: '2024-12-08 17:45', status: 'graded', score: 64 },
        //         { id: 16, name: '姜八', email: 'jiangba15@example.com', submitTime: '2024-12-08 17:52', status: 'ungraded', score: null },
        //         { id: 17, name: '戚九', email: 'qijiu16@example.com', submitTime: '2024-12-08 17:59', status: 'graded', score: 78 },
        //         { id: 18, name: '谢十', email: 'xieshi17@example.com', submitTime: '2024-12-08 18:03', status: 'graded', score: 84 },
        //         { id: 19, name: '徐一', email: 'xuyi18@example.com', submitTime: '2024-12-08 18:07', status: 'ungraded', score: null },
        //         { id: 20, name: '罗二', email: 'luoer19@example.com', submitTime: '2024-12-08 18:12', status: 'graded', score: 91 }
        //     ]
        // } else if (examId === 2) {
        //     studentSubmissions.value = []   // 没有学生提交
        // } else {
        //     studentSubmissions.value = []
        // }
        gradingPagination.value.total = studentSubmissions.value.length
    }
    //获取考试统计数据（平均分、分布等）
    const fetchStatistics = async (examId) => {
        try {
            const [distRes, rangeRes] = await Promise.all([
                getDistributions(examId),
                getRange(examId)
            ])

            examStatistics.value = {
                averageScore: Number(distRes.averageScore),
                highestScore: distRes.highestScore,
                lowestScore: distRes.lowestScore,
                passRate: Number((distRes.passRate * 100).toFixed(1))
            }

            scoreDistribution.value = rangeRes.map(item => ({
                range: `${item.rangeStart}-${item.rangeEnd}`,
                count: item.count,
                percentage: Number((item.percentage * 100).toFixed(1))
            }))
        } catch (e) {
            console.error(e)
        }

        // examStatistics.value = {
        //     averageScore: 78.5,
        //     highestScore: 96,
        //     lowestScore: 45,
        //     passRate: 89.2
        // }
        // scoreDistribution.value = [
        //     { range: '90-100', count: 23, percentage: 19.5 },
        //     { range: '80-90', count: 15, percentage: 16.5 }
        // ]
    }
    //计算用时
    function calcUsedMinutes(startTime, endTime) {
        if (!startTime || !endTime) return 0

        const start = new Date(startTime)
        const end = new Date(endTime)

        if (isNaN(start) || isNaN(end)) return 0
        return Math.max(0, Math.floor((end - start) / 60000))
    }
    //获取我参与的考试
    const fetchMyExams =async ()=>{
        const res = await getMyexams()
        const records = res.records || []
        allExams.value = records.map(item => {
            const start = splitDateTime(item.examStartTime)
            return {
                id: item.examId,
                examName: item.examName,
                // examCode: item.examId,
                startDate: start.date,
                startTime: start.time,
                duration: item.limitMinutes,
                status: 'ended',
                // hasSubmitted: !!item.testerSubmitTime,
                usedTime: calcUsedMinutes(
                    item.testerStartTime,
                    item.testerSubmitTime
                ),
                score: item.totalScore,
                showAnswers: item.paperShow === 1,
                reviewStatus: item.reviewStatus === 1
            }

        })
    //     allExams.value = [
    //     {
    //         id: 1,
    //         examName: '数学期末考试',
    //         examCode: 'MATH202512',
    //         startDate: '2025-12-25',
    //         startTime: '09:00',
    //         duration: 90,
    //         status: 'ended',
    //         hasSubmitted: true,
    //         usedTime: 85,
    //         score: 92,
    //         showAnswers: true
    //     },
    //     {
    //         id: 2,
    //         examName: '英语听力考试',
    //         examCode: 'ENG202512',
    //         startDate: '2025-12-26',
    //         startTime: '14:00',
    //         duration: 60,
    //         status: 'ongoing',
    //         hasSubmitted: false,
    //         usedTime: null,
    //         score: null,
    //         showAnswers: false
    //     },
    //     {
    //         id: 3,
    //         examName: '物理实验测试',
    //         examCode: 'PHY202512',
    //         startDate: '2025-12-28',
    //         startTime: '10:00',
    //         duration: 120,
    //         status: 'ended',
    //         hasSubmitted: false,
    //         usedTime: null,
    //         score: null,
    //         showAnswers: false
    //     },
    //         {
    //             id: 4,
    //             examName: '物理实验测试',
    //             examCode: 'PHY202512',
    //             startDate: '2025-12-28',
    //             startTime: '10:00',
    //             duration: 120,
    //             status: 'ended',
    //             hasSubmitted: false,
    //             usedTime: null,
    //             score: null,
    //             showAnswers: false
    //         },
    //         {
    //             id: 5,
    //             examName: '物理实验测试',
    //             examCode: 'PHY202512',
    //             startDate: '2025-12-28',
    //             startTime: '10:00',
    //             duration: 120,
    //             status: 'ended',
    //             hasSubmitted: false,
    //             usedTime: null,
    //             score: null,
    //             showAnswers: false
    //         },
    //         {
    //             id: 6,
    //             examName: '物理实验测试',
    //             examCode: 'PHY202512',
    //             startDate: '2025-12-28',
    //             startTime: '10:00',
    //             duration: 120,
    //             status: 'ended',
    //             hasSubmitted: false,
    //             usedTime: null,
    //             score: null,
    //             showAnswers: false
    //         }
    // ]
    }
    // //获取这场考试的题目
    // async function fetchReviewData(examId) {
    //     return {
    //         // 试卷信息
    //         paper: {
    //             examId: examId,
    //             examName: '前端开发基础测试',
    //             totalScore: 40,
    //             questions: [
    //                 {
    //                     id: 1,
    //                     type: 'single',
    //                     score: 5,
    //                     content: 'Vue 的核心特性是？',
    //                     options: [
    //                         '单向数据流',
    //                         '双向数据绑定',
    //                         '直接操作 DOM',
    //                         '模板字符串'
    //                     ],
    //                     answer: 'B'
    //                 },
    //                 {
    //                     id: 2,
    //                     type: 'multiple',
    //                     score: 5,
    //                     content: '以下哪些属于 Vue 的核心特性？',
    //                     options: [
    //                         '组件化',
    //                         '响应式系统',
    //                         '虚拟 DOM',
    //                         '强制使用 TypeScript'
    //                     ],
    //                     answer: ['A', 'B', 'D']
    //                 },
    //                 {
    //                     id: 3,
    //                     type: 'fill',
    //                     score: 10,
    //                     content: 'Vue3 中使用 ____ 对象实现响应式系统。',
    //                     answer: 'Proxy'
    //                 },
    //                 {
    //                     id: 4,
    //                     type: 'judge',
    //                     score: 5,
    //                     content: '在 Vue3 中，ref 只能用于基本数据类型。',
    //                     answer: 'true'
    //                 },
    //                 {
    //                     id: 5,
    //                     type: 'essay',
    //                     score: 15,
    //                     content: '请简述 Vue3 响应式系统的实现原理。',
    //                     answer:
    //                         'Vue3 基于 ES6 的 Proxy 对对象进行代理，拦截数据的读取和修改操作，在依赖收集与触发更新阶段实现高效的响应式更新机制。'
    //                 }
    //             ]
    //         },
    //
    //         // 用户答卷
    //         myAnswer: {
    //             paperId: examId,
    //             studentName: '张三',
    //             answers: ['B', ['A', 'B'], 'proxy', 'false', '555']
    //         }
    //     }
    // }
    const transformAbnormalLogs = (records = []) => {
        return records.map(item => ({
            id: item.id,
            userId: item.userId,
            name: item.name,
            email: item.email,
            behaviorType: item.behaviorType,
            occurTime: formatDateTime(item.occurTime),
            remark: item.remark
        }))
    }
    //获取日常行为日志
    const fetchAbnormalLogs=async (examId)=>{
        // 模拟后端返回的数据
        // const mockData = [
        //     {
        //         id: 1,
        //         userId: 101,
        //         name: '张三',
        //         email: 'zhangsan@example.com',
        //         behaviorType: 'RIGHT_CLICK',
        //         occurTime: '2025-12-20 09:15:32',
        //         remark: '考试过程中多次右键'
        //     },
        //     {
        //         id: 2,
        //         userId: 102,
        //         name: '李四',
        //         email: 'lisi@example.com',
        //         behaviorType: 'TAB_HIDDEN',
        //         occurTime: '2025-12-20 09:18:01',
        //         remark: '切换到其他标签页'
        //     },
        //     {
        //         id: 3,
        //         userId: 101,
        //         name: '张三',
        //         email: 'zhangsan@example.com',
        //         behaviorType: 'FULLSCREEN_EXIT',
        //         occurTime: '2025-12-20 09:20:45',
        //         remark: '退出全屏模式'
        //     },
        //     {
        //         id: 4,
        //         userId: 103,
        //         name: '王五',
        //         email: 'wangwu@example.com',
        //         behaviorType: 'COPY',
        //         occurTime: '2025-12-20 09:25:12',
        //         remark: '复制试题内容'
        //     },
        //     {
        //         id: 5,
        //         userId: 102,
        //         name: '李四',
        //         email: 'lisi@example.com',
        //         behaviorType: 'WINDOW_BLUR',
        //         occurTime: '2025-12-20 09:27:54',
        //         remark: '窗口失去焦点'
        //     },
        //     {
        //         id: 6,
        //         userId: 101,
        //         name: '张三',
        //         email: 'zhangsan@example.com',
        //         behaviorType: 'RIGHT_CLICK',
        //         occurTime: '2025-12-20 09:30:10',
        //         remark: '再次右键'
        //     },
        //     {
        //         id: 7,
        //         userId: 101,
        //         name: '张三',
        //         email: 'zhangsan@example.com',
        //         behaviorType: 'RIGHT_CLICK',
        //         occurTime: '2025-12-20 09:15:32',
        //         remark: '考试过程中多次右键'
        //     },
        //     {
        //         id: 8,
        //         userId: 102,
        //         name: '李四',
        //         email: 'lisi@example.com',
        //         behaviorType: 'TAB_HIDDEN',
        //         occurTime: '2025-12-20 09:18:01',
        //         remark: '切换到其他标签页'
        //     },
        //     {
        //         id: 9,
        //         userId: 101,
        //         name: '张三',
        //         email: 'zhangsan@example.com',
        //         behaviorType: 'FULLSCREEN_EXIT',
        //         occurTime: '2025-12-20 09:20:45',
        //         remark: '退出全屏模式'
        //     },
        //     {
        //         id: 10,
        //         userId: 103,
        //         name: '王五',
        //         email: 'wangwu@example.com',
        //         behaviorType: 'COPY',
        //         occurTime: '2025-12-20 09:25:12',
        //         remark: '复制试题内容'
        //     },
        //     {
        //         id: 11,
        //         userId: 102,
        //         name: '李四',
        //         email: 'lisi@example.com',
        //         behaviorType: 'WINDOW_BLUR',
        //         occurTime: '2025-12-20 09:27:54',
        //         remark: '窗口失去焦点'
        //     },
        //     {
        //         id: 12,
        //         userId: 101,
        //         name: '张三',
        //         email: 'zhangsan@example.com',
        //         behaviorType: 'RIGHT_CLICK',
        //         occurTime: '2025-12-20 09:30:10',
        //         remark: '再次右键'
        //     }
        // ]
        try {
            const res = await getBehavior(examId)
            console.log(res)
            // 假设后端返回：res.records
            abnormalList.value = transformAbnormalLogs(res)
        } catch (error) {
            console.error('获取异常行为日志失败', error)
            abnormalList.value = []
        }
    }
    //重置搜索栏
    const resetExamesearchForm=()=>{
        examsearchForm.value = { examName: '', status: '', dateRange: null }
    }

    const resetGradesearchForm=()=>{
        gradesearchForm.value = { name: '', email: '', status: ''  }
    }

    //重置所有业务状态（考试列表、分页、搜索等）
    const resetPublishedExamState = () => {
        allExams.value = []
        selectedExam.value = null
        examsearchForm.value = { examName: '', status: '', dateRange: null }
        pagination.value = { currentPage: 1, pageSize: 5, total: 0 }
        gradingPagination.value = { currentPage: 1, pageSize: 10, total: 0 }
        studentSubmissions.value = []
        examStatistics.value = { averageScore: 0, highestScore: 0, lowestScore: 0, passRate: 0 }
        scoreDistribution.value = []
    }
    // ==================== 返回 ====================
    return {
        exam,
        setExam,
        abnormalList,
        reportAbnormal,
        formData,
        typeLabelMap,
        typeTagMap,
        getTypeName,
        getTypeTag,
        newQuestion,
        generateExamCode,
        initNewQuestion,
        addOption,
        removeOption,
        saveQuestion,
        editQuestion,
        removeQuestion,
        getQuestionCountByType,
        getTotalScore,
        allExams,
        selectedExam,
        examsearchForm,
        gradesearchForm,
        abnormalSearchForm,
        abnormalTypeText,
        getTagType,
        getTagText,
        pagination,
        gradingPagination,
        logPagination,
        studentSubmissions,
        examStatistics,
        scoreDistribution,
        filteredExams,
        displayExams,
        filteredSubmissions,
        displaySubmissions,
        displayLogs,
        filterAbnormalLogs,
        fetchPublishedExams,
        fetchExamDetail,
        fetchSubmissions,
        fetchStatistics,
        fetchMyExams,
        fetchAbnormalLogs,
        loadReviewProgress,
        // fetchReviewData,
        resetExamesearchForm,
        resetGradesearchForm,
        resetPublishedExamState,
        resetAbnormalSearchForm,
        splitDateTime
    }
})