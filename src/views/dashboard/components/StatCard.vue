<template>
  <el-card shadow="hover" class="stat-card">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm text-gray-500 mb-1">{{ title }}</p>
        <p class="text-2xl font-bold" :class="amountClass">
          {{ formattedAmount }}
        </p>
      </div>
      <div
        class="w-12 h-12 rounded-full flex items-center justify-center"
        :class="iconBgClass"
      >
        <el-icon class="text-xl" :class="iconClass">
          <component :is="icon" />
        </el-icon>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  title: string
  amount: number
  type: 'income' | 'expense' | 'balance' | 'budget'
  icon: string
}>()

const formattedAmount = computed(() => {
  const sign = props.type === 'expense' ? '-' : ''
  return `${sign}¥${props.amount.toFixed(2)}`
})

const amountClass = computed(() => {
  const map: Record<string, string> = {
    income: 'text-success',
    expense: 'text-danger',
    balance: 'text-primary',
    budget: 'text-warning',
  }
  return map[props.type]
})

const iconBgClass = computed(() => {
  const map: Record<string, string> = {
    income: 'bg-green-50',
    expense: 'bg-red-50',
    balance: 'bg-blue-50',
    budget: 'bg-yellow-50',
  }
  return map[props.type]
})

const iconClass = computed(() => {
  const map: Record<string, string> = {
    income: 'text-success',
    expense: 'text-danger',
    balance: 'text-primary',
    budget: 'text-warning',
  }
  return map[props.type]
})
</script>
