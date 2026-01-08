
<template>
  <div class="exam-join-page">
    <!-- 通过考试码查询考试 -->
    <div v-if="stage === 'query'||stage === 'confirm'" class="query-panel">
      <h2 class="title">参加考试</h2>
      <el-form :model="queryForm" label-width="90px">
        <el-form-item label="考试码">
          <el-input
              v-model="queryForm.code"
              placeholder="请输入考试码"
              maxlength="6"
              show-word-limit

          />
        </el-form-item>
        <el-form-item>
          <el-button
              type="primary"
              @click="queryExam"
          >
            查询考试
          </el-button>
          <el-button @click="reset">重新查询</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-empty
        v-if="stage === 'query'"
        description="未发现考试"
        :image-size="200"
    />

    <!-- 考试信息确认页 -->
    <div v-if="stage === 'confirm'" class="exam-infoo">
      <el-alert
          v-if="isLate&&examData.status === 'ongoing'"
          title="已迟到超过 15 分钟，无法进入考试"
          type="error"
          show-icon
          class="mb-16"
      />

      <!-- 标题区 -->
      <h2 class="exam-title">{{ examData?.examName }}</h2>
      <p class="exam-desc">{{ examData.description || '暂无考试说明' }}</p>

      <!-- 基本信息 -->
      <el-descriptions
          border
          column="2"
          size="default"
          class="exam-meta"
      >
        <el-descriptions-item label="考试码">
          <el-tag type="info">{{ examData.examCode }}</el-tag>
        </el-descriptions-item>

        <!--        <el-descriptions-item label="创建人">-->
        <!--          {{ examData.creatorName }}-->
        <!--        </el-descriptions-item>-->
        <el-descriptions-item label="开始日期">
          {{ examData.startDate }}
        </el-descriptions-item>
        <el-descriptions-item label="开始时间">
          {{ examData.startTime }}
        </el-descriptions-item>
        <el-descriptions-item label="考试时长">
          <el-tag type="warning">
            {{ examData.duration }} 分钟
          </el-tag>
        </el-descriptions-item>

        <!--        <el-descriptions-item label="题目数量">-->
        <!--          {{ examData.questions.length }} 题-->
        <!--        </el-descriptions-item>-->

        <!--        <el-descriptions-item label="总分">-->
        <!--          {{ examData.totalScore }} 分-->
        <!--        </el-descriptions-item>-->

        <el-descriptions-item label="考试状态">
          <el-tag
              :type="examData.status === 'ongoing'
              ? 'success'
              : examData.status === 'upcoming'
                ? 'info'
                : 'danger'"
          >
            {{examData.status === 'ongoing'
              ? '进行中'
              : examData.status === 'upcoming'
                  ? '未开始'
                  : '已结束' }}
          </el-tag>
        </el-descriptions-item>

        <el-descriptions-item label="交卷后查看试卷">
          <el-tag
              :type="examData.allowReview ? 'success' : 'info'"
          >
            {{ examData.allowReview ? '允许查看' : '不可查看' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 操作区 -->
      <div class="exam-actions">
        <el-button
            type="primary"
            size="large"
            @click="startExam"
            :disabled="examData.status !== 'ongoing' || isLate"
        >
          进入考试
        </el-button>
        <el-button @click="reset">返回</el-button>
      </div>
    </div>
  </div>
</template>
<script setup>
import AnswerCard from "../components/answerCard.vue";
import {nextTick, onBeforeUnmount, onMounted, ref, watch} from "vue";
import {ElMessage} from "element-plus";
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import router from "../router/router.js";
import {useAnswerCardStore} from "../stores/answerCardStore.js";
import {useExamStore} from "../stores/examStore.js";
import {getExamByCode, getExamQuestions} from "../api/exam.js";
const answerCardStore = useAnswerCardStore()
const route = useRoute()
const answerStore = useAnswerCardStore()
const examStore = useExamStore()
// 页面阶段：query | answer
const stage = ref('query')
// 查询表单
const queryForm = ref({
  code: ''

})

// 查询到的考试数据
const examData = ref(null)
let map = {
  0:'upcoming',
  1: 'ongoing',
  2: 'ended',

}
const queryExam = async () => {
  if (!queryForm.value.code) {
    ElMessage.warning('请输入考试码')
    return
  }

  try {
    const res = await getExamByCode(queryForm.value.code)
    if (!res ) {
      ElMessage.error('查询考试失败')
      return
    }

    examData.value = {
      id: res.examId,
      examCode: res.examCode,
      examName: res.examName,
      duration: res.limitMinutes,
      description: res.description,
      startDate: res.startTime.split('T')[0],
      startTime: res.startTime.split('T')[1].slice(0, 5),
      status:map[res.status],
      allowReview:res.paperShow
    }
    console.log(res)
    // 保存到 Pinia
    examStore.setExam(examData.value)
    ElMessage.success('考试信息获取成功')
  } catch (error) {
    console.error(error)
    ElMessage.error('请求异常，请稍后重试')
  }


//   examData.value = {
//     id: 1001,
//     examCode:'123456',
//     examName: '2024年度JavaScript基础知识测试',
//     creatorName:'刘康',
//     description: '本试卷测试JavaScript基础知识,包括变量、函数、对象等核心概念',
//     startDate: '2025-12-15',
//     startTime: '09:00',
//     duration: 90, // 考试时长(分钟)
//     totalScore: 100, // 总分
//     showAnswers: true, // 是否显示答案解析
//     status: 'ended',
//     createTime: 1702345678000,
//     updateTime: 1702345678000,
//     questions: [
//       // ========== 单选题 ==========
//       {
//         id: 1,
//         type: 'single',
//         content: 'JavaScript中,以下哪个关键字用于声明常量?',
//         score: 5,
//         options: [
//           'var',
//           'let',
//           'const',
//           'function'
//         ],
//         answer: 'C', // 正确答案的选项字母
//         analysis: 'const关键字用于声明只读的常量,一旦声明必须初始化且不能重新赋值。var和let用于声明变量,function用于声明函数。'
//       },
//       {
//         id: 2,
//         type: 'single',
//         content: '以下哪个方法可以将数组转换为字符串?',
//         score: 5,
//         options: [
//           'split()',
//           'join()',
//           'concat()',
//           'slice()'
//         ],
//         answer: 'B',
//         analysis: 'join()方法将数组元素连接成字符串。split()是字符串方法用于分割,concat()用于连接数组,slice()用于截取数组。'
//       },
//       {
//         id: 3,
//         type: 'single',
//         content: 'typeof null 的返回值是什么?',
//         score: 5,
//         options: [
//           '"null"',
//           '"undefined"',
//           '"object"',
//           '"number"'
//         ],
//         answer: 'C',
//         analysis: '这是JavaScript的一个历史遗留bug,typeof null返回"object"。这个bug从JavaScript诞生就存在,但由于历史原因一直没有修复。'
//       },
//
//       // ========== 多选题 ==========
//       {
//         id: 4,
//         type: 'multiple',
//         content: '以下哪些是JavaScript的基本数据类型?(多选)',
//         score: 10,
//         options: [
//           'String',
//           'Number',
//           'Boolean',
//           'Array',
//           'Object',
//           'Symbol',
//           'Null',
//           'Undefined'
//         ],
//         answer: ['A', 'B', 'C', 'F', 'G', 'H'], // 多个正确答案
//         analysis: 'JavaScript有7种基本数据类型:String、Number、Boolean、Symbol、Null、Undefined和BigInt。Array和Object属于引用类型,不是基本数据类型。'
//       },
//       {
//         id: 5,
//         type: 'multiple',
//         content: '以下哪些方法可以遍历数组?(多选)',
//         score: 10,
//         options: [
//           'for循环',
//           'forEach()',
//           'map()',
//           'while循环',
//           'filter()'
//         ],
//         answer: ['A', 'B', 'C', 'D', 'E'],
//         analysis: '这些方法都可以用来遍历数组。for和while是传统循环,forEach、map、filter是数组的高阶方法。map和filter在遍历的同时还会返回新数组。'
//       },
//
//       // ========== 判断题 ==========
//       {
//         id: 6,
//         type: 'judge',
//         content: 'JavaScript中,== 和 === 的作用完全相同。',
//         score: 5,
//         answer: 'false', // 'true' 或 'false'
//         analysis: '错误。==是相等运算符,会进行类型转换后比较;===是全等运算符,不进行类型转换,要求类型和值都相同。例如:1 == "1"为true,但1 === "1"为false。'
//       },
//       {
//         id: 7,
//         type: 'judge',
//         content: 'let和var都存在变量提升(hoisting)现象。',
//         score: 5,
//         answer: 'false',
//         analysis: '错误。虽然let声明也会被提升,但存在"暂时性死区"(TDZ),在声明之前访问会报错。var声明的变量会被提升并初始化为undefined。'
//       },
//       {
//         id: 8,
//         type: 'judge',
//         content: 'JavaScript中的闭包可以访问外部函数的变量。',
//         score: 5,
//         answer: 'true',
//         analysis: '正确。闭包是指函数能够访问其词法作用域外部的变量,即使外部函数已经执行完毕。这是JavaScript的重要特性之一。'
//       },
//
//       // ========== 填空题 ==========
//       {
//         id: 9,
//         type: 'fill',
//         content: '在JavaScript中,使用 _____ 关键字可以创建一个新的类。',
//         score: 10,
//         answer: 'class',
//         analysis: 'ES6引入了class关键字,提供了更清晰、更接近传统面向对象语言的语法来创建对象和实现继承。'
//       },
//       {
//         id: 10,
//         type: 'fill',
//         content: 'Promise对象有三种状态:pending(进行中)、_____(已成功)和rejected(已失败)。',
//         score: 10,
//         answer: 'fulfilled 或 resolved',
//         analysis: 'Promise的三种状态:pending(待定)、fulfilled/resolved(已兑现)、rejected(已拒绝)。状态一旦改变就不会再变。'
//       },
//
//       // ========== 简答题 ==========
//       {
//         id: 11,
//         type: 'essay',
//         content: '请简述JavaScript中的事件循环(Event Loop)机制。',
//         score: 15,
//         answer: `事件循环是JavaScript实现异步编程的核心机制:
//
// 1. 执行栈(Call Stack):同步代码在执行栈中按顺序执行
// 2. 任务队列(Task Queue):异步任务完成后,回调函数进入任务队列
// 3. 微任务队列(Microtask Queue):Promise等微任务优先级更高
// 4. 事件循环:当执行栈为空时,从队列中取出任务执行
//
// 执行顺序:同步代码 → 微任务 → 宏任务
//
// 关键点:
// - 微任务(Promise、MutationObserver)
// - 宏任务(setTimeout、setInterval、I/O)
// - 微任务在宏任务之前执行`,
//         analysis: '事件循环是理解JavaScript异步编程的关键。需要掌握执行栈、任务队列、微任务和宏任务的概念及执行顺序。'
//       },
//       {
//         id: 12,
//         type: 'essay',
//         content: '什么是原型链?请举例说明。',
//         score: 15,
//         answer: `原型链是JavaScript实现继承的机制:
//
// 1. 每个对象都有一个__proto__属性,指向其构造函数的prototype
// 2. 当访问对象的属性时,如果对象本身没有,会沿着原型链向上查找
// 3. 原型链的顶端是Object.prototype,再向上是null
//
// 示例:
// function Person(name) {
//   this.name = name;
// }
// Person.prototype.sayHi = function() {
//   console.log('Hi, ' + this.name);
// };
//
// const john = new Person('John');
// // john.__proto__ === Person.prototype
// // Person.prototype.__proto__ === Object.prototype
// // Object.prototype.__proto__ === null
//
// 查找顺序:john对象 → Person.prototype → Object.prototype → null`,
//         analysis: '原型链是JavaScript面向对象编程的基础。理解原型链对于掌握继承、理解对象属性查找机制至关重要。'
//       }
//     ]
//   }

  stage.value = 'confirm'
}
//如果超过15分钟就不能进入考试
const isLate = computed(() => {
  if (!examData.value?.startDate || !examData.value?.startTime) {
    return false
  }

  // 拼接考试开始时间
  const startDateTime = new Date(
      `${examData.value.startDate} ${examData.value.startTime}:00`
  )

  const now = new Date()

  // 超过开始时间 15 分钟
  const lateLimit = startDateTime.getTime() + 1500 * 60 * 1000

  return now.getTime() > lateLimit
})

//开始考试
const startExam = async () => {
  if (examData.value.status !== 'ongoing') {
    ElMessage.warning('考试尚未开始或已结束')
    return
  }

  if (isLate.value) {
    ElMessage.error('已迟到超过 15 分钟，无法进入考试')
    return
  }


  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
    }

    await router.push(`/answerExam/${examData.value.id}`)

    await nextTick()
  } catch (e) {
    ElMessage.error('无法进入全屏，请检查浏览器权限')
  }
}

const reset = () => {
  stage.value = 'query'
  queryForm.value.examCode = ''
  examData.value = null
}


</script>

<style scoped>
.query-panel,
.exam-infoo {
  background: #fff;
  padding: 30px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  margin-top: 20px;
}


.title {
  margin-bottom: 20px;
}


.exam-info h2 {
  margin-bottom: 10px;
}


.desc {
  color: #666;
  margin-bottom: 16px;
}


.meta {
  margin-bottom: 24px;
  padding-left: 16px;
}


.meta li {
  line-height: 1.8;
}
</style>