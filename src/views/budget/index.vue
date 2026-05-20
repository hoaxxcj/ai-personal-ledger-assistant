<template>
  <div class="space-y-4">
    <el-card>
      <template #header>
        <div class="flex items-center justify-between">
          <span>预算概览</span>
          <el-button type="primary" size="small" :icon="Plus" @click="dialogVisible = true">
            新增预算
          </el-button>
        </div>
      </template>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <el-card v-for="item in budgets" :key="item.id" shadow="hover">
          <div class="flex items-center justify-between mb-2">
            <span class="font-medium">{{ item.category }}</span>
            <span class="text-sm text-gray-500">
              ¥{{ settingsStore.formatAmount(item.spent) }} / ¥{{ settingsStore.formatAmount(item.total) }}
            </span>
          </div>
          <el-progress
            :percentage="Math.round((item.spent / item.total) * 100)"
            :status="item.spent > item.total ? 'exception' : undefined"
            :stroke-width="10"
          />
          <div class="mt-2 text-xs text-gray-400 flex justify-between">
            <span>剩余 ¥{{ settingsStore.formatAmount(item.total - item.spent) }}</span>
            <span>{{ item.period }}</span>
          </div>
        </el-card>
      </div>
    </el-card>

    <!-- 新增预算弹窗 -->
    <el-dialog v-model="dialogVisible" title="新增预算" width="500px">
      <el-form :model="budgetForm" label-width="80px">
        <el-form-item label="分类">
          <el-select v-model="budgetForm.category" class="w-full">
            <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="金额">
          <el-input-number v-model="budgetForm.total" :min="0" class="w-full" />
        </el-form-item>
        <el-form-item label="周期">
          <el-radio-group v-model="budgetForm.period">
            <el-radio-button label="monthly">月度</el-radio-button>
            <el-radio-button label="yearly">年度</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAddBudget">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()

interface Budget {
  id: string
  category: string
  total: number
  spent: number
  period: string
}

const budgets = ref<Budget[]>([
  { id: '1', category: '餐饮', total: 2000, spent: 1048, period: '月度' },
  { id: '2', category: '交通', total: 800, spent: 735, period: '月度' },
  { id: '3', category: '购物', total: 1500, spent: 580, period: '月度' },
  { id: '4', category: '娱乐', total: 500, spent: 484, period: '月度' },
])

const categories = [
  { id: 'food', name: '餐饮' },
  { id: 'transport', name: '交通' },
  { id: 'shopping', name: '购物' },
  { id: 'entertainment', name: '娱乐' },
  { id: 'housing', name: '居住' },
]

const dialogVisible = ref(false)
const budgetForm = reactive({
  category: '',
  total: 0,
  period: 'monthly',
})

const handleAddBudget = () => {
  budgets.value.push({
    id: Date.now().toString(),
    category: budgetForm.category,
    total: budgetForm.total,
    spent: 0,
    period: budgetForm.period === 'monthly' ? '月度' : '年度',
  })
  dialogVisible.value = false
}
</script>
