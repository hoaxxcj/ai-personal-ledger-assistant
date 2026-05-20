<template>
  <div class="space-y-4">
    <!-- 隐私声明横幅 -->
    <el-alert
      type="info"
      :closable="false"
      show-icon
      class="bg-blue-50"
    >
      <template #title>
        <span class="text-sm">
          所有账单数据存储在本机浏览器中，AI 分析仅上传匿名统计摘要，完整流水永不外传。
          DeepSeek 不保留您的请求数据。
        </span>
      </template>
    </el-alert>

    <api-key-config ref="apiKeyRef" />

    <!-- 头部工具栏 -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <el-date-picker
          v-model="selectedMonth"
          type="month"
          placeholder="选择月份"
          format="YYYY年MM月"
          value-format="YYYY-MM"
          @change="onMonthChange"
        />
        <el-button type="primary" :icon="Plus" @click="ledgerVisible = true">记一笔</el-button>
      </div>
      <el-button text :icon="Setting" @click="apiKeyRef?.open()">API 配置</el-button>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="16">
      <el-col :xs="24" :sm="12" :lg="6">
        <stat-card title="本月收入" :amount="summary.totalIncome" type="income" icon="Money" />
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <stat-card title="本月支出" :amount="summary.totalExpense" type="expense" icon="ShoppingCart" />
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <stat-card title="结余" :amount="summary.balance" type="balance" icon="Wallet" />
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <stat-card title="日均支出" :amount="summary.dailyAverage" type="budget" icon="TrendCharts" />
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="16">
      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>
            <div class="flex items-center justify-between">
              <span>支出分类占比</span>
            </div>
          </template>
          <div v-if="pieData.length" class="h-72">
            <v-chart class="h-full" :option="pieOption" autoresize />
          </div>
          <div v-else class="h-72 flex items-center justify-center text-gray-400">
            暂无数据，记一笔吧~
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>
            <div class="flex items-center justify-between">
              <span>近7天支出趋势</span>
            </div>
          </template>
          <div v-if="trendData.some((d) => d.amount > 0)" class="h-72">
            <v-chart class="h-full" :option="lineOption" autoresize />
          </div>
          <div v-else class="h-72 flex items-center justify-center text-gray-400">
            暂无数据，记一笔吧~
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- AI 分析面板 -->
    <el-card>
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <el-icon class="text-primary"><MagicStick /></el-icon>
            <span>AI 消费分析</span>
          </div>
          <el-button
            type="primary"
            :icon="MagicStick"
            :loading="aiLoading"
            :disabled="summary.totalExpense === 0"
            @click="handleAiAnalysis"
          >
            分析本月账单
          </el-button>
        </div>
      </template>

      <div
        v-if="aiResult"
        class="bg-gray-50 rounded-lg p-4 text-sm leading-relaxed whitespace-pre-wrap"
      >
        {{ aiResult }}
      </div>
      <div v-else-if="aiLoading" class="text-center py-8 text-gray-400">
        <el-icon class="is-loading text-2xl mb-2"><Loading /></el-icon>
        <p>AI 正在分析您的账单...</p>
      </div>
      <div v-else class="text-center py-8 text-gray-400">
        <p>点击上方按钮，让 AI 为您分析消费情况</p>
        <p class="text-xs mt-1">仅上传匿名统计摘要，完整流水永不外传</p>
      </div>
    </el-card>

    <!-- 账单列表 -->
    <el-card>
      <template #header>
        <div class="flex items-center justify-between">
          <span>账单明细</span>
          <span class="text-sm text-gray-400">共 {{ currentList.length }} 条</span>
        </div>
      </template>

      <el-table :data="currentList" v-loading="tableLoading">
        <el-table-column prop="date" label="日期" width="120" sortable />
        <el-table-column prop="type" label="类型" width="80">
          <template #default="{ row }">
            <el-tag :type="row.type === 'income' ? 'success' : 'danger'" size="small">
              {{ row.type === 'income' ? '收入' : '支出' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="100" />
        <el-table-column prop="note" label="备注" show-overflow-tooltip />
        <el-table-column prop="amount" label="金额" width="120" align="right" sortable>
          <template #default="{ row }">
            <span :class="row.type === 'income' ? 'text-success' : 'text-danger'">
              {{ row.type === 'income' ? '+' : '-' }}¥{{ row.amount.toFixed(2) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 记账弹窗 -->
    <el-dialog v-model="ledgerVisible" :title="editingId ? '编辑账单' : '记一笔'" width="500px">
      <ledger-form
        :initial-data="editingData"
        @submit="handleLedgerSubmit"
        @cancel="ledgerVisible = false"
      />
    </el-dialog>

    <ai-chat-float />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, LineChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'
import { Plus, Setting, MagicStick, Loading } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import { useLedgerStore } from '@/stores/ledger'
import { buildBillSummary, getLast7DaysExpense, getCategoryPieData } from '@/utils/summary'
import { streamAnalysis } from '@/services/ai'
import StatCard from './components/StatCard.vue'
import LedgerForm from './components/LedgerForm.vue'
import ApiKeyConfig from '@/components/ApiKeyConfig.vue'
import AiChatFloat from '@/components/AiChatFloat.vue'

use([CanvasRenderer, PieChart, LineChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent])

const ledgerStore = useLedgerStore()
const apiKeyRef = ref()
const selectedMonth = ref(dayjs().format('YYYY-MM'))
const ledgerVisible = ref(false)
const editingId = ref('')
const editingData = ref()
const aiLoading = ref(false)
const aiResult = ref('')
const tableLoading = ref(false)

const currentList = computed(() =>
  ledgerStore.transactions
    .filter((t) => t.date.startsWith(selectedMonth.value))
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
)

const summary = computed(() => buildBillSummary(selectedMonth.value))
const pieData = computed(() => getCategoryPieData(selectedMonth.value))
const trendData = computed(() => getLast7DaysExpense())

const pieOption = computed(() => ({
  tooltip: { trigger: 'item', formatter: '{b}: ¥{c} ({d}%)' },
  legend: { orient: 'vertical', left: 'left' },
  series: [
    {
      name: '支出分类',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      label: { show: false, position: 'center' },
      emphasis: { label: { show: true, fontSize: 18, fontWeight: 'bold' } },
      data: pieData.value,
    },
  ],
}))

const lineOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', data: trendData.value.map((d) => d.date) },
  yAxis: { type: 'value' },
  series: [
    {
      name: '支出',
      type: 'line',
      data: trendData.value.map((d) => d.amount),
      smooth: true,
      areaStyle: { opacity: 0.1 },
      itemStyle: { color: '#f56c6c' },
    },
  ],
}))

function onMonthChange() {
  aiResult.value = ''
}

function handleLedgerSubmit(data: any) {
  if (editingId.value) {
    ledgerStore.update(editingId.value, data)
    ElMessage.success('修改成功')
  } else {
    ledgerStore.add(data)
    ElMessage.success('记账成功')
  }
  ledgerVisible.value = false
  editingId.value = ''
  editingData.value = undefined
}

function handleEdit(row: any) {
  editingId.value = row.id
  editingData.value = { ...row }
  ledgerVisible.value = true
}

async function handleDelete(id: string) {
  await ElMessageBox.confirm('确定删除这条记录吗？', '提示', { type: 'warning' })
  ledgerStore.remove(id)
  ElMessage.success('已删除')
}

async function handleAiAnalysis() {
  aiResult.value = ''
  aiLoading.value = true
  try {
    const s = buildBillSummary(selectedMonth.value)
    const stream = streamAnalysis(s)
    for await (const chunk of stream) {
      if (chunk.error) {
        ElMessage.error(chunk.error)
        break
      }
      if (chunk.done) break
      aiResult.value += chunk.content
    }
  } catch (err: any) {
    ElMessage.error(err.message || '分析失败')
  } finally {
    aiLoading.value = false
  }
}

onMounted(() => {
  ledgerStore.refresh()
})
</script>
