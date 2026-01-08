<template>
  <div class="auth-container">
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>

    <!-- 左侧品牌区域 -->
    <div class="brand-section">
      <div class="brand-content">
        <div class="logo-wrapper">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h1 class="brand-title">在线考试平台</h1>
        </div>
        <p class="brand-desc">在线考试系统，助力学习进步</p>
        <div class="features">
          <div class="feature-item">
            <span class="feature-icon">✓</span>
            <span>智能组卷</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">✓</span>
            <span>实时评分</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">✓</span>
            <span>数据分析</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧表单区域 -->
    <div class="form-section">
      <el-card class="auth-card">
        <div class="card-header">
          <h2>{{ isAdminLogin ? '管理员登录' : '欢迎回来' }}</h2>
          <p>
            {{ isAdminLogin ? '请输入管理员账户信息' : '请登录或注册您的账户' }}
          </p>
        </div>

        <el-tabs v-model="activeTab" tab-position="top"  class="auth-tabs">
          <el-tab-pane label="登录" name="login">
            <el-form
                ref="formRef"
                :rules="rules1"
                :model="loginForm"
                class="auth-form"
                :class="{ 'admin-mode': isAdminLogin }"
            >
              <el-form-item prop="email">
                <el-input
                    v-model="loginForm.email"
                    placeholder="请输入邮箱"
                    prefix-icon="User"
                    size="small"
                >
                </el-input>
              </el-form-item>
              <el-form-item prop="password">
                <el-input
                    v-model="loginForm.password"
                    type="password"
                    placeholder="请输入密码"
                    prefix-icon="Lock"
                    size="default"
                    show-password
                />
              </el-form-item>
              <div class="form-options">
                <span class="admin-label">管理员登录</span>
                <el-switch
                    v-model="isAdminLogin"
                    active-text="开启"
                    inactive-text="关闭"
                />
              </div>
              <el-form-item>
                <el-button type="primary" size="large" @click="onSubmit"  class="submit-btn">
                  立即登录
                </el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <el-tab-pane v-if="!isAdminLogin" label="注册" name="register">
            <el-form ref="registerFormRef" :rules="rules2" :model="registerForm" class="auth-form">
              <el-form-item prop="email">
                <el-input
                    v-model="registerForm.email"
                    placeholder="请输入邮箱"
                    prefix-icon="User"
                    size="large"
                    clearable
                />
              </el-form-item>
              <el-form-item prop="realname">
                <el-input
                    v-model="registerForm.realname"
                    placeholder="请输入真实姓名"
                    prefix-icon="User"
                    size="large"
                    clearable
                />
              </el-form-item>
              <el-form-item prop="password">
                <el-input
                    v-model="registerForm.password"
                    type="password"
                    placeholder="请输入密码"
                    prefix-icon="Lock"
                    size="large"
                    show-password
                />
              </el-form-item>

              <el-form-item prop="confirm">
                <el-input
                    v-model="registerForm.confirm"
                    type="password"
                    placeholder="请再次输入密码"
                    prefix-icon="Lock"
                    size="large"
                    show-password
                />
              </el-form-item>

              <el-form-item prop="code">
                <div style="display: flex; gap: 10px;">
                  <el-input
                      v-model="registerForm.code"
                      placeholder="请输入验证码"
                      prefix-icon="Message"
                      size="large"
                      clearable
                      style="flex: 1;"
                  />
                  <el-button
                      type="primary"
                      size="large"
                      @click="sendVerifyCode"
                      :disabled="countdown > 0"
                      style="width: 120px;"
                  >
                    {{ countdown > 0 ? `${countdown}秒后重试` : '获取验证码' }}
                  </el-button>
                </div>
              </el-form-item>

              <el-form-item>
                <el-button type="success" size="large" @click="onRegisterSubmit" class="submit-btn">
                  立即注册
                </el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage ,ElNotification} from 'element-plus'
import {getCode, login, register} from "../../api/login.js";
import {useUserStore} from '../../stores/userStore.js'
import router from "../../router/router.js";
const userStore = useUserStore()
const activeTab = ref('login')
const loginForm = ref({ email: '', password: '' })
const isAdminLogin = ref(false)
const registerForm = ref({ email: '',realname:'', password: '', confirm: '',code: '' })
const formRef = ref(null)
const registerFormRef=ref(null)
const countdown = ref(0)//倒计时
const rules1 = {
  email: [
    {
      required: true, message: '请填写用户名', trigger: 'blur'
    },
    {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: '邮箱格式不正确',
      trigger: 'blur'
    }
  ],
  password: [
    {
      required: true, message: '请填写密码', trigger: 'blur'
    }
  ],
}
const rules2 = {
  email: [
    {
      required: true, message: '请填写用户名', trigger: 'blur'
    },
    {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: '邮箱格式不正确',
      trigger: 'blur'
    }
  ],
  realname: [
    {
      required: true,message: '请填写姓名', trigger: 'blur'
    },
    {
      pattern: /^[\u4e00-\u9fa5]{2,4}$/,
      message: '姓名格式不正确',
      trigger: 'blur'
    }
  ],
  password: [
    {
      required: true, message: '请填写密码', trigger: 'blur'
    },
    {
      validator: (rule, value, callback) => {
        // 长度至少 8 位
        if (value.length < 8) {
          callback(new Error('密码长度不能少于 8 位'))
        }
        // 必须包含大写字母
        if (!/[A-Z]/.test(value)) {
          callback(new Error('密码必须包含大写字母'))
          return
        }

        // 必须包含小写字母
        if (!/[a-z]/.test(value)) {
          callback(new Error('密码必须包含小写字母'))
          return
        }

        callback()  // 校验通过
      },
      trigger: 'blur'
    }

  ],
  confirm: [
    {
    required: true, message: '请确认密码', trigger: 'blur'
    },
    {
      required: true,
      validator: (rule, value, callback) => {
        if (value !== registerForm.value.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: '验证码格式不正确', trigger: 'blur' }
  ]
}
// 发送验证码方法
const sendVerifyCode = async () => {
  // 先验证邮箱格式
  if (!registerForm.value.email) {
    ElMessage.warning('请先输入邮箱')
    return
  }

  try {
    await getCode(registerForm.value.email)
    // 开始倒计时
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error) {
    console.log(error)
    ElMessage.error('验证码发送失败')
  }
}
//登录提交
const onSubmit = () => {
  const role=isAdminLogin.value ? 'ADMIN' : 'USER'
  formRef.value.validate((valid) => {
    if (role==='USER'&&!valid) {
      console.log('表单验证失败')
      ElNotification({
        type: 'error',
        message: '请完善表单信息',
        duration: 1500
      })
      return false
    }

    // 调用登录接口
    login(loginForm.value.email, loginForm.value.password,role)
        .then(res => {
          console.log(res)

          // 弹窗提示
          ElNotification({
            type: 'success',
            message: '登录成功',
            duration: 1500
          })

          // 存 token + 用户信息 到 store & localStorage
          userStore.setUser(res.id, res.name, res.userName, res.token)
          userStore.isAdmin=true
          // 跳转首页
          if(role==='USER')router.push('/')
          else router.push('/dailyTest')
        })
        .catch(err => {
          console.log(err)
          ElNotification({
            type: 'error',
            message: err.response?.data?.message || '登录失败',
            duration: 1500
          })
        })
  })
}
// 注册提交
const onRegisterSubmit = () => {
  registerFormRef.value.validate((valid) => {
    if (valid) {
      // console.log(registerFormRef.value.email, registerFormRef.value.realname,registerForm.value.password,registerFormRef.value.code)
      // console.log('注册表单验证通过', registerForm.value)
      // 处理注册逻辑
      register(registerForm.value.email, registerForm.value.realname,registerForm.value.password,registerForm.value.code)
          .then(res=>{
            ElMessage.success('注册成功')
          })
          .catch(err=>{
            console.log(err)
          })
    } else {
      console.log('注册表单验证失败')
      ElMessage.error('请完善表单信息')
      return false
    }
  })
}
</script>
<style scoped>
@import "loginRegister.css";
</style>
