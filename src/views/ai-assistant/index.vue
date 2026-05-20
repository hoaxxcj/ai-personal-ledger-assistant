<template>
  <div class="h-[calc(100vh-140px)] flex flex-col">
    <el-card class="flex-1 flex flex-col overflow-hidden">
      <template #header>
        <div class="flex items-center gap-2">
          <el-icon class="text-primary text-xl"><ChatDotRound /></el-icon>
          <span class="font-bold">AI 记账助手</span>
        </div>
      </template>

      <div ref="chatRef" class="flex-1 overflow-y-auto space-y-4 p-2">
        <div
          v-for="(msg, idx) in messages"
          :key="idx"
          :class="['flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : '']"
        >
          <el-avatar
            :size="36"
            :icon="msg.role === 'user' ? UserFilled : ChatDotRound"
            :class="msg.role === 'user' ? 'bg-primary' : 'bg-success'"
          />
          <div
            :class="[
              'max-w-[70%] rounded-lg px-4 py-2 text-sm',
              msg.role === 'user' ? 'bg-primary text-white' : 'bg-gray-100',
            ]"
          >
            <div v-if="msg.role === 'assistant'" class="prose prose-sm max-w-none" v-html="msg.content" />
            <div v-else>{{ msg.content }}</div>
          </div>
        </div>

        <div v-if="loading" class="flex gap-3">
          <el-avatar :size="36" :icon="ChatDotRound" class="bg-success" />
          <div class="bg-gray-100 rounded-lg px-4 py-2">
            <el-icon class="is-loading"><Loading /></el-icon>
          </div>
        </div>
      </div>

      <div class="mt-4 flex gap-2">
        <el-input
          v-model="inputText"
          placeholder="输入消息，例如：帮我分析本月消费..."
          @keyup.enter="handleSend"
          size="large"
          clearable
        >
          <template #append>
            <el-button type="primary" :icon="Promotion" @click="handleSend" :loading="loading">发送</el-button>
          </template>
        </el-input>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { Promotion } from '@element-plus/icons-vue'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const messages = ref<Message[]>([
  {
    role: 'assistant',
    content:
      '你好！我是你的 AI 记账助手。你可以问我关于消费分析、预算建议、记账技巧等问题。也可以直接发送账单图片，我帮你自动识别记录。',
  },
])

const inputText = ref('')
const loading = ref(false)
const chatRef = ref<HTMLDivElement>()

const handleSend = async () => {
  const text = inputText.value.trim()
  if (!text) return

  messages.value.push({ role: 'user', content: text })
  inputText.value = ''
  loading.value = true

  await nextTick()
  chatRef.value?.scrollTo({ top: chatRef.value.scrollHeight, behavior: 'smooth' })

  setTimeout(() => {
    messages.value.push({
      role: 'assistant',
      content: `收到你的问题："${text}"。\n\n这是一个演示回复。实际开发中，这里将调用 AI 服务接口进行智能分析和回复。`,
    })
    loading.value = false
    nextTick(() => {
      chatRef.value?.scrollTo({ top: chatRef.value.scrollHeight, behavior: 'smooth' })
    })
  }, 1000)
}
</script>
