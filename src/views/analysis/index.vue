<template>
  <div class="h-full flex flex-col">
    <!-- 顶部标题栏 -->
    <div class="bg-white px-6 py-3 flex items-center justify-between border-b border-gray-100 shrink-0">
      <div class="flex items-center gap-2">
        <el-icon class="text-primary"><TrendCharts /></el-icon>
        <span class="font-bold text-lg">分析</span>
      </div>
      <div class="flex items-center gap-2">
        <el-select v-model="selectedMonth" style="width: 140px" size="small">
          <el-option
            v-for="m in monthOptions"
            :key="m.value"
            :label="m.label"
            :value="m.value"
          />
        </el-select>
      </div>
    </div>

    <!-- 内容区 -->
    <div class="flex-1 overflow-auto p-4">
      <div class="space-y-4">
        <!-- 收支对比分析 -->
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
              <div class="text-lg font-bold">¥{{ settingsStore.formatAmount(monthCompare.expense.mom.current) }}</div>
              <div class="text-xs mt-1"
                :class="monthCompare.expense.mom.diff >= 0 ? 'text-red-500' : 'text-green-500'"
              >
                {{ monthCompare.expense.mom.diff >= 0 ? '↑' : '↓' }}
                {{ Math.abs(monthCompare.expense.mom.diffPercent * 100).toFixed(1) }}%
                <span class="text-gray-400">(上月 ¥{{ settingsStore.formatAmount(monthCompare.expense.mom.compare) }})</span>
              </div>
            </div>

            <!-- 支出同比 -->
            <div class="text-center p-3 bg-gray-50 rounded-lg">
              <div class="text-xs text-gray-500 mb-1">支出同比</div>
              <div class="text-lg font-bold">¥{{ settingsStore.formatAmount(monthCompare.expense.yoy.current) }}</div>
              <div class="text-xs mt-1"
                :class="monthCompare.expense.yoy.diff >= 0 ? 'text-red-500' : 'text-green-500'"
              >
                {{ monthCompare.expense.yoy.diff >= 0 ? '↑' : '↓' }}
                {{ Math.abs(monthCompare.expense.yoy.diffPercent * 100).toFixed(1) }}%
                <span class="text-gray-400">(去年 ¥{{ settingsStore.formatAmount(monthCompare.expense.yoy.compare) }})</span>
              </div>
            </div>

            <!-- 结余环比 -->
            <div class="text-center p-3 bg-gray-50 rounded-lg">
              <div class="text-xs text-gray-500 mb-1">结余环比</div>
              <div class="text-lg font-bold">¥{{ settingsStore.formatAmount(monthCompare.balance.mom.current) }}</div>
              <div class="text-xs mt-1"
                :class="monthCompare.balance.mom.diff >= 0 ? 'text-green-500' : 'text-red-500'"
              >
                {{ monthCompare.balance.mom.diff >= 0 ? '↑' : '↓' }}
                {{ Math.abs(monthCompare.balance.mom.diffPercent * 100).toFixed(1) }}%
                <span class="text-gray-400">(上月 ¥{{ settingsStore.formatAmount(monthCompare.balance.mom.compare) }})</span>
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
                <div class="w-16 text-right">¥{{ settingsStore.formatAmount(item.currentAmount) }}</div>
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

        <!-- 图表 -->
        <el-row :gutter="16">
          <el-col :xs="24" :lg="12">
            <el-card shadow="hover" class="!rounded-xl">
              <template #header>近半年月度收支对比</template>
              <div class="h-80">
                <v-chart class="h-full" :option="barOption" autoresize />
              </div>
            </el-card>
          </el-col>
          <el-col :xs="24" :lg="12">
            <el-card shadow="hover" class="!rounded-xl">
              <template #header>近半年分类趋势</template>
              <div class="h-80">
                <v-chart class="h-full" :option="lineOption" autoresize />
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- 支出方式趋势 -->
        <el-card shadow="hover" class="!rounded-xl">
          <template #header>近半年支出方式趋势</template>
          <div class="h-80">
            <v-chart class="h-full" :option="paymentMethodOption" autoresize />
          </div>
        </el-card>

        <!-- AI 消费洞察 -->
        <el-card shadow="hover" class="!rounded-xl">
          <template #header>
            <div class="flex items-center justify-between">
              <span>AI 消费洞察</span>
              <el-tag v-if="aiResult" size="small" type="success">已分析</el-tag>
              <el-tag v-else size="small" type="info">未分析</el-tag>
            </div>
          </template>
          <div v-if="aiResult" class="space-y-4">
            <div class="bg-gray-50 rounded-lg p-4 text-sm leading-relaxed whitespace-pre-wrap">
              {{ aiResult }}
            </div>
            <div class="h-64">
              <v-chart class="h-full" :option="pieOption" autoresize />
            </div>
          </div>
          <div v-else class="text-center py-8 text-gray-400">
            <el-icon :size="48" class="mb-2"><TrendCharts /></el-icon>
            <p class="text-sm">点击上方「分析账单」按钮，获取 AI 消费洞察</p>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
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
import { TrendCharts, MagicStick, Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import { useLedgerStore } from '@/stores/ledger'
import {
  buildBillSummary,
  getCategoryDetail,
  getCategoryPieData,
  getMonthCompare,
  getCategoryCompare,
  getPaymentMethodTrend,
} from '@/utils/summary'
import { streamAnalysis } from '@/services/ai'
import { useSettingsStore } from '@/stores/settings'

use([CanvasRenderer, BarChart, LineChart, PieChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent])

const ledgerStore = useLedgerStore()
const settingsStore = useSettingsStore()

const selectedMonth = ref(dayjs().format('YYYY-MM'))
const aiLoading = ref(false)
const aiResult = ref('')

// 生成最近 12 个月选项
const monthOptions = computed(() => {
  const options: { label: string; value: string }[] = []
  for (let i = 0; i < 12; i++) {
    const d = dayjs().subtract(i, 'month')
    options.push({
      label: d.format('YYYY年MM月'),
      value: d.format('YYYY-MM'),
    })
  }
  return options
})

const monthCompare = computed(() => {
  void ledgerStore.transactions.length
  return getMonthCompare(selectedMonth.value)
})

const categoryCompare = computed(() => {
  void ledgerStore.transactions.length
  return getCategoryCompare(selectedMonth.value)
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

const recentMonths = computed(() =>
  Array.from({ length: 6 }, (_, i) => dayjs().subtract(5 - i, 'month').format('YYYY-MM'))
)

const barOption = computed(() => {
  void ledgerStore.transactions.length
  const data = recentMonths.value.map((m) => {
    const s = buildBillSummary(m)
    return { month: dayjs(m + '-01').format('M月'), income: s.totalIncome, expense: s.totalExpense }
  })

  // 往年同期数据
  const prevYearData = recentMonths.value.map((m) => {
    const prevMonth = dayjs(m + '-01').subtract(1, 'year').format('YYYY-MM')
    const s = buildBillSummary(prevMonth)
    return { income: s.totalIncome, expense: s.totalExpense }
  })

  // 用值轴精确控制柱状和折线的左右偏移
  const offset = 0.1
  const lineOffset = 0.2
  const n = data.length

  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['收入', '支出', '往年同期收入', '往年同期支出'] },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: {
      type: 'value',
      min: -0.5,
      max: n - 0.5,
      splitLine: { show: false },
      axisLabel: {
        formatter: (val) => {
          if (val >= 0 && val < n && Number.isInteger(val)) {
            return data[val].month
          }
          return ''
        },
      },
    },
    yAxis: { type: 'value', name: '金额', axisLine: { onZero: false } },
    series: [
      {
        name: '收入',
        type: 'bar',
        barWidth: 15,
        data: data.map((d, i) => [i - offset, d.income]),
        itemStyle: { color: '#67c23a' },
      },
      {
        name: '支出',
        type: 'bar',
        barWidth: 15,
        data: data.map((d, i) => [i + offset, d.expense]),
        itemStyle: { color: '#f56c6c' },
      },
      {
        name: '往年同期收入',
        type: 'line',
        data: prevYearData.map((d, i) => [i - lineOffset, d.income]),
        itemStyle: { color: '#67c23a' },
        lineStyle: { type: 'dashed', width: 2 },
        symbol: 'circle',
        symbolSize: 6,
      },
      {
        name: '往年同期支出',
        type: 'line',
        data: prevYearData.map((d, i) => [i + lineOffset, d.expense]),
        itemStyle: { color: '#f56c6c' },
        lineStyle: { type: 'dashed', width: 2 },
        symbol: 'circle',
        symbolSize: 6,
      }

    ],
  }
})

const lineOption = computed(() => {
  void ledgerStore.transactions.length
  const months = recentMonths.value
  // 汇总近6个月各分类总支出，取 Top 5
  const catTotals: Record<string, number> = {}
  months.forEach((m) => {
    getCategoryDetail(m).forEach((d: { category: string; amount: number }) => {
      catTotals[d.category] = (catTotals[d.category] || 0) + d.amount
    })
  })
  const topCats = Object.entries(catTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cat]) => cat)
  const palette = ['#f56c6c', '#409eff', '#e6a23c', '#67c23a', '#ff6b9d']
  const series = topCats.map((cat, idx) => ({
    name: cat,
    type: 'line' as const,
    smooth: true,
    data: months.map((m) => {
      const detail = getCategoryDetail(m)
      const item = detail.find((d) => d.category === cat)
      return item ? item.amount : 0
    }),
    itemStyle: { color: palette[idx % palette.length] },
  }))
  return {
    tooltip: { trigger: 'axis' },
    legend: { data: topCats },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: months.map((m) => dayjs(m + '-01').format('M月')) },
    yAxis: { type: 'value' },
    series,
  }
})

const pieOption = computed(() => {
  void ledgerStore.transactions.length
  const data = getCategoryPieData(selectedMonth.value)
  return {
    tooltip: { trigger: 'item', formatter: '{b}: ¥{c} ({d}%)' },
    legend: { type: 'scroll', orient: 'vertical', right: 10, top: 20, bottom: 20 },
    series: [
      {
        name: '支出分类',
        type: 'pie' as const,
        radius: ['40%', '70%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
        data: data.map((item: { name: string; value: number }) => ({
          ...item,
          itemStyle: { color: getCategoryColor(item.name) },
        })),
      },
    ],
  }
})

const paymentMethodOption = computed(() => {
  void ledgerStore.transactions.length
  const trend = getPaymentMethodTrend(recentMonths.value)
  return {
    tooltip: { trigger: 'axis' },
    legend: { data: ['支付宝', '微信', '银行卡', '其它'] },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: trend.months.map((m: string) => dayjs(m + '-01').format('M月')) },
    yAxis: { type: 'value' },
    series: trend.series,
  }
})
</script>
