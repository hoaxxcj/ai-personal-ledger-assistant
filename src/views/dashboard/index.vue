<template>
  <div class="h-full flex flex-col">
    <!-- 顶部标题栏 -->
    <div class="bg-white px-6 py-3 flex items-center justify-between border-b border-gray-100 shrink-0">
      <div class="flex items-center gap-2">
        <el-icon class="text-primary"><Document /></el-icon>
        <el-popover placement="bottom" :width="300" trigger="click" v-model:visible="yearPickerVisible">
          <template #reference>
            <span class="font-bold text-lg cursor-pointer hover:text-primary flex items-center gap-1">
              {{ selectedYear }}年账本
              <el-icon class="text-sm"><CaretBottom /></el-icon>
            </span>
          </template>
          <el-date-picker v-model="tempYear" type="year" value-format="YYYY" @change="onYearChange" class="w-full" />
        </el-popover>
      </div>
      <div class="flex items-center gap-4">
        <el-button text :icon="Search" @click="searchVisible = true">搜索账单</el-button>
        <el-segmented
          v-model="viewMode"
          :options="[
            { label: '按月统计', value: 'month' },
            { label: '按年统计', value: 'year' },
          ]"
          size="small"
        />
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="flex-1 overflow-auto p-4">
      <div class="flex flex-col xl:flex-row gap-4 h-full">
        <!-- 左侧内容区 -->
        <div class="flex-1 space-y-4 min-w-0">
          <!-- 统计卡片 -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <stat-card
              v-for="card in statCards"
              :key="card.title"
              v-bind="card"
              :formatter="settingsStore.formatAmount"
            />
          </div>

          <!-- 图表区域 -->
          <div class="flex flex-col lg:flex-row gap-4">
            <!-- 左侧列 -->
            <div class="flex-1 flex flex-col gap-4">
              <el-card shadow="hover" class="!rounded-xl">
                <template #header>
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <div class="w-2 h-2 rounded-full bg-warning"></div>
                      <span class="font-medium">{{ barChartType === 'expense' ? '支出' : barChartType === 'income' ? '收入' : '结余' }}统计图</span>
                      <span class="text-xs text-gray-400">平均值: ¥{{ settingsStore.formatAmount(avgDailyBar) }}</span>
                    </div>
                    <el-icon class="text-gray-400 cursor-pointer"><DataLine /></el-icon>
                  </div>
                </template>
                <div v-if="chartHasData" class="h-64">
                  <v-chart class="h-full" :option="barOption" autoresize />
                </div>
                <div v-else class="h-64 flex items-center justify-center text-gray-400">
                  暂无数据，记一笔吧~
                </div>
                <div class="flex justify-center mt-3">
                  <el-segmented
                    v-model="barChartType"
                    :options="[
                      { label: '支出', value: 'expense' },
                      { label: '收入', value: 'income' },
                      { label: '结余', value: 'balance' },
                    ]"
                    size="small"
                  />
                </div>
              </el-card>

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
              </el-card>
            </div>

            <!-- 右侧列：分类详情 -->
            <el-card shadow="hover" class="!rounded-xl flex-1 category-detail-card">
              <template #header>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full bg-warning"></div>
                    <span class="font-medium">{{ pieChartType === 'expense' ? '支出分类详情' : '收入分类详情' }}</span>
                  </div>
                  <el-button text size="small">一级分类</el-button>
                </div>
              </template>

              <!-- 玫瑰图 -->
              <div class="shrink-0 h-56 w-[280px] mx-auto">
                <v-chart
                  v-if="pieData.length"
                  class="w-full h-full"
                  :option="donutOption"
                  autoresize
                />
                <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                  暂无数据
                </div>
              </div>

              <!-- 支出/收入切换 -->
              <div class="flex justify-center mt-2 shrink-0">
                <el-segmented
                  v-model="pieChartType"
                  :options="[
                    { label: '支出', value: 'expense' },
                    { label: '收入', value: 'income' },
                  ]"
                  size="small"
                />
              </div>

              <!-- 分类排行列表 -->
              <div class="mt-3 space-y-2 category-detail-list">
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
                      <div class="flex items-center gap-2">
                        <span class="text-sm font-medium">{{ item.category }}</span>
                        <span class="text-xs text-gray-400">{{ (item.percentage * 100).toFixed(1) }}%</span>
                      </div>
                      <span class="text-sm font-bold">¥{{ settingsStore.formatAmount(item.amount) }}</span>
                    </div>
                    <el-progress
                      :percentage="Math.round(item.percentage * 100)"
                      :color="getCategoryColor(item.category)"
                      :show-text="false"
                      :stroke-width="6"
                    />
                    <div class="text-xs text-gray-400 mt-0.5 text-right">{{ item.count }}笔</div>
                  </div>
                </div>
              </div>
            </el-card>
          </div>

        </div>

        <!-- 右侧日历+明细 -->
        <div class="xl:w-[380px] w-full xl:shrink-0 space-y-4">
          <!-- 日历 -->
          <el-card shadow="hover" class="!rounded-xl">
            <template #header>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <el-icon class="text-primary"><Calendar /></el-icon>
                  <span class="font-bold">{{ selectedYear }}年</span>
                  <span class="font-bold">{{ selectedMonthNum }}月</span>
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
                <span class="text-sm text-red-500">支出: ¥{{ settingsStore.formatAmount(daySummary.expense) }}</span>
              </div>
            </template>

            <div class="space-y-3 max-h-[320px] overflow-y-auto thin-scroll">
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
                    {{ item.type === 'income' ? '+' : '-' }}¥{{ settingsStore.formatAmount(item.amount) }}
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
                <span class="text-sm font-bold text-warning">¥{{ settingsStore.formatAmount(reimbursement.reimbursable) }}</span>
              </div>
            </template>

            <div class="space-y-3 max-h-[240px] overflow-y-auto thin-scroll">
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
                    <div class="text-red-500">-¥{{ settingsStore.formatAmount(item.amount) }}</div>
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

    <!-- 搜索账单弹窗 -->
    <el-dialog v-model="searchVisible" title="搜索账单" width="800px">
      <div class="flex flex-wrap items-center gap-3 mb-4">
        <el-radio-group v-model="searchForm.type" size="small">
          <el-radio-button label="">全部</el-radio-button>
          <el-radio-button label="expense">支出</el-radio-button>
          <el-radio-button label="income">收入</el-radio-button>
        </el-radio-group>
        <el-select v-model="searchForm.category" placeholder="选择分类" clearable size="small" style="width: 120px">
          <el-option v-for="cat in ledgerStore.categories" :key="cat.id" :label="cat.name" :value="cat.id" />
        </el-select>
        <el-date-picker
          v-model="searchForm.dateRange"
          type="daterange"
          value-format="YYYY-MM-DD"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          size="small"
        />
        <el-input v-model="searchForm.keyword" placeholder="搜索备注" clearable size="small" style="width: 160px" />
        <el-button type="primary" size="small" @click="handleSearch">查询</el-button>
      </div>

      <el-table :data="searchResults" max-height="400" size="small">
        <el-table-column prop="date" label="日期" width="110" sortable />
        <el-table-column prop="type" label="类型" width="70">
          <template #default="{ row }">
            <el-tag :type="row.type === 'income' ? 'success' : 'danger'" size="small">
              {{ row.type === 'income' ? '收入' : '支出' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="100" />
        <el-table-column prop="amount" label="金额" width="110" align="right">
          <template #default="{ row }">
            <span :class="row.type === 'income' ? 'text-green-500' : 'text-red-500'">
              {{ row.type === 'income' ? '+' : '-' }}¥{{ settingsStore.formatAmount(row.amount) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="note" label="备注" show-overflow-tooltip />
      </el-table>

      <div v-if="searchResults.length === 0" class="text-center text-gray-400 py-8">暂无符合条件的数据</div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
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
  CaretBottom,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { useLedgerStore } from '@/stores/ledger'
import { getTransactions } from '@/utils/storage'
import {
  buildBillSummary,
  buildYearSummary,
  getMonthDailyData,
  getYearMonthlyData,
  getCategoryPieData,
  getCategoryDetail,
  getDayTransactions,
  getDaySummary,
  getNetAssetTrend,
  getYearNetAssetTrend,
  getReimbursementSummary,
  getReimbursableList,
  getYearReimbursementSummary,
  getYearReimbursableList,
} from '@/utils/summary'
import LedgerForm from './components/LedgerForm.vue'
import AiChatFloat from '@/components/AiChatFloat.vue'
import { useSettingsStore } from '@/stores/settings'
import StatCard from './components/StatCard.vue'

dayjs.locale('zh-cn')

use([CanvasRenderer, BarChart, LineChart, PieChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent])

const ledgerStore = useLedgerStore()
const settingsStore = useSettingsStore()

const selectedMonth = ref(
  settingsStore.defaultMonth === 'last'
    ? dayjs().subtract(1, 'month').format('YYYY-MM')
    : dayjs().format('YYYY-MM')
)
const selectedDate = ref(dayjs().format('YYYY-MM-DD'))
const ledgerVisible = ref(false)
const editingId = ref('')
const editingData = ref()

const barChartType = ref<'expense' | 'income' | 'balance'>('expense')
const pieChartType = ref<'expense' | 'income'>('expense')
const viewMode = ref<'month' | 'year'>('month')

const yearPickerVisible = ref(false)
const tempYear = ref(dayjs().format('YYYY'))

function onYearChange(val: string) {
  if (!val) return
  selectedMonth.value = `${val}-${selectedMonthNum.value}`
  selectedDate.value = selectedMonth.value + '-01'
  yearPickerVisible.value = false
}

const searchVisible = ref(false)
const searchForm = reactive({
  type: '' as '' | 'expense' | 'income',
  category: '',
  dateRange: [] as string[],
  keyword: '',
})

const searchResults = computed(() => {
  void ledgerStore.transactions.length
  let list = [...ledgerStore.transactions].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
  if (searchForm.type) {
    list = list.filter((t) => t.type === searchForm.type)
  }
  if (searchForm.category) {
    list = list.filter((t) => t.category === searchForm.category)
  }
  if (searchForm.dateRange?.length === 2) {
    list = list.filter((t) => t.date >= searchForm.dateRange[0] && t.date <= searchForm.dateRange[1])
  }
  if (searchForm.keyword) {
    const kw = searchForm.keyword.toLowerCase()
    list = list.filter((t) => t.note?.toLowerCase().includes(kw) || t.category.toLowerCase().includes(kw))
  }
  return list
})

function handleSearch() {
  if (searchResults.value.length === 0) {
    ElMessage.info('未找到符合条件的数据')
  } else {
    ElMessage.success(`查询完成，共 ${searchResults.value.length} 条记录`)
  }
}

const selectedYear = computed(() => selectedMonth.value.split('-')[0])
const selectedMonthNum = computed(() => selectedMonth.value.split('-')[1])

const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

const summary = computed(() => {
  void ledgerStore.transactions.length
  return viewMode.value === 'year'
    ? buildYearSummary(selectedYear.value)
    : buildBillSummary(selectedMonth.value)
})

const dailyData = computed(() => {
  void ledgerStore.transactions.length
  return viewMode.value === 'year'
    ? getYearMonthlyData(selectedYear.value)
    : getMonthDailyData(selectedMonth.value)
})

const pieData = computed(() => {
  void ledgerStore.transactions.length
  const target = viewMode.value === 'year' ? selectedYear.value : selectedMonth.value
  const list = getTransactions().filter(
    (t) => t.date.startsWith(target) && t.type === pieChartType.value
  )
  const map: Record<string, number> = {}
  list.forEach((t) => {
    map[t.category] = (map[t.category] || 0) + t.amount
  })
  return Object.entries(map)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
})

const categoryDetail = computed(() => {
  void ledgerStore.transactions.length
  const target = viewMode.value === 'year' ? selectedYear.value : selectedMonth.value
  const list = getTransactions().filter(
    (t) => t.date.startsWith(target) && t.type === pieChartType.value
  )
  const total = list.reduce((s, t) => s + t.amount, 0)
  const map: Record<string, { amount: number; count: number }> = {}
  list.forEach((t) => {
    if (!map[t.category]) map[t.category] = { amount: 0, count: 0 }
    map[t.category].amount += t.amount
    map[t.category].count += 1
  })
  return Object.entries(map)
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      count: data.count,
      percentage: total > 0 ? data.amount / total : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
})

const assetTrend = computed(() => {
  void ledgerStore.transactions.length
  return viewMode.value === 'year'
    ? getYearNetAssetTrend(selectedYear.value)
    : getNetAssetTrend(selectedMonth.value)
})

const dayTransactions = computed(() => {
  void ledgerStore.transactions.length
  return getDayTransactions(selectedDate.value)
})

const daySummary = computed(() => {
  void ledgerStore.transactions.length
  return getDaySummary(selectedDate.value)
})

const chartHasData = computed(() => {
  const type = barChartType.value
  if (type === 'expense') return dailyData.value.some((d) => d.expense > 0)
  if (type === 'income') return dailyData.value.some((d) => d.income > 0)
  return dailyData.value.some((d) => d.income - d.expense !== 0)
})

const avgDailyBar = computed(() => {
  const type = barChartType.value
  const divisor = viewMode.value === 'year' ? 12 : dailyData.value.length
  if (type === 'expense') {
    const total = dailyData.value.reduce((s, d) => s + d.expense, 0)
    return total / divisor || 0
  }
  if (type === 'income') {
    const total = dailyData.value.reduce((s, d) => s + d.income, 0)
    return total / divisor || 0
  }
  // balance
  const total = dailyData.value.reduce((s, d) => s + (d.income - d.expense), 0)
  return total / divisor || 0
})

const selectedDateWeekday = computed(() => {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return weekdays[dayjs(selectedDate.value).day()]
})

const reimbursement = computed(() => {
  void ledgerStore.transactions.length
  return viewMode.value === 'year'
    ? getYearReimbursementSummary(selectedYear.value)
    : getReimbursementSummary(selectedMonth.value)
})

const reimbursableList = computed(() => {
  void ledgerStore.transactions.length
  return viewMode.value === 'year'
    ? getYearReimbursableList(selectedYear.value)
    : getReimbursableList(selectedMonth.value)
})

const statCards = computed(() => {
  const budgetRemaining = settingsStore.settings.monthlyBudget - summary.value.totalExpense
  const dailyRemaining = budgetRemaining / dayjs(selectedMonth.value).daysInMonth()
  const dailySign = dailyRemaining < 0 ? '-' : ''

  return [
  {
    title: viewMode.value === 'year' ? '年度总支出' : '总支出',
    amount: summary.value.totalExpense,
    subtitle: viewMode.value === 'year'
      ? `年度总收入 ¥${settingsStore.formatAmount(summary.value.totalIncome)}`
      : `总收入 ¥${settingsStore.formatAmount(summary.value.totalIncome)}`,
    type: 'expense' as const,
    dotColor: '#f56c6c',
  },
  {
    title: viewMode.value === 'year' ? '年度结余' : '剩余预算',
    amount: viewMode.value === 'year' ? summary.value.balance : budgetRemaining,
    subtitle: viewMode.value === 'year'
      ? `月均支出 ¥${settingsStore.formatAmount((summary.value as any).monthlyAverage || 0)}`
      : `总预算 ¥${settingsStore.formatAmount(settingsStore.settings.monthlyBudget)}\n剩余日均 ${dailySign}¥${settingsStore.formatAmount(Math.abs(dailyRemaining))}`,
    type: 'budget' as const,
    dotColor: '#67c23a',
  },
  {
    title: '待报销',
    amount: reimbursement.value.reimbursable,
    subtitle: `已报销 ¥${settingsStore.formatAmount(reimbursement.value.reimbursed)}\n报销入账 ¥${settingsStore.formatAmount(reimbursement.value.reimbursed)}`,
    type: 'info' as const,
    dotColor: '#409eff',
  },
  {
    title: viewMode.value === 'year' ? '年度净资产' : '净资产',
    amount: summary.value.balance,
    subtitle: `总资产 ¥${settingsStore.formatAmount(summary.value.totalIncome)}\n总负债 ¥${settingsStore.formatAmount(summary.value.totalExpense)}`,
    type: 'balance' as const,
    dotColor: '#e6a23c',
  },
  ]
})
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
  void ledgerStore.transactions.length
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

const barOption = computed(() => {
  const type = barChartType.value
  const isBalance = type === 'balance'
  const data = dailyData.value.map((d) =>
    type === 'expense' ? d.expense : type === 'income' ? d.income : d.income - d.expense
  )
  const color = type === 'expense' ? '#f56c6c' : type === 'income' ? '#67c23a' : '#409eff'
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '3%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: viewMode.value === 'year'
        ? dailyData.value.map((d) => (d as any).month)
        : dailyData.value.map((d) => d.date),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { interval: 0, fontSize: 10, color: '#999' },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { type: 'dashed', color: '#eee' } },
      axisLabel: { show: false },
    },
    series: [
      {
        name: type === 'expense' ? '支出' : type === 'income' ? '收入' : '结余',
        type: 'bar',
        data,
        itemStyle: {
          color: isBalance
            ? (params: any) => (params.value >= 0 ? '#67c23a' : '#f56c6c')
            : color,
          borderRadius: [2, 2, 0, 0],
        },
        barWidth: '60%',
      },
    ],
  }
})

const donutOption = computed(() => {
  void ledgerStore.transactions.length
  const type = pieChartType.value
  const palette = type === 'expense'
    ? ['#f56c6c', '#e6a23c', '#409eff', '#67c23a', '#909399', '#ff6b9d', '#c0c4cc']
    : ['#67c23a', '#409eff', '#e6a23c', '#f56c6c', '#909399', '#ff6b9d', '#c0c4cc']
  const colors = pieData.value.map((_, i) => palette[i % palette.length])
  const total = pieData.value.reduce((s, d) => s + d.value, 0)
  return {
    tooltip: { trigger: 'item', formatter: '{b}: ¥{c} ({d}%)' },
    color: colors,
    series: [
      {
        name: type === 'expense' ? '支出分类' : '收入分类',
        type: 'pie',
        radius: ['30%', '75%'],
        center: ['50%', '50%'],
        roseType: 'radius',
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
        label: { show: true, formatter: '{b}\n{d}%', fontSize: 10 },
        emphasis: { label: { show: true, fontSize: 12, fontWeight: 'bold' } },
        data: pieData.value,
      },
    ],
    graphic: [
      {
        type: 'text',
        left: 'center',
        top: '42%',
        style: {
          text: type === 'expense' ? '总支出' : '总收入',
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
          text: `¥${settingsStore.formatAmount(total)}`,
          textAlign: 'center',
          fill: '#333',
          fontSize: 14,
          fontWeight: 'bold',
        },
      },
    ],
  }
})

const assetOption = computed(() => {
  let runningAsset = 0
  let runningIncome = 0
  let runningExpense = 0
  const assetData = assetTrend.value.map((d) => d.asset)
  const totalAssetData = dailyData.value.map((d) => {
    runningIncome += d.income
    return runningIncome
  })
  const totalDebtData = dailyData.value.map((d) => {
    runningExpense += d.expense
    return runningExpense
  })
  const labels = viewMode.value === 'year'
    ? assetTrend.value.map((d) => (d as any).month)
    : assetTrend.value.map((d) => d.date)
  return {
    tooltip: { trigger: 'axis' },
    legend: { data: ['净资产', '总资产', '总负债'], top: 0 },
    grid: { left: '3%', right: '3%', bottom: '3%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: labels,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { interval: 0, fontSize: 10, color: '#999' },
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
        data: assetData,
        smooth: true,
        areaStyle: { color: 'rgba(103, 194, 58, 0.15)' },
        itemStyle: { color: '#67c23a' },
        lineStyle: { width: 2 },
        showSymbol: false,
      },
      {
        name: '总资产',
        type: 'line',
        data: totalAssetData,
        smooth: true,
        itemStyle: { color: '#409eff' },
        lineStyle: { width: 2 },
        showSymbol: false,
      },
      {
        name: '总负债',
        type: 'line',
        data: totalDebtData,
        smooth: true,
        itemStyle: { color: '#f56c6c' },
        lineStyle: { width: 2 },
        showSymbol: false,
      },
    ],
  }
})

function handleLedgerSubmit(data: any) {
  if (editingId.value) {
    ledgerStore.update(editingId.value, data)
    ElMessage.success('修改成功')
  } else {
    ledgerStore.add(data)
    ElMessage.success('记账成功')
  }
  if (settingsStore.autoCloseLedger) {
    ledgerVisible.value = false
  }
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

onMounted(() => {
  ledgerStore.refresh()
})
</script>

<style scoped>
.category-detail-card {
  display: flex;
  flex-direction: column;
}
.category-detail-card :deep(.el-card__body) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.category-detail-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
.thin-scroll::-webkit-scrollbar {
  width: 7px;
}
.thin-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.thin-scroll::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 2px;
  border-left: 3px solid transparent;
  background-clip: padding-box;
}
.thin-scroll::-webkit-scrollbar-thumb:hover {
  background-color: #d1d5db;
}
</style>
