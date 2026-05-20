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
      <div class="space-y-4 max-w-5xl mx-auto">
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
              <template #header>月度收支对比</template>
              <div class="h-80">
                <v-chart class="h-full" :option="barOption" autoresize />
              </div>
            </el-card>
          </el-col>
          <el-col :xs="24" :lg="12">
            <el-card shadow="hover" class="!rounded-xl">
              <template #header>分类趋势</template>
              <div class="h-80">
                <v-chart class="h-full" :option="lineOption" autoresize />
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- AI 消费洞察 -->
        <el-card shadow="hover" class="!rounded-xl">
          <template #header>AI 消费洞察</template>
          <div class="space-y-3">
            <el-alert
              v-for="(insight, idx) in insights"
              :key="idx"
              :title="insight.title"
              :type="insight.type"
              :description="insight.description"
              show-icon
              :closable="false"
            />
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
import { BarChart, LineChart } from 'echarts/charts'
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
  getMonthCompare,
  getCategoryCompare,
} from '@/utils/summary'
import { streamAnalysis } from '@/services/ai'
import { useSettingsStore } from '@/stores/settings'

use([CanvasRenderer, BarChart, LineChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent])

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

const barOption = ref({
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  legend: { data: ['收入', '支出'] },
  xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月'] },
  yAxis: { type: 'value' },
  series: [
    { name: '收入', type: 'bar', data: [11000, 11500, 12000, 11800, 12000] },
    { name: '支出', type: 'bar', data: [4200, 3800, 5100, 3600, 3456] },
  ],
})

const lineOption = ref({
  tooltip: { trigger: 'axis' },
  legend: { data: ['餐饮', '交通', '购物'] },
  xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月'] },
  yAxis: { type: 'value' },
  series: [
    { name: '餐饮', type: 'line', data: [1200, 1100, 1500, 1000, 1048] },
    { name: '交通', type: 'line', data: [600, 580, 700, 550, 735] },
    { name: '购物', type: 'line', data: [800, 600, 1200, 500, 580] },
  ],
})

const insights = [
  {
    title: '餐饮支出偏高',
    type: 'warning' as const,
    description: '本月餐饮支出占总支出的 30%，建议适当减少外出就餐频率。',
  },
  {
    title: '储蓄率良好',
    type: 'success' as const,
    description: '本月储蓄率达到 71%，继续保持！',
  },
  {
    title: '建议优化',
    type: 'info' as const,
    description: '可将部分闲置资金投入低风险理财产品，提升资产增值效率。',
  },
]
</script>
