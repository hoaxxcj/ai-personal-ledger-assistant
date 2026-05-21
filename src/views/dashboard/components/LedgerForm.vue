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

    <el-form-item v-if="form.type === 'expense'" label="支出方式">
      <el-radio-group v-model="form.paymentMethod" size="default">
        <el-radio-button label="支付宝">支付宝</el-radio-button>
        <el-radio-button label="微信">微信</el-radio-button>
        <el-radio-button label="银行卡">银行卡</el-radio-button>
        <el-radio-button label="其它">其它</el-radio-button>
      </el-radio-group>
    </el-form-item>

    <el-form-item v-if="form.type === 'expense'" label="报销属性">
      <el-radio-group v-model="form.reimbursement" size="default">
        <el-radio-button label="personal">自用</el-radio-button>
        <el-radio-button label="reimbursable">非自用（待报销）</el-radio-button>
      </el-radio-group>
    </el-form-item>

    <el-form-item label="日期">
      <el-date-picker v-model="form.date" type="date" class="w-full" value-format="YYYY-MM-DD" />
    </el-form-item>

    <el-form-item label="备注">
      <el-input v-model="form.note" type="textarea" :rows="2" placeholder="添加备注..." />
    </el-form-item>

    <el-form-item>
      <div class="flex gap-2">
        <el-button class="flex-1" @click="handleCancel">取消</el-button>
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
  paymentMethod: '支付宝' as string,
  reimbursement: 'personal' as 'personal' | 'reimbursable',
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
      form.paymentMethod = val.paymentMethod || '支付宝'
      form.reimbursement = val.reimbursement || 'personal'
      form.date = val.date
      form.note = val.note
    } else {
      form.type = 'expense'
      form.amount = undefined
      form.category = ''
      form.paymentMethod = '支付宝'
      form.reimbursement = 'personal'
      form.date = dayjs().format('YYYY-MM-DD')
      form.note = ''
    }
  },
  { immediate: true }
)

function handleCancel() {
  ElMessage.info('已取消')
  emit('cancel')
}

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
    paymentMethod: form.type === 'expense' ? form.paymentMethod : undefined,
    reimbursement: form.type === 'expense' ? form.reimbursement : undefined,
    date: form.date,
    note: form.note,
  })
}
</script>
