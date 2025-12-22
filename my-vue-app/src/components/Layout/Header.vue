<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {Lock} from "@element-plus/icons-vue";
const squareUrl = 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png'

// 修改密码对话框
const passwordDialogVisible = ref(false)
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})
//修改个人信息对话框
const infoDialogVisible = ref(false)
const infoFormRef = ref(null)
const infoForm = ref({
  realName: '',
  email: ''
})

//修改个人信息
function handleReinfo(){
  infoDialogVisible.value = true
}
// 重置表单
const resetInfoForm = () => {
  infoForm.value = {
    realName: '',
    email: '',
  }
}

// 提交修改
const submitInfoChange = async () => {
  await infoFormRef.value?.validate()
  // 调用API更新邮箱
  // await updateUserInfo({ email: infoForm.email })
  ElMessage.success('个人信息修改成功')
  infoDialogVisible.value = false
}

// 修改密码
function handleRepassword() {
  passwordDialogVisible.value = true
}
//密码校验
const passwordFormRef = ref(null)
const rule = {
  oldPassword: [
    {
      required: true, message: '请填写旧密码', trigger: 'blur'
    }
  ],
  newPassword:[
    {
      required: true,message: '请填写新密码', trigger: 'blur'
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
  confirmPassword: [
    {
      required: true, message: '请确认密码', trigger: 'blur'
    },
    {
      required: true,
      validator: (rule, value, callback) => {
        if (value !== passwordForm.value.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 提交修改密码
function submitPasswordChange() {
  passwordFormRef.value.validate((valid) => {
    if (valid) {
      // 这里调用修改密码的 API
      // api.changePassword(passwordForm.value).then(() => {
      //   ElMessage.success('密码修改成功，请重新登录')
      //   passwordDialogVisible.value = false
      //   handleLogout()
      // })
      passwordDialogVisible.value = false
      console.log("验证成功")
      resetPasswordForm()
    }
    else {
      ElMessage.error('请完善表单信息')
      return false
    }
  })

}

// 重置密码表单
function resetPasswordForm() {
  passwordForm.value = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
}

// 退出登录
function handleLogout() {
  ElMessageBox.confirm(
      '确定要退出登录吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    // 清除本地存储的 token 等信息
    // localStorage.removeItem('token')
    // sessionStorage.clear()

    ElMessage.success('退出登录成功')

    // 跳转到登录页
    router.push('/login')
  }).catch(() => {
    // 取消退出
  })
}

// 下拉菜单命令处理
const handleCommand = (c) => {
  switch(c) {
    case 'myInfo':
      handleReinfo()
      break;
    case "rePassword":
      handleRepassword()
      break
    case "logout":
      handleLogout()
      break
  }
}

</script>

<template>
  <div class="header-container">
    <!-- 左侧 Logo 和标题 -->
    <div class="header-left">
      <el-icon :size="50" color="#55a1ef"><Reading /></el-icon>
      <span class="title">在线考试平台</span>
    </div>

    <!-- 右侧用户信息 -->
    <div class="header-right">
      <el-dropdown @command="handleCommand" trigger="click">
        <span class="el-dropdown-link">
          <el-avatar
              src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
          />
          <el-icon class="el-icon--right">
            <arrow-down />
          </el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="myInfo">
              <el-icon><User /></el-icon>
              个人信息
            </el-dropdown-item>
            <el-dropdown-item command="rePassword">
              <el-icon><Lock /></el-icon>
              修改密码
            </el-dropdown-item>
            <el-dropdown-item command="logout" divided>
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- 修改个人信息对话框 -->
    <el-dialog
        v-model="infoDialogVisible"
        title="个人信息"
        width="400px"
        @close="resetInfoForm"
    >
      <el-form :model="infoForm" label-width="80px" :rules="infoRules" ref="infoFormRef">
        <el-form-item label="真实姓名">
          <el-input
              v-model="infoForm.realName"
              placeholder="真实姓名"
              disabled
          />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input
              v-model="infoForm.email"
              type="email"
              placeholder="请输入邮箱"
          />
        </el-form-item>
      </el-form>
      <template #footer>
    <span class="dialog-footer">
      <el-button @click="infoDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitInfoChange">
        确定
      </el-button>
    </span>
      </template>
    </el-dialog>

    <!-- 修改密码对话框 -->
    <el-dialog
        v-model="passwordDialogVisible"
        title="修改密码"
        width="400px"
        @close="resetPasswordForm"
    >
      <el-form :model="passwordForm" label-width="80px" :rules="rule" ref="passwordFormRef">
        <el-form-item label="原密码" prop="oldPassword">
          <el-input
              v-model="passwordForm.oldPassword"
              type="password"
              placeholder="请输入原密码"
              show-password
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
              v-model="passwordForm.newPassword"
              type="password"
              placeholder="请输入新密码（至少8位）"
              show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
              v-model="passwordForm.confirmPassword"
              type="password"
              placeholder="请再次输入新密码"
              show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="passwordDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitPasswordChange">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
  padding: 0 40px;
  background: linear-gradient(135deg, #1e3c72 0%, #2a9d8f 100%);
  box-shadow: 0 4px 14px rgba(30, 60, 114, 0.35);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

/* 左侧 */
.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo-icon {
  width: 54px;
  height: 54px;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  backdrop-filter: blur(10px);
}

.title-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.title {
  font-size: 22px;
  font-weight: 600;
  color: #ffffff;
  letter-spacing: 1px;
}

.subtitle {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 300;
}

/* 右侧用户区 */
.header-right {
  display: flex;
  align-items: center;
}

.el-dropdown-link {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 10px;
  transition: all 0.3s;
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(10px);
}

.el-dropdown-link:hover {
  background: rgba(255, 255, 255, 0.28);
  transform: translateY(-2px);
}

.username {
  font-size: 15px;
  color: #ffffff;
  font-weight: 500;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.el-dropdown-link .el-icon {
  color: #ffffff;
  font-size: 18px;
}

/* 下拉菜单 */
:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  font-size: 14px;
  transition: all 0.2s;
}

:deep(.el-dropdown-menu__item:hover) {
  background: rgba(42, 157, 143, 0.12);
  color: #2a9d8f;
}

/* 修改密码弹窗 */
:deep(.password-dialog) {
  border-radius: 16px;
  overflow: hidden;
}

/* 弹窗头部 */
:deep(.password-dialog .el-dialog__header) {
  background: linear-gradient(135deg, #1e3c72 0%, #2a9d8f 100%);
  padding: 20px 24px;
  margin: 0;
}

:deep(.password-dialog .el-dialog__title) {
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
}

:deep(.password-dialog .el-dialog__headerbtn .el-dialog__close) {
  color: #ffffff;
  font-size: 20px;
}

/* 弹窗内容 */
:deep(.password-dialog .el-dialog__body) {
  padding: 30px 24px;
}

:deep(.password-dialog .el-form-item__label) {
  color: #374151;
  font-weight: 500;
}

:deep(.password-dialog .el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 0 0 1px #e5e7eb inset;
}

:deep(.password-dialog .el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #cbd5e1 inset;
}

:deep(.password-dialog .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #2a9d8f inset;
}

/* 弹窗底部 */
.dialog-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.dialog-footer .el-button {
  min-width: 100px;
  border-radius: 8px;
  font-weight: 500;
}

/* 主按钮 */
.submit-btn {
  background: linear-gradient(135deg, #1e3c72 0%, #2a9d8f 100%);
  border: none;
}

.submit-btn:hover {
  opacity: 0.92;
  transform: translateY(-2px);
}

</style>