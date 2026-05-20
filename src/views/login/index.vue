<template>
  <div class="h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
    <el-card class="w-[400px]">
      <template #header>
        <div class="text-center">
          <h2 class="text-2xl font-bold text-primary">AI 记账助手</h2>
          <p class="text-sm text-gray-400 mt-1">智能管理你的每一笔收支</p>
        </div>
      </template>

      <el-form :model="form" :rules="rules" ref="formRef">
        <el-form-item prop="email">
          <el-input
            v-model="form.email"
            placeholder="邮箱"
            size="large"
            :prefix-icon="Message"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="密码"
            size="large"
            :prefix-icon="Lock"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="w-full" size="large" @click="handleLogin" :loading="loading">
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <div class="text-center text-sm text-gray-400">
        还没有账号？<el-button link type="primary">立即注册</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Message, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const formRef = ref()

const form = reactive({
  email: '',
  password: '',
})

const rules = {
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const handleLogin = async () => {
  await formRef.value?.validate()
  loading.value = true
  setTimeout(() => {
    userStore.setToken('demo-token')
    userStore.setUserInfo({ id: '1', nickname: '记账达人', email: form.email })
    router.push('/')
    loading.value = false
  }, 800)
}
</script>
