<template>
  <div class="max-w-2xl mx-auto">
    <el-card>
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-bold">记一笔</span>
          <el-radio-group v-model="form.type" size="small">
            <el-radio-button label="expense">支出</el-radio-button>
            <el-radio-button label="income">收入</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <el-form :model="form" label-position="top">
        <el-form-item label="金额">
          <el-input-number
            v-model="form.amount"
            :min="0"
            :precision="2"
            :step="10"
            size="large"
            class="w-full"
          />
        </el-form-item>

        <el-form-item label="分类">
          <div class="flex flex-wrap gap-2">
            <el-check-tag
              v-for="cat in filteredCategories"
              :key="cat.id"
              :checked="form.category === cat.id"
              @change="form.category = cat.id"
              class="px-3 py-1"
            >
              <el-icon class="mr-1"><component :is="cat.icon" /></el-icon>
              {{ cat.name }}
            </el-check-tag>
          </div>
        </el-form-item>

        <el-form-item label="账户">
          <el-select v-model="form.account" placeholder="选择账户" class="w-full">
            <el-option
              v-for="acc in ledgerStore.accounts"
              :key="acc.id"
              :label="acc.name"
              :value="acc.id"
            >
              <el-icon class="mr-1"><component :is="acc.icon" /></el-icon>
              {{ acc.name }}
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="日期">
          <el-date-picker v-model="form.date" type="date" class="w-full" />
        </el-form-item>

        <el-form-item label="备注">
          <el-input v-model="form.note" type="textarea" :rows="2" placeholder="添加备注..." />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" class="w-full" size="large" @click="handleSubmit">
            保存
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useLedgerStore } from '@/stores/ledger'
import dayjs from 'dayjs'

const ledgerStore = useLedgerStore()

const form = reactive({
  type: 'expense' as 'income' | 'expense',
  amount: 0,
  category: '',
  account: 'alipay',
  date: new Date(),
  note: '',
})

const filteredCategories = computed(() =>
  ledgerStore.categories.filter((c) => c.type === form.type)
)

const handleSubmit = () => {
  if (!form.amount || form.amount <= 0) {
    ElMessage.warning('请输入金额')
    return
  }
  if (!form.category) {
    ElMessage.warning('请选择分类')
    return
  }

  ledgerStore.addTransaction({
    type: form.type,
    amount: form.amount,
    category: form.category,
    account: form.account,
    date: dayjs(form.date).format('YYYY-MM-DD'),
    note: form.note,
  })

  ElMessage.success('记账成功')
  form.amount = 0
  form.note = ''
}
</script>
