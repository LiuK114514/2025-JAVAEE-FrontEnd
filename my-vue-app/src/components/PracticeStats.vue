<template>
  <el-card class="stats-card" shadow="hover">
    <template #header>
      <div class="card-header">
        <span><i class="fas fa-chart-line"></i> 练习统计</span>
      </div>
    </template>

    <div class="stats-content">
      <div class="stats-item">
        <span>今日进度</span>
        <span>{{ answeredCount }}/{{ totalQuestions }}</span>
      </div>

      <el-progress
          :percentage="progressPercentage"
          :show-text="false"
          :stroke-width="10"
          color="#4b6cb7"
      />

      <div class="stats-item">
        <span>正确率</span>
        <span>{{ correctRate }}%</span>
      </div>

      <div class="streak-counter">
        <i class="fas fa-fire" style="color: #ff9800;"></i>
        <span>连续练习 {{ streakDays }} 天</span>
      </div>
    </div>
  </el-card>
</template>

<script setup>
defineProps({
  answeredCount: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  progressPercentage: {
    type: Number,
    required: true
  },
  correctRate: {
    type: Number,
    required: true
  },
  streakDays: {
    type: Number,
    required: true
  }
})
</script>

<style scoped>
.stats-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-header span {
  font-weight: 600;
  color: #4b6cb7;
  display: flex;
  align-items: center;
  gap: 8px;
}

.stats-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.stats-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.stats-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.streak-counter {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 10px;
  background: linear-gradient(135deg, #fff3e0, #ffecb3);
  border-radius: 8px;
  font-weight: 600;
  color: #ff9800;
  margin-top: 10px;
}
</style>