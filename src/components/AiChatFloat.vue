<template>
  <div class="fixed bottom-24 right-8 z-50">
    <el-button
      v-if="!visible"
      type="primary"
      circle
      class="!w-14 !h-14 shadow-lg"
      @click="visible = true"
    >
      <el-icon class="text-2xl"><ChatDotRound /></el-icon>
    </el-button>

    <el-card v-else class="w-[400px] h-[550px] flex flex-col shadow-2xl" body-style="padding:0;height:100%">
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div class="flex items-center gap-2">
          <el-icon class="text-primary"><ChatDotRound /></el-icon>
          <span class="font-bold">AI 财务顾问</span>
        </div>
        <div class="flex items-center gap-2">
          <el-button text size="small" @click="clearHistory">清空</el-button>
          <el-button text circle size="small" @click="visible = false">
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
      </div>

      <div ref="chatRef" class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        <div
          v-for="(msg, idx) in messages"
          :key="idx"
          :class="['flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : '']"
        >
          <el-avatar
            :size="32"
            :class="msg.role === 'user' ? 'bg-primary' : 'bg-success'"
          >
            <el-icon v-if="msg.role === 'user'"><User /></el-icon>
            <el-icon v-else><ChatDotRound /></el-icon>
          </el-avatar>
          <div
            :class="[
              'max-w-[75%] rounded-lg px-3 py-2 text-sm leading-relaxed',
              msg.role === 'user' ? 'bg-primary text-white' : 'bg-white shadow-sm',
            ]"
          >
            {{ msg.content }}
          </div>
        </div>

        <div v-if="loading" class="flex gap-3">
          <el-avatar :size="32" class="bg-success">
            <el-icon><ChatDotRound /></el-icon>
          </el-avatar>
          <div class="bg-white rounded-lg px-3 py-2 shadow-sm">
            <el-icon class="is-loading"><Loading /></el-icon>
          </div>
        </div>
      </div>

      <div class="p-3 border-t border-gray-100 bg-white">
        <div class="flex flex-wrap gap-2 mb-2">
          <el-tag
            v-for="q in quickQuestions"
            :key="q"
            size="small"
            type="info"
            class="cursor-pointer hover:bg-primary hover:text-white transition-colors"
            @click="sendQuick(q)"
          >
            {{ q }}
          </el-tag>
        </div>
        <div class="flex gap-2">
          <el-input
            v-model="inputText"
            placeholder="输入问题..."
            size="default"
            @keyup.enter="handleSend"
          />
          <el-button type="primary" :icon="Promotion" :loading="loading" @click="handleSend" />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { Promotion, Close, User, ChatDotRound, Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { streamChat } from '@/services/ai'
import { getChatHistory, saveChatHistory, clearChatHistory as clearStorage } from '@/utils/storage'
import type { ChatMessage } from '@/utils/storage'
import { buildBillSummary } from '@/utils/summary'

const visible = ref(false)
const messages = ref<ChatMessage[]>([])
const inputText = ref('')
const loading = ref(false)
const chatRef = ref<HTMLDivElement>()

const quickQuestions = [
  '我这个月钱花哪了？',
  '怎么减少餐饮开销？',
  '帮我设个下月预算',
  '有哪些省钱建议？',
]

onMounted(() => {
  const saved = getChatHistory()
  if (saved.length) {
    messages.value = saved
  } else {
    messages.value.push({
      role: 'assistant',
      content: '你好！我是你的 AI 财务顾问。你可以问我关于消费分析、预算建议等问题。',
      timestamp: Date.now(),
    })
  }
})

function scrollToBottom() {
  nextTick(() => {
    chatRef.value?.scrollTo({ top: chatRef.value.scrollHeight, behavior: 'smooth' })
  })
}

async function sendQuick(q: string) {
  inputText.value = q
  await handleSend()
}

async function handleSend() {
  const text = inputText.value.trim()
  if (!text || loading.value) return

  messages.value.push({ role: 'user', content: text, timestamp: Date.now() })
  inputText.value = ''
  loading.value = true
  scrollToBottom()

  try {
    const summary = buildBillSummary()
    const history = messages.value.slice(-7, -1)
    const stream = streamChat(text, summary, history)

    let reply = ''
    for await (const chunk of stream) {
      if (chunk.error) {
        ElMessage.error(chunk.error)
        loading.value = false
        return
      }
      if (chunk.done) break
      reply += chunk.content
      // Update last message in place for streaming effect
      const lastIdx = messages.value.length - 1
      if (messages.value[lastIdx]?.role === 'assistant') {
        messages.value[lastIdx].content = reply
      } else {
        messages.value.push({ role: 'assistant', content: reply, timestamp: Date.now() })
      }
      scrollToBottom()
    }

    saveChatHistory(messages.value)
  } catch (err: any) {
    ElMessage.error(err.message || '请求失败')
  } finally {
    loading.value = false
  }
}

function clearHistory() {
  clearStorage()
  messages.value = [{
    role: 'assistant',
    content: '对话历史已清空。我是你的 AI 财务顾问，有什么可以帮你的？',
    timestamp: Date.now(),
  }]
}
</script>
