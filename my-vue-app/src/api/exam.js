import request from '../util/request.js'
import { useExamStore } from '../stores/examStore'

//发布考试
export function createExam(data) {
    return request.post('/test/exams', JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' }
    })
}
//获取已发布的考试列表
export function getAllExams() {
    return request.get('/exam/my-exam/creator')
}
//获取参与的学生列表
export function getAllStudents(examId) {
    return request.get(`/exam/${examId}/grades`)
}
//获取批改信息
export function getReviewedCount(examId) {
    return request.get(`/exam/paper/${examId}/progress`)
}
//获取成绩的统计情况
export function getDistributions(examId) {
    return request.get(`/exam/${examId}/distribution`)
}
//获取分数段情况
export function getRange(examId) {
    return request.get(`/exam/${examId}/ranges`)
}
//获取我参与的考试
export function getMyexams() {
    return request.post('/exam/my-exam/tester')
}

//获取某场考试的具体题目和学生答案
export function getGradePaper(examId,userId){
    return request.get(`/exam/my-exam/details/${examId}`,{userId:userId})
}
export function getReviewPaper(examId,userId = -1) {
    return request.get(`/exam/my-exam/details/${examId}`,{userId:userId})
}
//提交批改结果
export function postJudge(examId, data) {
    return request.post(`/exam/paper/${examId}/judge`,JSON.stringify(data))
}
//提交作答结果
export function postAnswer(data) {
    return request.post(`/exam/submit/paper`,data)
}
//暂存
export function postAutoSave(data) {
    return request.post(`/exam/auto-save/`,data)
}
//根据考试码查询考试
export function getExamByCode(data) {
    return request.get(`/exam/check?code=${data}`)
}
//获取考试具体题目
export function getExamQuestions(examId) {
    return request.get(`/exam/${examId}/start`)
}
//获取异常行为日志
export function getBehavior(examId) {
    return request.get(`/abnormal/get/behavior?examId=${examId}`)
}
export function postAbnormal(examId,data) {
    return request.post(`/exam/${examId}/submit/abnormal`,data)
}
//获取ai解答
export async function getAIAnswer(prompt) {
    return request.post('/ai',prompt);
}

