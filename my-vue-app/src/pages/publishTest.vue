<template xmlns="http://www.w3.org/1999/html">
  <div class="exam-publish-container">
    <el-card class="exam-card">
      <!-- 页面标题 -->
      <template #header>
        <div class="card-header">
          <h1>发布新考试</h1>
          <p>请按照步骤填写考试信息</p>
        </div>
      </template>

      <!-- 步骤条 -->
      <el-steps :active="active" finish-status="success" align-center style="margin-bottom: 40px">
        <el-step title="基本设置" />
        <el-step title="设计试卷" />
        <el-step title="确认发布" />
      </el-steps>
      <el-divider />
      <!-- 表单内容 -->
      <div class="form-content">
        <!-- 步骤 1: 基本信息 -->
        <div v-show="active === 0" class="step-content">
          <el-form :model="examStore.formData" label-width="120px" label-position="left">
            <el-form-item label="考试名称" required>
              <el-input
                  v-model="examStore.formData.examName"
                  clearable
              />
            </el-form-item>


            <el-form-item label="考试说明">
              <el-input
                  v-model="examStore.formData.description"
                  type="textarea"
                  :rows="4"
                  placeholder="请填写考试的注意事项、考试范围等信息"
              />
            </el-form-item>
            <el-divider />
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="开始日期" required>
                  <el-date-picker
                      v-model="examStore.formData.startDate"
                      type="date"
                      placeholder="选择日期"
                      style="width: 100%"
                      format="YYYY-MM-DD"
                      value-format="YYYY-MM-DD"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="开始时间" required>
                  <el-time-picker
                      v-model="examStore.formData.startTime"
                      placeholder="选择时间"
                      style="width: 100%"
                      format="HH:mm"
                      value-format="HH:mm"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="考试时长" required>
              <el-input-number
                  v-model="examStore.formData.duration"
                  :min="1"
                  :step="5"
                  style="width: 40%"
              />
              <span style="margin-left: 10px; color: #909399">分钟</span>
            </el-form-item>


            <el-divider />
            <el-form-item label="其他设置">
              <div style="display: flex; flex-direction: column; gap: 12px">
                <el-checkbox v-model="examStore.formData.showAnswers">
                  交卷后显示成绩
                </el-checkbox>
              </div>
            </el-form-item>
          </el-form>
        </div>

        <!-- 步骤 2: 设计试卷 -->
        <div v-show="active === 1" class="step-content">
          <div class="question-design">
            <div class="question-toolbar">
              <!-- 添加题目按钮组 -->
              <el-dropdown @command="openAddQuestionDialog" size="large">
                <el-button type="primary" size="large">
                  添加题目
                  <el-icon><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="judge">
                      <el-icon><CircleCheck /></el-icon>
                      添加判断题
                    </el-dropdown-item>

                    <el-dropdown-item command="single">
                      <el-icon><List /></el-icon>
                      添加单选题
                    </el-dropdown-item>

                    <el-dropdown-item command="multiple">
                      <el-icon><List /></el-icon>
                      添加多选题
                    </el-dropdown-item>

                    <el-dropdown-item command="fill">
                      <el-icon><EditPen /></el-icon>
                      添加填空题
                    </el-dropdown-item>

                    <el-dropdown-item command="essay">
                      <el-icon><Document /></el-icon>
                      添加简答题
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>

              <!-- 导入题目 -->
              <el-upload
                  :before-upload="handleBeforeImport"
                  :show-file-list="false"
                  accept=".json,.xlsx,.xls"
              >
                <el-button type="success" size="large">
                  <el-icon><UploadFilled /></el-icon>
                  导入文件
                </el-button>
              </el-upload>
            </div>
          </div>


            <!-- 题目列表 -->
            <div class="questions-list">
              <el-empty
                  v-if="examStore.formData.questions.length === 0"
                  description="暂无题目，请前往新增页面添加"
              />

              <div
                  v-for="(question, index) in examStore.formData.questions"
                  :key="question.id"
                  class="question-item"
              >
                <el-card shadow="hover">
                  <!-- 题目标题栏 -->
                  <template #header>
                    <div class="question-header">
                     <span class="question-title">
                      <el-tag :type="getQuestionTypeTag(question.type)" size="small">
                        {{ getQuestionTypeName(question.type) }}
                      </el-tag>
                      <span style="margin-left: 10px">第 {{ index + 1 }} 题</span>
                    </span>
                      <div>
                        <el-button
                            type="primary"
                            size="small"
                            round
                            @click="goEdit(question.id)"
                        >
                          <el-icon><EditPen /></el-icon> 编辑
                        </el-button>

                        <el-button
                            type="danger"
                            size="small"
                            round
                            @click="removeQuestion(index)"
                        >
                          <el-icon><Delete /></el-icon> 删除
                        </el-button>
                      </div>
                    </div>
                  </template>

                  <!-- 题目内容展示 -->
                  <div class="question-content">
                    <p class="q-content"><b>题目：</b>{{ question.content }}</p>

                    <!-- 判断题 -->
                    <div v-if="question.type === 'judge'">
                      <p><b>答案：</b>{{ question.correctAnswer ? '正确' : '错误' }}</p>
                    </div>

                    <!-- 填空题 -->
                    <div v-if="question.type === 'fill'">
                      <p><b>参考答案：</b>{{ question.answer || '无' }}</p>
                    </div>

                    <!-- 单选题 -->
                    <div v-if="question.type === 'single'">
                      <div v-for="(opt, idx) in question.options" :key="idx">
                        <span><b>{{ String.fromCharCode(65 + idx) }}：</b>{{ opt }}</span>
                      </div>
                      <p>
                        <b>正确答案：</b>
                        {{ question.answer || '无' }}
                      </p>
                    </div>

                    <!-- 多选题 -->
                    <div v-if="question.type === 'multiple'">
                      <div v-for="(opt, idx) in question.options" :key="idx">
                        <span><b>{{ String.fromCharCode(65 + idx) }}：</b>{{ opt }}</span>
                      </div>
                      <p>
                        <b>正确答案：</b>
                        {{
                          question.correctAnswer.join('、')
                        }}
                      </p>
                    </div>

                    <!-- 大题 -->
                    <div v-if="question.type === 'essay'">
                      <p><b>参考答案：</b>{{ question.answer || '无' }}</p>
                    </div>
                    <p><b>分值：</b>{{ question.score }} 分</p>
                    <p><b>解析：</b>{{ question.analysis }}</p>
                  </div>
                </el-card>
              </div>
            </div>
            <!-- 题目统计 -->
            <el-card v-if="examStore.formData.questions.length > 0" shadow="never" style="margin-top: 20px; background-color: #f5f7fa">
              <div class="question-summary">
                <span>共 {{ examStore.formData.questions.length }} 道题</span>
                <el-divider direction="vertical" />
                <span>判断题: {{ getQuestionCountByType('judge') }} 道</span>
                <el-divider direction="vertical" />
                <span>单选题: {{ getQuestionCountByType('single') }} 道</span>
                <el-divider direction="vertical" />
                <span>多选题: {{ getQuestionCountByType('multiple') }} 道</span>
                <el-divider direction="vertical" />
                <span>填空题: {{ getQuestionCountByType('fill') }} 道</span>
                <el-divider direction="vertical" />
                <span>简答题: {{ getQuestionCountByType('essay') }} 道</span>
                <el-divider direction="vertical" />
                <span>总分: {{ getTotalQuestionScore() }} 分</span>
              </div>
            </el-card>

            <!-- 新增题目对话框 -->
            <el-dialog v-model="addDialogVisible" :title="dialogTitle" >
              <el-form :model="examStore.newQuestion" label-width="90px">
                <!-- 题目内容 -->
                <el-form-item label="题目内容" required>
                  <el-input v-model="examStore.newQuestion.content" type="textarea" :rows="3" placeholder="请输入题目内容" />
                </el-form-item>
                <!-- 判断题 -->
                <template v-if="examStore.newQuestion.type === 'judge'">
                  <el-form-item label="正确答案">
                    <el-radio-group v-model="examStore.newQuestion.answer">
                      <el-radio :label="true">正确</el-radio>
                      <el-radio :label="false">错误</el-radio>
                    </el-radio-group> </el-form-item>
                </template>
                <!-- 单选题 -->
                <template v-if="examStore.newQuestion.type === 'single'">
                  <el-form-item label="选项设置">
                    <div v-for="(opt, idx) in examStore.newQuestion.options" :key="idx" class="option-item">
                      <el-radio v-model="examStore.newQuestion.answer"
                                :label="String.fromCharCode(65 + idx)">
                        {{ String.fromCharCode(65 + idx) }}.
                      </el-radio> <el-input v-model="examStore.newQuestion.options[idx]" placeholder="请输入选项内容" />
                      <el-button
                          v-if="examStore.newQuestion.options.length > 2"
                          type="danger" size="small"
                          link
                          @click="removeTempOption(idx)" >
                        <el-icon><Delete /></el-icon>
                      </el-button>
                    </div>
                    <el-button
                        v-if="examStore.newQuestion.options.length < 6"
                        type="primary"
                        size="small"
                        plain
                        @click="addTempOption" >
                      <el-icon><Plus /></el-icon>
                      添加选项
                    </el-button>
                  </el-form-item>
                </template>
                <!-- 多选题 -->
                <template v-if="examStore.newQuestion.type === 'multiple'">
                  <el-form-item label="选项设置">
                    <div v-for="(opt, idx) in examStore.newQuestion.options" :key="idx" class="option-item">
                      <el-checkbox v-model="examStore.newQuestion.correctAnswer" :label="String.fromCharCode(65 + idx)" >
                        {{ String.fromCharCode(65 + idx) }}.
                      </el-checkbox>
                      <el-input v-model="examStore.newQuestion.options[idx]" placeholder="请输入选项内容" />
                      <el-button
                          v-if="examStore.newQuestion.options.length > 2"
                          type="danger" size="small"
                          link
                          @click="removeTempOption(idx)" >
                        <el-icon><Delete /></el-icon>
                      </el-button>
                    </div>
                    <el-button
                        v-if="examStore.newQuestion.options.length < 6"
                        type="primary"
                        size="small"
                        plain
                        @click="addTempOption" >
                      <el-icon><Plus /></el-icon>
                      添加选项 </el-button>
                  </el-form-item>
                </template>
                <!-- 填空题 -->
                <template v-if="examStore.newQuestion.type === 'fill'">
                  <el-form-item label="参考答案">
                    <el-input v-model="examStore.newQuestion.answer" placeholder="请输入参考答案" />
                  </el-form-item>
                </template>
                <!-- 大题 -->
                <template v-if="examStore.newQuestion.type === 'essay'">
                  <el-form-item label="参考答案">
                    <el-input v-model="examStore.newQuestion.answer" type="textarea" :rows="3" placeholder="参考答案（选填）" />
                  </el-form-item> </template>
                <!-- 分数 -->
                <el-form-item label="分值">
                  <el-input-number v-model="examStore.newQuestion.score" :min="1" :step="1" />
                  <span style="margin-left: 10px; color: #909399">分</span>
                </el-form-item>
                <!-- 解析 -->
                <el-form-item label="解析" >
                  <el-input v-model="examStore.newQuestion.analysis" type="textarea" :rows="3" placeholder="请输入解析" />
                </el-form-item>
              </el-form>
              <template #footer>
                <el-button @click="addDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="confirmAddQuestion">确定</el-button>
              </template>
            </el-dialog>
        </div>
        <!-- 步骤 3: 确认发布 -->
        <div v-show="active === 2" class="step-content">
          <el-alert
              title="请确认以下考试信息"
              type="warning"
              :closable="false"
              style="margin-bottom: 20px"
          />

          <el-descriptions title="基本信息" :column="2" border>
            <el-descriptions-item label="考试名称">
              {{ examStore.formData.examName || '未填写' }}
            </el-descriptions-item>
            <el-descriptions-item label="试卷码">
              <el-tag type="success" size="large">
                {{ examStore.formData.examCode || '未生成' }}
              </el-tag>
              <el-button
                  type="danger"
                  size="small"
                  plain
                  @click="regenerateExamCode"
                  style="margin-left:30px"
              >
                重新生成
              </el-button>
            </el-descriptions-item>
<!--            <el-descriptions-item label="考试说明" :span="2">-->
<!--              {{ examStore.formData.description || '无' }}-->
<!--            </el-descriptions-item>-->
          </el-descriptions>

          <el-descriptions title="考试设置" :column="2" border style="margin-top: 20px">
            <el-descriptions-item label="开始时间">
              {{ examStore.formData.startDate }} {{ examStore.formData.startTime || '未设置' }}
            </el-descriptions-item>
            <el-descriptions-item label="考试时长">
              {{ examStore.formData.duration }} 分钟
            </el-descriptions-item>
            <el-descriptions-item label="显示成绩">
              <el-tag :type="examStore.formData.showAnswers ? 'success' : 'info'" size="small">
                {{ examStore.formData.showAnswers ? '是' : '否' }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>

          <!-- 试卷信息 -->
          <el-descriptions title="试卷信息" :column="2" border style="margin-top: 20px">
            <el-descriptions-item label="判断数量">
              {{ getQuestionCountByType('judge') || 0 }} 道
            </el-descriptions-item>
            <el-descriptions-item label="单选题数量">
              {{getQuestionCountByType('single') || 0 }} 道
            </el-descriptions-item>
            <el-descriptions-item label="多选题数量">
              {{ getQuestionCountByType('multiple') || 0 }} 道
            </el-descriptions-item>
            <el-descriptions-item label="填空题数量">
              {{ getQuestionCountByType('fill') || 0 }} 道
            </el-descriptions-item>
            <el-descriptions-item label="简答题数量">
              {{ getQuestionCountByType('essay')|| 0 }} 道
            </el-descriptions-item>
            <el-descriptions-item label="总分" :span="2">
              {{ getTotalQuestionScore() || 0 }} 分
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
      <!-- 按钮组 -->
      <div class="button-group">
        <el-button @click="prev" :disabled="active === 0">
          上一步
        </el-button>
        <el-button type="primary" @click="active === 2 ? handleSubmit() : next()">
          {{ active === 2 ? '确认发布' : '下一步' }}
        </el-button>
      </div>

    </el-card>
  </div>
</template>
<script setup>
import {computed, onMounted, ref} from 'vue'
import {ElMessage} from "element-plus";
import {Delete} from "@element-plus/icons-vue";
import { useExamStore } from '../stores/examStore'
import {createExam} from "../api/exam.js";
import * as XLSX from 'xlsx'
import router from "../router/router.js";
const examStore = useExamStore()
const active = ref(0)

//生成试卷码
onMounted(() => {
  const logInfo = localStorage.getItem('userInfo')
  if (!logInfo) {
    router.replace('/login')
  }
  if (!examStore.formData.examCode) {
    examStore.formData.examCode = examStore.generateExamCode()
    examStore.formData.description='1. 本次考试为线上闭卷考试，请在规定时间内独立完成，不得与他人交流或使用任何未授权的资料。\n' +
        '2. 考试开始后请勿刷新页面、关闭浏览器或切换至其他应用，否则可能导致考试中断或成绩异常。\n' +
        '3. 请在考试开始前检查网络环境及设备状态，确保摄像头、键盘及浏览器运行正常。\n' +
        '4. 考试过程中请严格遵守考试纪律，如发现作弊行为，成绩将按无效处理。\n' +
        '5. 请合理安排作答时间，系统将在考试结束时自动提交试卷，未提交的作答将无法计入成绩。\n' +
        '6. 若考试过程中出现异常情况，请及时联系监考人员或管理员。\n' +
        '7. 本次考试的最终解释权归考试组织方所有。'
  }

})
//重新生成试卷码
const regenerateExamCode=()=>{
  examStore.formData.examCode = examStore.generateExamCode()
}

const next = () => {
  if (active.value < 2) {
    active.value++
  }
}

const prev = () => {
  if (active.value > 0) {
    active.value--
  }
}

const handleSubmit = async () => {
  if (!examStore.formData.examCode) {
    ElMessage.error('试卷码未生成')
    return
  }

  try {
    console.log(examStore.formData)
    await createExam(examStore.formData)
    ElMessage.success('考试发布成功！')
    // console.log('提交的数据：', examStore.formData)
  } catch (err) {
    ElMessage.error('考试发布失败！')
  }
}



//添加题目
//导入excel
const handleBeforeImport = (file) => {
  // 这里你可以调用后端接口上传文件
  ElMessage.success("文件已选择：" + file.name);
  const reader = new FileReader()

  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result)
    const workbook = XLSX.read(data, { type: 'array' })

    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]

    // 转 JSON（以表头为 key）
    const rawList = XLSX.utils.sheet_to_json(sheet)

    if (!rawList.length) {
      ElMessage.error('Excel 中没有题目数据')
      return
    }

    const questionList = rawList.map(formatExcelQuestion)

    // 合并进当前试卷题目列表
    examStore.formData.questions.push(...questionList)

    ElMessage.success(`成功导入 ${questionList.length} 道题目`)
  }

  reader.readAsArrayBuffer(file)
  return false
};
//题目对象映射
const headerMap = {
  '题型': 'type',
  '试题内容': 'content',
  '选项A': 'A',
  '选项B': 'B',
  '选项C': 'C',
  '选项D': 'D',
  '选项E': 'E',
  '答案': 'answer',
  '分值': 'score',
  '解析':'analysis',
}

const typeMap = {
  '单选题':'single',
  '多选题':'multiple',
  '判断题':'judge',
  '填空题':'fill',
  '简答题':'essay',
}
const judgeAnswerMap = {
  '对': 'true',
  '正确': 'true',
  '是': 'true',
  '错': 'false',
  '错误': 'false',
  '否': 'false'
}
const formatExcelQuestion = (rawRow, index) => {
  // 1. 表头映射
  const row = {}
  Object.keys(rawRow).forEach(key => {
    if (headerMap[key]) {
      row[headerMap[key]] = rawRow[key]
    }
  })

  // 2. 题型转换
  const type = typeMap[row.type?.trim()]
  console.log(type)
  if (!type) {
    ElMessage.error(`第 ${index + 2} 行：题型不正确`)
    throw new Error(`第 ${index + 2} 行：题型不正确`)
  }

  // 3. 选项数组（顺序非常重要）
  const options = []
  if (row.A) options.push(row.A)
  if (row.B) options.push(row.B)
  if (row.C) options.push(row.C)
  if (row.D) options.push(row.D)
  if (row.E) options.push(row.E)

  if ((type === 'single' ||type === 'multiple')&& options.length < 2) {
    ElMessage.error(`第 ${index + 2} 行：选项数量不足`)
    throw new Error(`第 ${index + 2} 行：选项数量不足`)
  }

  // 4. 答案处理
  let answer = ''
  let correctAnswer = []

  if (type === 'multiple') {
    correctAnswer = row.answer.split(',').map(a => a.trim())
  }

  if (type === 'judge') {
    answer = judgeAnswerMap[row.answer?.trim()]
  }
  else {
    answer = row.answer != null ? row.answer.toString().trim() : ''
  }
  // 5. 返回你系统真正使用的结构
  return {
    id: Date.now() + index,
    type,
    content: row.content,
    score: Number(row.score) || 1,
    options,
    answer,
    correctAnswer,
    analysis: row.analysis || ''
  }
}
// 弹窗开关
const addDialogVisible = ref(false)
const dialogTitle = ref("")

//弹出对话框
const openAddQuestionDialog=(type)=>{
  examStore.initNewQuestion(type)
  dialogTitle.value =
      type === 'fill' ? '新增填空题' :
          type === 'single' ? '新增单选题' :
              type === 'multiple' ? '新增多选题' :
                  type === 'judge' ? '新增判断题' :
                      type === 'essay' ? '新增简答题' : '新增题目'
  addDialogVisible.value = true
}
// 弹窗 - 添加选项
const addTempOption = () => {
  examStore.addOption()
}

// 弹窗 - 删除选项
const removeTempOption = (index) => {
  examStore.removeOption(index)
}

// 点击确定 → 推入题目列表
const confirmAddQuestion = () => {
  examStore.saveQuestion()
  addDialogVisible.value = false
}

//题目列表展示
const getQuestionTypeTag = (type) => {
  return examStore.getTypeTag(type)
}
//获取题目类型
const getQuestionTypeName = (type) => {
 return  examStore.getTypeName(type)
}
//获取题目数量
const getQuestionCountByType = (type) => {
  return examStore.getQuestionCountByType(type)
}
// 统计总分
const getTotalQuestionScore = () => {
  return examStore.getTotalScore()
}
//删除题目
const removeQuestion=(index)=>{
  examStore.removeQuestion(index)
}
//编辑题目
const goEdit=(questionId)=>{
  examStore.editQuestion(questionId)
  const type = examStore.newQuestion.type
  dialogTitle.value =
      type === 'fill' ? '编辑填空题' :
          type === 'single' ? '编辑单选题' :
              type === 'multiple' ? '编辑多选题' :
                  type === 'judge' ? '编辑判断题' :
                      type === 'essay' ? '编辑简答题' :
                          '编辑题目'

  addDialogVisible.value = true
}

</script>
<style scoped>
.exam-publish-container {
  min-height: 100vh;

  padding: 30px 20px;
  margin: 0;
}

.exam-card {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  color: #303133;
}

.card-header p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.form-content {
  min-height: 400px;
  padding: 20px 0;
}

.step-content {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}



.button-group {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #DCDFE6;
}

:deep(.el-step__title) {
  font-size: 14px;
}

:deep(.el-descriptions__title) {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
}

/*题目列表展示*/
.question-content {
  font-size: 14px;
  line-height: 1.6;
  padding: 5px 0;
}

.q-content {
  margin-bottom: 10px;
  font-weight: 500;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 题目设计样式 */
/* 对话框整体 */
 ::v-deep(.el-dialog) {
   width: 900px !important;
   height: 550px !important;
   max-width: 95vw !important;
   max-height: 80vh !important;
   border-radius: 14px !important;
   padding: 20px 30px !important;
   box-shadow: 0 8px 20px rgba(0,0,0,0.15);
   background-color: #ffffff;
   display: flex;
   flex-direction: column;
 }
.question-toolbar {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}
/* 对话框标题 */
::v-deep(.el-dialog__header) {
  font-size: 22px !important;
  font-weight: 600;
  color: #303133;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 12px;
}

/* 对话框内容区域，可滚动 */
::v-deep(.el-dialog__body) {
  flex: 1;
  overflow-y: auto;
  padding-right: 10px;
}

/* 底部按钮固定 */
::v-deep(.el-dialog__footer) {
  text-align: right;
  padding-top: 15px;
  border-top: 1px solid #ebeef5;
  flex-shrink: 0;
}

::v-deep(.el-dialog__footer .el-button) {
  min-width: 90px;
}

/* 表单标签 */
::v-deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
  width: 120px;
}

/* 多行输入框 */
::v-deep(.el-input--textarea) {
  resize: vertical;
  font-size: 14px;
  color: #606266;
  min-height: 60px;
}

/* 分数输入框 */
::v-deep(.el-input-number) {
  width: 140px;
}

/* 选择题每个选项容器 */
.option-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

/* 单选按钮 */
.option-item .el-radio {
  flex-shrink: 0;
  width: 30px;
  margin-left: 5px;
  margin-right: 1px;
}

/* 输入框占满剩余空间 */
.option-item .el-input {
  flex: 1;
  min-width: 150px;
}

/* 删除按钮 */
.option-item .el-button {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 0;
}

/* 添加选项按钮 */
.el-form-item > .el-button[plain] {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  padding: 4px 10px;
}

/* 响应式调整，小屏幕下自动换行 */
@media (max-width: 800px) {
  ::v-deep(.el-dialog) {
    width: 95vw !important;
    padding: 15px 20px !important;
  }
  ::v-deep(.el-form-item__label) {
    width: 100px;
  }
  .option-item {
    flex-wrap: wrap;
    gap: 8px;
  }
  .option-item .el-radio {
    width: auto;
  }
}

.question-design {
  width: 100%;
}


.questions-list {
  margin-top: 20px;
}

.question-item {
  margin-bottom: 20px;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.question-title {
  display: flex;
  align-items: center;
  font-weight: 500;
}

.choice-options {
  width: 100%;
}

.option-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.question-summary {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #606266;
}

:deep(.el-card__body) {
  padding: 20px;
}

.preview-question {
  margin-bottom: 15px;
}

.preview-question-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.preview-question-content {
  padding: 10px 0;
  line-height: 1.6;
  color: #303133;
}

.preview-options {
  margin-top: 10px;
  padding-left: 20px;
}

.preview-options > div {
  margin: 8px 0;
  color: #606266;
}
</style>