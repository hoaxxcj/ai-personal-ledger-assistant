<template>
  <div class="space-y-4">
    <el-row :gutter="16">
      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>月度收支对比</template>
          <div class="h-80">
            <v-chart class="h-full" :option="barOption" autoresize />
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>分类趋势</template>
          <div class="h-80">
            <v-chart class="h-full" :option="lineOption" autoresize />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card>
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
</template>

<script setup lang="ts">
import { ref } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
} from 'echarts/components'

use([CanvasRenderer, BarChart, LineChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent])

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
