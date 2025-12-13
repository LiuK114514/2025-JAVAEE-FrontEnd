<template>
  <div class="exam-publisher-page" >
    <!-- 页面标题 -->
    <div class="page-header" >
      <h1>我发布的考试</h1>
      <p class="subtitle">管理您创建和发布的所有考试</p>
    </div>

    <!-- 考试列表视图 -->
    <div v-if="activeView === 'list'" class="exam-list-view">
      <!-- 搜索和筛选栏 -->
      <el-card class="search-card" shadow="never">
        <el-form :inline="true" :model="examStore.examsearchForm" class="search-form">
          <el-form-item label="考试名称">
            <el-input
                v-model="examStore.examsearchForm.examName"
                placeholder="请输入考试名称"
                clearable
                style="width: 200px"
                @clear="examStore.displayExams"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="考试状态">
            <el-select
                v-model="examStore.examsearchForm.status"
                placeholder="全部状态"
                clearable
                style="width: 150px"
                @change="examStore.displayExams"
            >
              <el-option label="未开始" value="upcoming" />
              <el-option label="进行中" value="ongoing" />
              <el-option label="已结束" value="ended" />
            </el-select>
          </el-form-item>

          <el-form-item label="日期范围">
            <el-date-picker
                v-model="examStore.examsearchForm.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 260px"
                @change="examStore.displayExams"
            />
          </el-form-item>

          <el-form-item>
<!--            <el-button type="primary" @click="examStore.displayExams">-->
<!--              <el-icon><Search /></el-icon>-->
<!--              搜索-->
<!--            </el-button>-->
            <el-button @click="examStore.resetExamesearchForm">
              <el-icon><RefreshRight /></el-icon>
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
      <!-- 空状态 -->
      <el-empty
          v-if="examStore.allExams.length === 0"
          description="还没有发布的考试"
          :image-size="200"
      />

      <el-card
          v-else
          v-for="exam in examStore.displayExams"
          :key="exam.id"
          class="exam-card"
          shadow="hover"
      >
        <!-- 考试头部信息 -->
        <div class="exam-header">
          <div class="exam-info">
            <h3>{{ exam.examName }}</h3>
            <div class="exam-meta">
              <el-icon><Calendar /></el-icon>
              <span>{{ exam.startDate }}</span>
              <el-icon><Clock /></el-icon>
              <span>{{ exam.startTime }} ({{ exam.duration }}分钟)</span>
            </div>
          </div>
          <el-tag
              :type="examStore.getTagType(exam.status)"
              size="large"
          >
            {{ examStore.getTagText(exam.status) }}
          </el-tag>
        </div>

        <!-- 统计信息 -->
        <div class="exam-stats">
          <span>参与人数: <strong>{{ exam.participants }}</strong></span>
          <span>已提交: <strong>{{ exam.submitted }}</strong></span>
          <span v-if="exam.status === 'ended'">
            已批阅: <strong>{{ exam.graded }}</strong>
          </span>
          <span>题目数: <strong>{{ exam.questions.length }}</strong></span>
        </div>

        <el-divider />

        <!-- 操作按钮 -->
        <div class="exam-actions">
          <template v-if="exam.status === 'ended'">
            <el-button type="success" plain @click="viewGrading(exam)">
              <el-icon><Document /></el-icon>
              批阅试卷
              <el-badge
                  v-if="exam.submitted - exam.graded > 0"
                  :value="exam.submitted - exam.graded"
                  class="badge-item"
              />
            </el-button>

            <el-button type="warning" plain @click="viewStatistics(exam)">
              <el-icon><DataAnalysis /></el-icon>
              统计分析
            </el-button>
          </template>

          <el-button
              plain
              @click="toggleSettings(exam.id)"
              style="margin-left: auto"
          >
            <el-icon><Setting /></el-icon>
            考试设置
            <el-icon>
              <component :is="expandedExamId === exam.id ? ArrowUp : ArrowDown" />
            </el-icon>
          </el-button>
        </div>

        <!-- 可展开的设置面板 -->
        <el-collapse-transition>
          <div v-show="expandedExamId === exam.id" class="settings-panel">
            <el-divider />
            <div class="settings-info">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="考试时长">
                  {{ exam.duration }} 分钟
                </el-descriptions-item>
                <el-descriptions-item label="题目数量">
                  {{ exam.questions.length }} 题
                </el-descriptions-item>
                <el-descriptions-item label="允许查看成绩">
                  <el-tag :type="exam.showAnswers ? 'success' : 'danger'" size="small">
                    {{ exam.showAnswers ? '是' : '否' }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="考试状态">
                  <el-tag
                      :type="examStore.getTagType(exam.status)"
                      size="large"
                  >
                    {{ examStore.getTagText(exam.status) }}
                  </el-tag>
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
        </el-collapse-transition>
      </el-card>
      <!-- 分页 -->
      <div class="pagination-wrapper" style="text-align: center; margin-top: 20px;">
        <el-pagination
            background
            layout="prev, pager, next, jumper"
            :total="examStore.pagination.total"
            :page-size="examStore.pagination.pageSize"
            :current-page.sync="examStore.pagination.currentPage"
            @current-change="handleExamChange"
        />
      </div>
    </div>


    <!-- 批阅视图 -->
    <el-card v-if="activeView === 'grading' && selectedExam" class="grading-card">
      <!-- 搜索和筛选栏 -->
      <el-card class="search-card" shadow="never">
        <el-form :inline="true" :model="examStore.gradesearchForm" class="search-form">

          <!-- 按学生姓名搜索 -->
          <el-form-item label="考生姓名">
            <el-input
                v-model="examStore.gradesearchForm.name"
                placeholder="请输入考生姓名"
                clearable
                style="width: 200px"
                @clear="examStore.displaySubmissions"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <!-- 按邮箱搜索 -->
          <el-form-item label="邮箱">
            <el-input
                v-model="examStore.gradesearchForm.email"
                placeholder="请输入邮箱"
                clearable
                style="width: 150px"
                @clear="examStore.displaySubmissions"
            />
          </el-form-item>

          <!-- 按提交状态筛选 -->
          <el-form-item label="状态">
            <el-select
                v-model="examStore.gradesearchForm.status"
                placeholder="全部状态"
                clearable
                style="width: 150px"
                @change="examStore.displaySubmissions"
            >
              <el-option label="待批阅" value="ungraded" />
              <el-option label="已批阅" value="graded" />
            </el-select>
          </el-form-item>

          <!-- 搜索/重置按钮 -->
          <el-form-item>
<!--            <el-button type="primary" @click="examStore.displaySubmissions">-->
<!--              <el-icon><Search /></el-icon>-->
<!--              搜索-->
<!--            </el-button>-->
            <el-button @click="examStore.resetGradesearchForm">
              <el-icon><RefreshRight /></el-icon>
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
      <template #header>
        <div class="card-header">
          <h2>批阅试卷 - {{ selectedExam.examName }}</h2>
          <el-button @click="backToList">返回列表</el-button>
        </div>
      </template>

      <el-alert
          type="info"
          :closable="false"
          show-icon
          class="progress-alert"
      >
        <template #title>
          待批阅: <strong>{{ selectedExam.submitted - selectedExam.graded }}</strong> 份 |
          已批阅: <strong>{{ selectedExam.graded }}</strong> 份 |
          总计: <strong>{{ selectedExam.submitted }}</strong> 份
        </template>
      </el-alert>
      <!-- 空状态 -->
      <el-empty
          v-if="examStore.studentSubmissions.length === 0"
          description="还没有考生提交"
          :image-size="200"
      />
      <el-table v-else :data="examStore.displaySubmissions" stripe style="margin-top: 20px">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="name" label="姓名" min-width="100" />
        <el-table-column prop="email" label="邮箱" min-width="120" />
        <el-table-column prop="submitTime" label="提交时间" min-width="150" />

        <!-- 状态列 -->
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag
                :type="row.status === 'graded' ? 'success' : 'warning'"
            >
              {{ row.status === 'graded' ? '已批阅' : '待批阅' }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 分数列 -->
        <el-table-column label="分数" width="100">
          <template #default="{ row }">
            <span v-if="row.status === 'graded'">{{ row.score }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button
                v-if="row.status !== 'graded'"
                type="primary"
                size="small"
                @click="startGrading(row)"
            >
              开始批阅
            </el-button>
            <el-button
                v-else
                type="info"
                size="small"
                plain
                @click="viewGradingDetail(row)"
            >
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <div class="pagination-wrapper" style="text-align: center; margin-top: 20px;">
        <el-pagination
            background
            layout="prev, pager, next, jumper"
            :total="examStore.studentSubmissions.length"
            :page-size="examStore.gradingPagination.pageSize"
            :current-page.sync="examStore.gradingPagination.currentPage"
            @current-change="handleGradeChange"
        />
      </div>
    </el-card>
    <!-- 查看详情对话框 - 全屏模式 -->
    <el-dialog
        v-model="showDetailDialog"
        title="批改详情"
        fullscreen
    >
      <div v-if="showDetailDialog" class="detail-dialog-content">
        <!-- 学生信息和成绩卡片 -->
        <el-card class="result-card" shadow="never">
          <div class="result-header">
            <div class="student-info">
              <h3>{{ currentStudent?.name }}</h3>
              <p>邮箱: {{ currentStudent?.email }}</p>
              <p>提交时间: {{ currentStudent?.submitTime }}</p>
            </div>
            <div class="score-display">
              <div class="score-number" :class="getScoreClass(currentStudent?.score, selectedExam?.totalScore)">
                {{ currentStudent?.score }}
              </div>
              <div class="score-label">总分: {{ selectedExam?.totalScore }}</div>
              <el-tag
                  :type="getScoreTagType(currentStudent?.score, selectedExam?.totalScore)"
                  size="large"
              >
                {{ calculatePercentage(currentStudent?.score, selectedExam?.totalScore) }}%
              </el-tag>
            </div>
          </div>

          <!-- 批改评语 -->
          <el-divider />
          <div v-if="currentStudent?.comment" class="comment-section">
            <h4>批改评语</h4>
            <div class="comment-content">{{ currentStudent.comment }}</div>
          </div>
        </el-card>

        <!-- 答题详情 -->
        <ExamAnswerSheet
            mode="review"
            :exam-data="detailExamData"
            :initial-answers="detailAnswers"
            @close="showDetailDialog = false"
        />
      </div>
    </el-dialog>

    <!-- 统计视图 -->
    <el-card v-if="activeView === 'statistics' && selectedExam" class="statistics-card">
      <template #header>
        <div class="card-header">
          <h2>统计分析 - {{ selectedExam.examName }}</h2>
          <el-button @click="backToList">返回列表</el-button>
        </div>
      </template>

      <el-row :gutter="20" class="stats-row">
        <el-col :span="6">
          <el-statistic title="平均分" :value="examStore.examStatistics.averageScore">
            <template #prefix>
              <el-icon color="#409EFF"><TrendCharts /></el-icon>
            </template>
          </el-statistic>
        </el-col>
        <el-col :span="6">
          <el-statistic title="最高分" :value="examStore.examStatistics.highestScore">
            <template #prefix>
              <el-icon color="#67C23A"><Top /></el-icon>
            </template>
          </el-statistic>
        </el-col>
        <el-col :span="6">
          <el-statistic title="最低分" :value="examStore.examStatistics.lowestScore">
            <template #prefix>
              <el-icon color="#E6A23C"><Bottom /></el-icon>
            </template>
          </el-statistic>
        </el-col>
        <el-col :span="6">
          <el-statistic title="及格率" :value="examStore.examStatistics.passRate">
            <template #suffix>%</template>
            <template #prefix>
              <el-icon color="#909399"><Checked /></el-icon>
            </template>
          </el-statistic>
        </el-col>
      </el-row>

      <el-divider content-position="left">
        <h3>分数分布</h3>
      </el-divider>

      <div class="score-distribution">
        <div
            v-for="item in examStore.scoreDistribution"
            :key="item.range"
            class="distribution-item"
        >
          <span class="range-label">{{ item.range }}分</span>
          <el-progress
              :percentage="item.percentage"
              :color="getProgressColor(item.range)"
              :stroke-width="26"
              :show-text="false"
          />
          <span class="count-label">{{ item.count }}人</span>
          <span class="percentage-label">{{ item.percentage }}%</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import {onMounted, ref, watch} from 'vue'
import {ArrowDown, ArrowUp} from "@element-plus/icons-vue";
import { useExamStore } from '../stores/examStore'
import { useGradeStore } from '../stores/gradeStore'
import { useAnswerCardStore } from "../stores/answerCardStore.js";

const examStore = useExamStore()
const gradeStore = useGradeStore()
const answerCardStore = useAnswerCardStore()
// 当前视图状态
const activeView = ref('list')//当前界面：list/detail/grading/statistics
const selectedExam = ref(null)
const expandedExamId = ref(null)
// 获取考试列表
onMounted(() => {
  examStore.fetchPublishedExams()
})
//换页
//换页后回滚到顶部
const handleExamChange=(page)=>{
  examStore.pagination.currentPage = page

}
const handleGradeChange=(grade)=>{
  examStore.gradingPagination.currentPage = grade
}

// 切换设置面板
const toggleSettings = (examId) => {
  expandedExamId.value = expandedExamId.value === examId ? null : examId
}

// 查看批阅
const viewGrading = (exam) => {
  selectedExam.value = exam
  examStore.fetchSubmissions(exam.id)
  activeView.value = 'grading'
}

// 查看统计
const viewStatistics = (exam) => {
  selectedExam.value = exam
  examStore.fetchStatistics(exam.id)
  activeView.value = 'statistics'
}

// 返回列表
const backToList = () => {
  activeView.value = 'list'
  selectedExam.value = null
  examStore.pagination.total = examStore.filteredExams.length
  examStore.pagination.currentPage = 1
}

// 开始批阅
const props = defineProps({
  activeView: String,
  selectedExam: Object
})

const emit = defineEmits(['back-to-list'])
const showGradingDialog = ref(false)
const showDetailDialog = ref(false)
const currentExamData = ref(null)
const currentAnswers = ref({})
const currentStudent = ref(null)
const detailExamData = ref(null)
const detailAnswers = ref({})

const startGrading = (row) => {
  try {
    // 1. 验证试卷数据
    if (!props.selectedExam) {
      ElMessage.error('试卷数据不存在')
      return
    }

    // 2. 验证学生提交数据
    if (!row.answers) {
      ElMessage.error('学生答案数据不存在')
      return
    }

    // 3. 设置当前学生信息
    currentStudent.value = {
      id: row.id,
      name: row.name,
      email: row.email,
      submitTime: row.submitTime
    }

    // 4. 准备试卷数据 - 深拷贝避免直接修改原数据
    currentExamData.value = JSON.parse(JSON.stringify(props.selectedExam))

    // 5. 设置学生答案
    currentAnswers.value = { ...row.answers }

    // 6. 自动批改客观题
    autoGradeObjective(currentExamData.value, currentAnswers.value)

    // 7. 打开批改对话框
    showGradingDialog.value = true

    ElMessage.success('已加载试卷,可以开始批改')
  } catch (error) {
    console.error('开始批改失败:', error)
    ElMessage.error('开始批改失败,请重试')
  }
}

// 查看批阅详情
const viewGradingDetail = (student) => {
  console.log('查看批阅详情:', student)
  // 这里添加你的查看详情逻辑
}

// 获取进度条颜色
const getProgressColor = (range) => {
  const colors = {
    '90-100': '#67C23A',
    '80-89': '#409EFF',
    '70-79': '#E6A23C',
    '60-69': '#F56C6C',
    '0-59': '#909399'
  }
  return colors[range] || '#409EFF'
}
</script>

<style scoped>
.exam-publisher-page {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin: 0 0 8px 0;
}

.subtitle {
  color: #909399;
  margin: 0;
  font-size: 14px;
}

.exam-list-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.exam-card {
  transition: all 0.3s;
}

.exam-card:hover {
  transform: translateY(-2px);
}

.exam-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.exam-info h3 {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px 0;
}

.exam-meta {
  display: flex;
  gap: 16px;
  align-items: center;
  color: #606266;
  font-size: 14px;
}

.exam-meta .el-icon {
  margin-right: 4px;
}

.exam-stats {
  display: flex;
  gap: 24px;
  color: #606266;
  font-size: 14px;
  margin-bottom: 16px;
}

.exam-stats strong {
  color: #303133;
  font-weight: 600;
}

.exam-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.badge-item {
  margin-left: 8px;
}

.settings-panel {
  margin-top: 16px;
}

.settings-info {
  padding-top: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.detail-card,
.grading-card,
.statistics-card {
  max-width: 1200px;
}

.progress-alert {
  margin-bottom: 20px;
}

.stats-row {
  margin-bottom: 32px;
}

.stats-row .el-statistic {
  text-align: center;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.score-distribution {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.distribution-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.range-label {
  width: 80px;
  font-weight: 600;
  color: #606266;
}

.distribution-item .el-progress {
  flex: 1;
}

.count-label {
  width: 50px;
  text-align: right;
  color: #303133;
  font-weight: 600;
}

.percentage-label {
  width: 60px;
  text-align: right;
  color: #909399;
  font-size: 14px;
}

@media (max-width: 768px) {
  .exam-header {
    flex-direction: column;
    gap: 12px;
  }

  .exam-actions {
    flex-direction: column;
    width: 100%;
  }

  .exam-actions .el-button {
    width: 100%;
  }

  .stats-row .el-col {
    margin-bottom: 16px;
  }
}
</style>