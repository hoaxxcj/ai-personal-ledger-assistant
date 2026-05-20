<template>
  <div class="h-full flex flex-col">
    <!-- 顶部标题栏 -->
    <div class="bg-white px-6 py-3 flex items-center justify-between border-b border-gray-100 shrink-0">
      <div class="flex items-center gap-2">
        <el-icon class="text-primary"><Setting /></el-icon>
        <span class="font-bold text-lg">设置</span>
      </div>
    </div>

    <!-- 内容区 -->
    <div class="flex-1 overflow-auto p-6">
      <div class="max-w-3xl mx-auto space-y-6">
        <!-- 数据管理 -->
        <el-card shadow="hover" class="!rounded-xl">
          <template #header>
            <div class="font-medium">数据管理</div>
          </template>

          <div class="flex gap-4">
            <el-button
              type="primary"
              class="flex-1"
              :icon="Download"
              :loading="exportLoading"
              @click="handleExport"
            >
              导出所有账单
            </el-button>
            <el-button
              type="danger"
              class="flex-1"
              :icon="Delete"
              @click="handleClear"
            >
              清空所有数据
            </el-button>
          </div>

          <p class="text-xs text-gray-400 mt-4">
            所有数据仅存储在您的本地浏览器中，导出和清空操作均不会上传任何数据至服务器。
          </p>
        </el-card>

        <!-- 基础偏好 -->
        <el-card shadow="hover" class="!rounded-xl">
          <template #header>
            <div class="font-medium">基础偏好</div>
          </template>

          <div class="space-y-6">
            <!-- 默认显示月份 -->
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm font-medium">默认显示月份</div>
                <div class="text-xs text-gray-400 mt-0.5">打开应用时默认展示的月份</div>
              </div>
              <el-select
                v-model="settingsStore.settings.defaultMonth"
                style="width: 140px"
                @change="onMonthChange"
              >
                <el-option label="当前月份" value="current" />
                <el-option label="上月" value="last" />
              </el-select>
            </div>

            <el-divider class="!my-4" />

            <!-- 金额显示千分位 -->
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm font-medium">金额显示千分位</div>
                <div class="text-xs text-gray-400 mt-0.5">如 ¥1,234.56 或 ¥1234.56</div>
              </div>
              <el-switch
                v-model="settingsStore.settings.thousandSeparator"
                @change="onThousandChange"
              />
            </div>

            <el-divider class="!my-4" />

            <!-- 记账后自动关闭弹窗 -->
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm font-medium">记账后自动关闭弹窗</div>
                <div class="text-xs text-gray-400 mt-0.5">关闭后可连续记账</div>
              </div>
              <el-switch
                v-model="settingsStore.settings.autoCloseLedger"
                @change="onAutoCloseChange"
              />
            </div>
          </div>
        </el-card>

        <!-- 关于我们 -->
        <el-card shadow="hover" class="!rounded-xl">
          <template #header>
            <div class="font-medium">关于我们</div>
          </template>

          <div class="space-y-3 text-sm">
            <div class="text-base font-bold">AI 个人记账与消费分析助手</div>
            <div class="text-gray-500">版本号：V1.0</div>
            <p class="text-gray-600 leading-relaxed">
              一款结合 AI 智能分析的个人记账工具，所有账单数据本地存储，保护您的隐私安全。
            </p>
            <div class="text-gray-500">
              <span class="font-medium">技术栈：</span>Vue 3 + Vite + Element Plus + ECharts + DeepSeek AI
            </div>
            <div class="text-gray-500">
              <span class="font-medium">AI 模型声明：</span>AI 分析功能由 DeepSeek 大模型提供支持，分析结果仅供参考，不构成专业财务建议。
            </div>
            <div class="text-gray-500">
              <span class="font-medium">项目归属：</span>AI 编程实训营 Module 1 实践项目
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Download, Delete, Setting } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import { useSettingsStore } from '@/stores/settings'
import { getTransactions } from '@/utils/storage'

const router = useRouter()
const settingsStore = useSettingsStore()
const exportLoading = ref(false)

function onMonthChange(val: string) {
  settingsStore.update({ defaultMonth: val as 'current' | 'last' })
  ElMessage.success('设置已保存')
}

function onThousandChange(val: boolean) {
  settingsStore.update({ thousandSeparator: val })
  ElMessage.success('设置已保存')
}

function onAutoCloseChange(val: boolean) {
  settingsStore.update({ autoCloseLedger: val })
  ElMessage.success('设置已保存')
}

function handleExport() {
  const data = getTransactions()
  if (data.length === 0) {
    ElMessage.warning('暂无账单数据可导出')
    return
  }

  exportLoading.value = true

  // CSV header
  const headers = ['ID', '类型', '类别', '金额', '日期', '备注']
  const rows = data.map((t) => [
    t.id,
    t.type === 'income' ? '收入' : '支出',
    t.category,
    t.amount.toFixed(2),
    t.date,
    t.note || '',
  ])

  // Build CSV content with BOM for Excel Chinese support
  const bom = '﻿'
  const csvContent = bom + [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  const dateStr = dayjs().format('YYYY-MM-DD')
  link.href = url
  link.download = `个人账单_${dateStr}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  exportLoading.value = false
  ElMessage.success('账单导出成功')
}

async function handleClear() {
  await ElMessageBox.confirm(
    '⚠️ 此操作将永久删除所有账单数据，无法恢复，确定继续吗？',
    '警告',
    {
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger',
    }
  )

  localStorage.removeItem('finance_records')
  ElMessage.success('所有数据已清空')
  router.push('/')
  setTimeout(() => {
    window.location.reload()
  }, 300)
}
</script>
