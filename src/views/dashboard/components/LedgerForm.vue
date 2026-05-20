<template>
  <el-form :model="form" label-position="top">
    <el-form-item label="类型">
      <el-radio-group v-model="form.type" size="large">
        <el-radio-button label="expense">支出</el-radio-button>
        <el-radio-button label="income">收入</el-radio-button>
      </el-radio-group>
    </el-form-item>

    <el-form-item label="金额">
      <el-input-number
        v-model="form.amount"
        :min="0"
        :precision="2"
        :step="10"
        size="large"
        class="w-full"
        placeholder="请输入金额"
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
          {{ cat.name }}
        </el-check-tag>
      </div>
    </el-form-item>

    <el-form-item label="日期">
      <el-date-picker v-model="form.date" type="date" class="w-full" value-format="YYYY-MM-DD" />
    </el-form-item>

    <el-form-item label="备注">
      <el-input v-model="form.note" type="textarea" :rows="2" placeholder="添加备注..." />
    </el-form-item>

    <el-form-item>
      <div class="flex gap-2">
        <el-button class="flex-1" @click="$emit('cancel')">取消</el-button>
        <el-button type="primary" class="flex-1" @click="handleSubmit">保存</el-button>
      </div>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import { useLedgerStore } from '@/stores/ledger'

const props = defineProps<{
  initialData?: any
}>()

const emit = defineEmits<{
  submit: [data: any]
  cancel: []
}>()

const ledgerStore = useLedgerStore()

const form = reactive({
  type: 'expense' as 'income' | 'expense',
  amount: undefined as number | undefined,
  category: '',
  date: dayjs().format('YYYY-MM-DD'),
  note: '',
})

const filteredCategories = computed(() =>
  ledgerStore.categories.filter((c) => c.type === form.type)
)

watch(
  () => props.initialData,
  (val) => {
    if (val) {
      form.type = val.type
      form.amount = val.amount
      form.category = val.category
      form.date = val.date
      form.note = val.note
    } else {
      form.type = 'expense'
      form.amount = undefined
      form.category = ''
      form.date = dayjs().format('YYYY-MM-DD')
      form.note = ''
    }
  },
  { immediate: true }
)

function handleSubmit() {
  if (!form.amount || form.amount <= 0) {
    ElMessage.warning('请输入金额')
    return
  }
  if (!form.category) {
    ElMessage.warning('请选择分类')
    return
  }

  emit('submit', {
    type: form.type,
    amount: form.amount,
    category: form.category,
    date: form.date,
    note: form.note,
  })
}
</script>
