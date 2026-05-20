<template>
  <el-card shadow="hover" class="!rounded-xl">
    <div class="flex items-start gap-2">
      <div
        class="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0"
        :style="{ backgroundColor: dotColor }"
      />
      <div class="flex-1">
        <div class="text-xs text-gray-500 mb-1">{{ title }}</div>
        <div class="text-2xl font-bold text-gray-800 mb-2">
          ¥{{ Math.abs(amount).toFixed(2) }}
        </div>
        <div class="text-[10px] text-gray-400 leading-relaxed whitespace-pre-line">
          {{ subtitle }}
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  amount: number
  subtitle: string
  type: string
  dotColor: string
}>()
</script>
