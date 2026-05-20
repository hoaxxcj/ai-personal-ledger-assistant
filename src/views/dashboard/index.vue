<template>
  <div class="h-full flex flex-col">
    <!-- 顶部标题栏 -->
    <div class="bg-white px-6 py-3 flex items-center justify-between border-b border-gray-100 shrink-0">
      <div class="flex items-center gap-2">
        <el-icon class="text-primary"><Document /></el-icon>
        <span class="font-bold text-lg">{{ selectedYear }}账本</span>
      </div>
      <div class="text-xl font-bold">账本</div>
      <div class="flex items-center gap-4">
        <el-button text :icon="Search">搜索账单</el-button>
        <el-button text :icon="Calendar">按月统计</el-button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="flex-1 overflow-auto p-4">
      <div class="flex gap-4 h-full">
        <!-- 左侧内容区 -->
        <div class="flex-1 space-y-4 min-w-0">
          <!-- 统计卡片 -->
          <div class="grid grid-cols-4 gap-4">
            <stat-card
              v-for="card in statCards"
              :key="card.title"
              v-bind="card"
            />
          </div>

          <!-- 图表区域 -->
          <div class="grid grid-cols-2 gap-4">
            <!-- 支出统计图 -->
            <el-card shadow="hover" class="!rounded-xl">
              <template #header>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full bg-warning"></div>
                    <span class="font-medium">支出统计图</span>
                    <span class="text-xs text-gray-400">平均值: ¥{{ avgDailyExpense.toFixed(2) }}</span>
                  </div>
                  <el-icon class="text-gray-400 cursor-pointer"><DataLine /></el-icon>
                </div>
              </template>
              <div v-if="dailyData.some((d) => d.expense > 0)" class="h-64">
                <v-chart class="h-full" :option="barOption" autoresize />
              </div>
              <div v-else class="h-64 flex items-center justify-center text-gray-400">
                暂无数据，记一笔吧~
              </div>
              <div class="flex justify-center gap-6 mt-2">
                <span class="text-sm text-gray-500 cursor-pointer hover:text-primary">支出</span>
                <span class="text-sm text-gray-300">收入</span>
                <span class="text-sm text-gray-300">结余</span>
              </div>
            </el-card>

            <!-- 支出分类详情 -->
            <el-card shadow="hover" class="!rounded-xl">
              <template #header>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full bg-warning"></div>
                    <span class="font-medium">支出分类详情</span>
                  </div>
                  <el-button text size="small">一级分类</el-button>
                </div>
              </template>
              <div class="flex">
                <div v-if="pieData.length" class="h-64 w-1/2">
                  <v-chart class="h-full" :option="donutOption" autoresize />
                </div>
                <div v-else class="h-64 w-1/2 flex items-center justify-center text-gray-400">
                  暂无数据
                </div>
                <div class="w-1/2 flex flex-col justify-center gap-3 pl-2">
                  <div
                    v-for="item in categoryDetail.slice(0, 5)"
                    :key="item.category"
                    class="flex items-center gap-2"
                  >
                    <div class="w-3 h-3 rounded-full shrink-0" :style="{ backgroundColor: getCategoryColor(item.category) }"></div>
                    <span class="text-xs text-gray-500 w-16 truncate">{{ item.category }}</span>
                    <span class="text-xs text-gray-400">{{ (item.percentage * 100).toFixed(1) }}%</span>
                  </div>
                </div>
              </div>
              <div class="flex justify-center gap-6 mt-2">
                <span class="text-sm text-gray-500 cursor-pointer hover:text-primary">支出</span>
                <span class="text-sm text-gray-300">收入</span>
              </div>
            </el-card>
          </div>

          <!-- 第二排图表 -->
          <div class="grid grid-cols-2 gap-4">
            <!-- 净资产趋势图 -->
            <el-card shadow="hover" class="!rounded-xl">
              <template #header>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full bg-success"></div>
                    <span class="font-medium">净资产趋势图</span>
                  </div>
                </div>
              </template>
              <div class="h-64">
                <v-chart class="h-full" :option="assetOption" autoresize />
              </div>
              <div class="flex justify-center gap-6 mt-2">
                <span class="text-sm text-gray-500 cursor-pointer hover:text-primary">净资产</span>
                <span class="text-sm text-gray-300">总资产</span>
                <span class="text-sm text-gray-300">总负债</span>
              </div>
            </el-card>

            <!-- 分类列表 -->
            <el-card shadow="hover" class="!rounded-xl">
              <template #header>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full bg-warning"></div>
                    <span class="font-medium">支出分类排行</span>
                  </div>
                </div>
              </template>
              <div class="space-y-3 max-h-64 overflow-y-auto">
                <div
                  v-for="(item, idx) in categoryDetail"
                  :key="item.category"
                  class="flex items-center gap-3"
                >
                  <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs shrink-0"
                    :style="{ backgroundColor: getCategoryColor(item.category) }"
                  >
                    {{ idx + 1 }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-sm font-medium">{{ item.category }}</span>
                      <span class="text-sm font-bold">¥{{ item.amount.toFixed(2) }}</span>
                    </div>
                    <el-progress
                      :percentage="Math.round(item.percentage * 100)"
                      :color="getCategoryColor(item.category)"
                      :show-text="false"
                      :stroke-width="6"
                    />
                    <div class="text-xs text-gray-400 mt-0.5">{{ item.count }}笔</div>
                  </div>
                </div>
              </div>
            </el-card>
          </div>

          <!-- 同环比分析 -->
          <el-card shadow="hover" class="!rounded-xl">
            <template #header>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 rounded-full bg-primary"></div>
                  <span class="font-medium">月度收支对比分析</span>
                </div>
                <el-button
                  type="primary"
                  size="small"
                  :icon="MagicStick"
                  :loading="aiLoading"
                  @click="handleAiAnalysis"
                >
                  分析账单
                </el-button>
              </div>
            </template>

            <div class="grid grid-cols-3 gap-4 mb-4">
              <!-- 支出环比 -->
              <div class="text-center p-3 bg-gray-50 rounded-lg">
                <div class="text-xs text-gray-500 mb-1">支出环比</div>
                <div class="text-lg font-bold">¥{{ monthCompare.expense.mom.current.toFixed(2) }}</div>
                <div class="text-xs mt-1"
                  :class="monthCompare.expense.mom.diff >= 0 ? 'text-red-500' : 'text-green-500'"
                >
                  {{ monthCompare.expense.mom.diff >= 0 ? '↑' : '↓' }}
                  {{ Math.abs(monthCompare.expense.mom.diffPercent * 100).toFixed(1) }}%
                  <span class="text-gray-400">(上月 ¥{{ monthCompare.expense.mom.compare.toFixed(2) }})</span>
                </div>
              </div>

              <!-- 支出同比 -->
              <div class="text-center p-3 bg-gray-50 rounded-lg">
                <div class="text-xs text-gray-500 mb-1">支出同比</div>
                <div class="text-lg font-bold">¥{{ monthCompare.expense.yoy.current.toFixed(2) }}</div>
                <div class="text-xs mt-1"
                  :class="monthCompare.expense.yoy.diff >= 0 ? 'text-red-500' : 'text-green-500'"
                >
                  {{ monthCompare.expense.yoy.diff >= 0 ? '↑' : '↓' }}
                  {{ Math.abs(monthCompare.expense.yoy.diffPercent * 100).toFixed(1) }}%
                  <span class="text-gray-400">(去年 ¥{{ monthCompare.expense.yoy.compare.toFixed(2) }})</span>
                </div>
              </div>

              <!-- 结余环比 -->
              <div class="text-center p-3 bg-gray-50 rounded-lg">
                <div class="text-xs text-gray-500 mb-1">结余环比</div>
                <div class="text-lg font-bold">¥{{ monthCompare.balance.mom.current.toFixed(2) }}</div>
                <div class="text-xs mt-1"
                  :class="monthCompare.balance.mom.diff >= 0 ? 'text-green-500' : 'text-red-500'"
                >
                  {{ monthCompare.balance.mom.diff >= 0 ? '↑' : '↓' }}
                  {{ Math.abs(monthCompare.balance.mom.diffPercent * 100).toFixed(1) }}%
                  <span class="text-gray-400">(上月 ¥{{ monthCompare.balance.mom.compare.toFixed(2) }})</span>
                </div>
              </div>
            </div>

            <!-- 分类费用同步分析 -->
            <div v-if="categoryCompare.length > 0">
              <div class="text-xs text-gray-500 mb-2">分类费用环比变化</div>
              <div class="space-y-2 max-h-48 overflow-y-auto">
                <div
                  v-for="item in categoryCompare.slice(0, 6)"
                  :key="item.category"
                  class="flex items-center gap-3 text-sm"
                >
                  <div class="w-20 truncate">{{ item.category }}</div>
                  <div class="flex-1">
                    <el-progress
                      :percentage="Math.round(item.currentPercent * 100)"
                      :color="getCategoryColor(item.category)"
                      :show-text="false"
                      :stroke-width="4"
                    />
                  </div>
                  <div class="w-16 text-right">¥{{ item.currentAmount.toFixed(0) }}</div>
                  <div
                    class="w-16 text-right text-xs"
                    :class="item.diff >= 0 ? 'text-red-500' : 'text-green-500'"
                  >
                    {{ item.diff >= 0 ? '+' : '' }}{{ item.diff.toFixed(0) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- AI 分析结果 -->
            <div
              v-if="aiResult"
              class="bg-gray-50 rounded-lg p-4 text-sm leading-relaxed whitespace-pre-wrap mt-4"
            >
              {{ aiResult }}
            </div>
            <div v-else-if="aiLoading" class="text-center py-4 text-gray-400">
              <el-icon class="is-loading"><Loading /></el-icon>
              <span class="ml-2">AI 正在分析...</span>
            </div>
          </el-card>
        </div>

        <!-- 右侧日历+明细 -->
        <div class="w-[380px] shrink-0 space-y-4">
          <!-- 日历 -->
          <el-card shadow="hover" class="!rounded-xl">
            <template #header>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <el-icon class="text-primary"><Calendar /></el-icon>
                  <span class="font-bold">{{ selectedYear }}年{{ selectedMonthNum }}月</span>
                </div>
                <div class="flex gap-2">
                  <el-button circle size="small" @click="prevMonth">
                    <el-icon><ArrowLeft /></el-icon>
                  </el-button>
                  <el-button circle size="small" @click="nextMonth">
                    <el-icon><ArrowRight /></el-icon>
                  </el-button>
                </div>
              </div>
            </template>

            <div class="custom-calendar">
              <div class="grid grid-cols-7 text-center text-xs text-gray-400 mb-2">
                <span v-for="d in weekDays" :key="d">{{ d }}</span>
              </div>
              <div class="grid grid-cols-7 gap-1">
                <div
                  v-for="day in calendarDays"
                  :key="day.date"
                  :class="[
                    'text-center py-1 rounded-lg cursor-pointer transition-colors text-xs',
                    day.isCurrentMonth ? '' : 'text-gray-300',
                    selectedDate === day.date ? 'bg-primary text-white' : 'hover:bg-gray-100',
                  ]"
                  @click="selectDate(day.date)"
                >
                  <div>{{ day.day }}</div>
                  <div v-if="day.expense > 0" class="text-[10px] text-red-500 leading-tight"
                    :class="selectedDate === day.date ? 'text-red-200' : ''"
                  >
                    {{ formatSmallNum(day.expense) }}
                  </div>
                  <div v-if="day.income > 0" class="text-[10px] text-green-500 leading-tight"
                    :class="selectedDate === day.date ? 'text-green-200' : ''"
                  >
                    +{{ formatSmallNum(day.income) }}
                  </div>
                </div>
              </div>
            </div>
          </el-card>

          <!-- 当日账单明细 -->
          <el-card shadow="hover" class="!rounded-xl">
            <template #header>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="font-medium">{{ selectedDate }} {{ selectedDateWeekday }}</span>
                </div>
                <span class="text-sm text-red-500">支出: ¥{{ daySummary.expense.toFixed(2) }}</span>
              </div>
            </template>

            <div class="space-y-3 max-h-[320px] overflow-y-auto">
              <div
                v-for="item in dayTransactions"
                :key="item.id"
                class="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
              >
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                    <el-icon><component :is="getCategoryIcon(item.category)" /></el-icon>
                  </div>
                  <div>
                    <div class="text-sm">{{ item.note || item.category }}</div>
                    <div class="text-xs text-gray-400">{{ item.category }}</div>
                  </div>
                </div>
                <div class="text-right">
                  <div :class="item.type === 'income' ? 'text-green-500' : 'text-red-500'">
                    {{ item.type === 'income' ? '+' : '-' }}¥{{ item.amount.toFixed(2) }}
                  </div>
                </div>
              </div>
              <div v-if="dayTransactions.length === 0" class="text-center text-gray-400 py-4">
                暂无记录
              </div>
            </div>
          </el-card>

          <!-- 报销板块 -->
          <el-card shadow="hover" class="!rounded-xl">
            <template #header>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <el-icon class="text-primary"><Money /></el-icon>
                  <span class="font-medium">待报销</span>
                  <el-tag v-if="reimbursableList.length > 0" type="warning" size="small">{{ reimbursableList.length }}笔</el-tag>
                </div>
                <span class="text-sm font-bold text-warning">¥{{ reimbursement.reimbursable.toFixed(2) }}</span>
              </div>
            </template>

            <div class="space-y-3 max-h-[240px] overflow-y-auto">
              <div
                v-for="item in reimbursableList"
                :key="item.id"
                class="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
              >
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                    <el-icon><component :is="getCategoryIcon(item.category)" /></el-icon>
                  </div>
                  <div>
                    <div class="text-sm">{{ item.note || item.category }}</div>
                    <div class="text-xs text-gray-400">{{ item.date }}</div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <div class="text-right">
                    <div class="text-red-500">-¥{{ item.amount.toFixed(2) }}</div>
                  </div>
                  <el-button
                    link
                    type="success"
                    size="small"
                    @click="markReimbursed(item.id)"
                  >
                    已报销
                  </el-button>
                </div>
              </div>
              <div v-if="reimbursableList.length === 0" class="text-center text-gray-400 py-4">
                暂无待报销记录
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </div>

    <!-- 浮动记账按钮 -->
    <el-button
      type="warning"
      circle
      size="large"
      class="fixed bottom-8 right-8 shadow-lg z-50 !w-14 !h-14"
      @click="ledgerVisible = true"
    >
      <el-icon class="text-2xl"><Plus /></el-icon>
    </el-button>

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
import { ref, computed, onMounted } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'
import {
  Plus,
  Search,
  Calendar,
  ArrowLeft,
  ArrowRight,
  Document,
  DataLine,
  Money,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { useLedgerStore } from '@/stores/ledger'
import {
  buildBillSummary,
  getMonthDailyData,
  getCategoryPieData,
  getCategoryDetail,
  getDayTransactions,
  getDaySummary,
  getNetAssetTrend,
  getReimbursementSummary,
  getReimbursableList,
  getMonthCompare,
  getCategoryCompare,
} from '@/utils/summary'
import LedgerForm from './components/LedgerForm.vue'
import AiChatFloat from '@/components/AiChatFloat.vue'
import { streamAnalysis } from '@/services/ai'
import StatCard from './components/StatCard.vue'

dayjs.locale('zh-cn')

use([CanvasRenderer, BarChart, LineChart, PieChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent])

const ledgerStore = useLedgerStore()
const selectedMonth = ref(dayjs().format('YYYY-MM'))
const selectedDate = ref(dayjs().format('YYYY-MM-DD'))
const ledgerVisible = ref(false)
const editingId = ref('')
const editingData = ref()
const aiLoading = ref(false)
const aiResult = ref('')

const selectedYear = computed(() => selectedMonth.value.split('-')[0])
const selectedMonthNum = computed(() => selectedMonth.value.split('-')[1])

const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

const summary = computed(() => {
  void ledgerStore.transactions.length
  return buildBillSummary(selectedMonth.value)
})

const dailyData = computed(() => {
  void ledgerStore.transactions.length
  return getMonthDailyData(selectedMonth.value)
})

const pieData = computed(() => {
  void ledgerStore.transactions.length
  return getCategoryPieData(selectedMonth.value)
})

const categoryDetail = computed(() => {
  void ledgerStore.transactions.length
  return getCategoryDetail(selectedMonth.value)
})

const assetTrend = computed(() => {
  void ledgerStore.transactions.length
  return getNetAssetTrend(selectedMonth.value)
})

const dayTransactions = computed(() => {
  void ledgerStore.transactions.length
  return getDayTransactions(selectedDate.value)
})

const daySummary = computed(() => {
  void ledgerStore.transactions.length
  return getDaySummary(selectedDate.value)
})

const avgDailyExpense = computed(() => {
  const total = dailyData.value.reduce((s, d) => s + d.expense, 0)
  const days = dailyData.value.filter((d) => d.expense > 0).length
  return days > 0 ? total / days : 0
})

const selectedDateWeekday = computed(() => {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return weekdays[dayjs(selectedDate.value).day()]
})

const reimbursement = computed(() => {
  void ledgerStore.transactions.length
  return getReimbursementSummary(selectedMonth.value)
})

const reimbursableList = computed(() => {
  void ledgerStore.transactions.length
  return getReimbursableList(selectedMonth.value)
})

const monthCompare = computed(() => {
  void ledgerStore.transactions.length
  return getMonthCompare(selectedMonth.value)
})

const categoryCompare = computed(() => {
  void ledgerStore.transactions.length
  return getCategoryCompare(selectedMonth.value)
})

const statCards = computed(() => [
  {
    title: '总支出',
    amount: summary.value.totalExpense,
    subtitle: `总收入 ¥${summary.value.totalIncome.toFixed(2)}`,
    type: 'expense' as const,
    dotColor: '#f56c6c',
  },
  {
    title: '剩余预算',
    amount: 3000 - summary.value.totalExpense,
    subtitle: `总预算 ¥3,000.00\n剩余日均 ¥${((3000 - summary.value.totalExpense) / dayjs(selectedMonth.value).daysInMonth()).toFixed(2)}`,
    type: 'budget' as const,
    dotColor: '#67c23a',
  },
  {
    title: '待报销',
    amount: reimbursement.value.reimbursable,
    subtitle: `已报销 ¥${reimbursement.value.reimbursed.toFixed(2)}\n报销入账 ¥${reimbursement.value.reimbursed.toFixed(2)}`,
    type: 'info' as const,
    dotColor: '#409eff',
  },
  {
    title: '净资产',
    amount: summary.value.balance,
    subtitle: `总资产 ¥${summary.value.totalIncome.toFixed(2)}\n总负债 ¥${summary.value.totalExpense.toFixed(2)}`,
    type: 'balance' as const,
    dotColor: '#e6a23c',
  },
])

const categoryColors: Record<string, string> = {
  餐饮: '#f56c6c',
  交通: '#409eff',
  购物: '#e6a23c',
  娱乐: '#67c23a',
  居住: '#909399',
  医疗: '#ff6b9d',
  其他: '#c0c4cc',
  工资: '#67c23a',
  奖金: '#e6a23c',
  理财: '#409eff',
}

function getCategoryColor(cat: string) {
  return categoryColors[cat] || '#c0c4cc'
}

function getCategoryIcon(cat: string) {
  const map: Record<string, string> = {
    餐饮: 'Food',
    交通: 'Van',
    购物: 'ShoppingBag',
    娱乐: 'Film',
    居住: 'House',
    医疗: 'FirstAidKit',
    工资: 'Money',
    奖金: 'Present',
    理财: 'TrendCharts',
  }
  return map[cat] || 'More'
}

const calendarDays = computed(() => {
  const yearMonth = selectedMonth.value
  const firstDay = dayjs(yearMonth + '-01')
  const daysInMonth = firstDay.daysInMonth()
  const startWeekday = firstDay.day()
  const prevMonthDays = dayjs(yearMonth + '-01').subtract(1, 'month').daysInMonth()

  const days: { date: string; day: number; expense: number; income: number; isCurrentMonth: boolean }[] = []

  // 上月补齐
  for (let i = startWeekday - 1; i >= 0; i--) {
    const d = prevMonthDays - i
    days.push({ date: '', day: d, expense: 0, income: 0, isCurrentMonth: false })
  }

  // 当月
  for (let i = 1; i <= daysInMonth; i++) {
    const date = `${yearMonth}-${String(i).padStart(2, '0')}`
    const s = getDaySummary(date)
    days.push({ date, day: i, expense: s.expense, income: s.income, isCurrentMonth: true })
  }

  // 下月补齐
  const remaining = (7 - (days.length % 7)) % 7
  for (let i = 1; i <= remaining; i++) {
    days.push({ date: '', day: i, expense: 0, income: 0, isCurrentMonth: false })
  }

  return days
})

function formatSmallNum(n: number) {
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return n.toFixed(0)
}

function selectDate(date: string) {
  if (!date) return
  selectedDate.value = date
}

function prevMonth() {
  selectedMonth.value = dayjs(selectedMonth.value).subtract(1, 'month').format('YYYY-MM')
  selectedDate.value = selectedMonth.value + '-01'
}

function nextMonth() {
  selectedMonth.value = dayjs(selectedMonth.value).add(1, 'month').format('YYYY-MM')
  selectedDate.value = selectedMonth.value + '-01'
}

const barOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  grid: { left: '3%', right: '3%', bottom: '3%', top: '10%', containLabel: true },
  xAxis: {
    type: 'category',
    data: dailyData.value.map((d) => d.date),
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { interval: 4, fontSize: 10, color: '#999' },
  },
  yAxis: {
    type: 'value',
    splitLine: { lineStyle: { type: 'dashed', color: '#eee' } },
    axisLabel: { show: false },
  },
  series: [
    {
      name: '支出',
      type: 'bar',
      data: dailyData.value.map((d) => d.expense),
      itemStyle: { color: '#f56c6c', borderRadius: [2, 2, 0, 0] },
      barWidth: '60%',
    },
  ],
}))

const donutOption = computed(() => {
  const colors = pieData.value.map((_, i) => {
    const palette = ['#f56c6c', '#e6a23c', '#409eff', '#67c23a', '#909399', '#ff6b9d', '#c0c4cc']
    return palette[i % palette.length]
  })
  return {
    tooltip: { trigger: 'item', formatter: '{b}: {d}%' },
    color: colors,
    series: [
      {
        name: '支出分类',
        type: 'pie',
        radius: ['55%', '80%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        emphasis: { label: { show: false } },
        data: pieData.value,
      },
    ],
    graphic: [
      {
        type: 'text',
        left: 'center',
        top: '42%',
        style: {
          text: '总支出',
          textAlign: 'center',
          fill: '#999',
          fontSize: 12,
        },
      },
      {
        type: 'text',
        left: 'center',
        top: '52%',
        style: {
          text: `¥${summary.value.totalExpense.toFixed(2)}`,
          textAlign: 'center',
          fill: '#333',
          fontSize: 14,
          fontWeight: 'bold',
        },
      },
    ],
  }
})

const assetOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  grid: { left: '3%', right: '3%', bottom: '3%', top: '10%', containLabel: true },
  xAxis: {
    type: 'category',
    data: assetTrend.value.map((d) => d.date),
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { interval: 4, fontSize: 10, color: '#999' },
  },
  yAxis: {
    type: 'value',
    splitLine: { lineStyle: { type: 'dashed', color: '#eee' } },
    axisLabel: { show: false },
  },
  series: [
    {
      name: '净资产',
      type: 'line',
      data: assetTrend.value.map((d) => d.asset),
      smooth: true,
      areaStyle: { color: 'rgba(103, 194, 58, 0.15)' },
      itemStyle: { color: '#67c23a' },
      lineStyle: { width: 2 },
      showSymbol: false,
    },
  ],
}))

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

async function markReimbursed(id: string) {
  await ElMessageBox.confirm('确认该笔支出已报销？', '提示', { type: 'info' })
  ledgerStore.update(id, { reimbursement: 'reimbursed' })
  ElMessage.success('已标记为已报销')
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
