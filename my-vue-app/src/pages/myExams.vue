<template>
  <!-- 页面标题 -->
  <div class="page-header">
    <h1>我参与的考试</h1>
    <p class="subtitle">查看并管理您参加过的所有考试</p>
    <!-- 考试列表视图 -->
    <div  class="exam-list-view">
      <!-- 搜索和筛选栏 -->
      <el-card class="search-card" shadow="never">
        <el-form
            :inline="true"
            :model="examStore.examsearchForm"
            class="search-form"
        >
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
          description="暂无参与的考试"
          :image-size="200"
      />

      <!-- 考试卡片 -->
      <el-card
          v-else
          v-for="exam in examStore.displayExams"
          :key="exam.id"
          class="exam-card"
          shadow="hover"
      >
        <!-- 考试头部 -->
        <div class="exam-header">
          <div class="exam-info">
            <h3>
              {{ exam.examName }}
              <el-tag
                  type="info"
                  size="small"
                  class="exam-code-tag"
              >
                考试码：{{ exam.examCode }}
              </el-tag>
            </h3>

            <div class="exam-meta">
              <el-icon><Calendar /></el-icon>
              <span>{{ exam.startDate }}</span>
              <el-icon><Clock /></el-icon>
              <span>{{ exam.startTime }}（{{ exam.duration }}分钟）</span>
            </div>
          </div>

          <el-tag
              :type="examStore.getTagType(exam.status)"
              size="large"
          >
            {{ examStore.getTagText(exam.status) }}
          </el-tag>
        </div>

        <!-- 个人考试信息 -->
        <div class="exam-stats">
          <span v-if="exam.hasSubmitted">
          用时: <strong>{{ exam.usedTime }} 分钟</strong>
        </span>
          <span v-if="exam.status === 'ended' && exam.score !== null">
          得分: <strong>{{ exam.score }}</strong>
        </span>
        </div>

        <el-divider />

        <!-- 操作按钮 -->
        <div class="exam-actions">
            <el-button
                type="success"
                plain
                @click="viewPaper(exam.id)"
                :disabled="exam.showAnswers===false"
            >
              <el-icon><Document /></el-icon>
              查看试卷
            </el-button>


          <!-- 设置展开 -->
          <el-button
              plain
              style="margin-left: auto"
              @click="toggleSettings(exam.id)"
          >
            <el-icon><Setting /></el-icon>
            考试详情
            <el-icon>
              <component :is="expandedExamId === exam.id ? ArrowUp : ArrowDown" />
            </el-icon>
          </el-button>
        </div>

        <!-- 展开详情 -->
        <el-collapse-transition>
          <div
              v-show="expandedExamId === exam.id"
              class="settings-panel"
          >
            <el-divider />
            <el-descriptions :column="2" border>
              <el-descriptions-item label="考试时长">
                {{ exam.duration }} 分钟
              </el-descriptions-item>
              <el-descriptions-item label="是否可查看试卷">
                <el-tag
                    :type="exam.showAnswers ? 'success' : 'info'"
                    size="small"
                >
                  {{ exam.showAnswers ? '允许' : '不允许' }}
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>
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
  </div>
</template>

<script setup>
import { useExamStore } from '../stores/examStore'
import { useAnswerCardStore } from "../stores/answerCardStore.js";
import {useGradeStore} from "../stores/gradeStore.js";
import {onActivated, onMounted, ref, watch} from "vue";
import {onBeforeRouteUpdate} from "vue-router";
import {START_LOCATION_NORMALIZED as route} from "vue-router/dist/devtools-BLCumUwL.mjs";
import {ArrowDown, ArrowUp} from "@element-plus/icons-vue";
import router from "../router/router.js";
import {ElMessage} from "element-plus";
const examStore = useExamStore()
const answerCardStore = useAnswerCardStore()

//加载我参加过的考试
onMounted(() => {
  examStore.fetchMyExams()
})
// 每次从其它页面“返回”这个页面
watch(
    () => route.fullPath,
    () => {
      examStore.fetchMyExams()
    },
    { immediate: true }
)

// 当前视图状态
const activeView = ref('list')
const selectedExam = ref(null)
const expandedExamId = ref(null)

//选中考试
const toggleSettings=(id)=>{
  expandedExamId.value = expandedExamId.value === id ? null : id
}
//换页
const handleExamChange=(page)=>{
  examStore.pagination.currentPage = page
}

//跳转到查看试卷
const viewPaper=async (examId)=>{
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
    }
    await  router.push({
      path: `/review/${examId}`
    })

  } catch (e) {
    ElMessage.error('无法进入全屏，请检查浏览器权限')
  }
}

</script>

<style scoped>
/* 页面标题 */
.page-header {
  padding: 20px 30px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  color: #333;
}

.page-header .subtitle {
  margin-top: 5px;
  color: #666;
  font-size: 14px;
}

/* 搜索卡片 */
.search-card {
  margin-top: 20px;
}

/* 搜索表单项 */
.search-form .el-form-item {
  margin-right: 15px;
}

/* 考试列表 */
.exam-list-view {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* 空状态 */
.el-empty {
  margin-top: 50px;
}

/* 考试卡片 */
.exam-card {
  padding: 20px;
  border-radius: 10px;
  transition: 0.3s;
}

.exam-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* 考试头部 */
.exam-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.exam-info h3 {
  font-size: 20px;
  font-weight: 500;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.exam-code-tag {
  font-size: 12px;
}

.exam-meta {
  margin-top: 5px;
  color: #888;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.exam-meta el-icon {
  font-size: 14px;
  vertical-align: middle;
}

/* 个人考试信息 */
.exam-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  font-size: 14px;
  margin-bottom: 10px;
}

.exam-stats strong {
  color: #409eff;
}

/* 操作按钮 */
.exam-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

/* 设置面板 */
.settings-panel {
  padding-top: 15px;
}

/* 分页 */
.pagination-wrapper {
  margin-top: 20px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .exam-stats {
    flex-direction: column;
    gap: 10px;
  }

  .exam-actions {
    flex-direction: column;
    gap: 10px;
  }

  .search-form .el-form-item {
    margin-right: 0;
    margin-bottom: 10px;
    width: 100%;
  }

  .search-card {
    padding: 15px;
  }
}
</style>