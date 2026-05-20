<template>
  <div class="space-y-4">
    <el-card>
      <div class="flex flex-wrap items-center gap-4">
        <el-radio-group v-model="filter.type" size="small">
          <el-radio-button label="">全部</el-radio-button>
          <el-radio-button label="expense">支出</el-radio-button>
          <el-radio-button label="income">收入</el-radio-button>
        </el-radio-group>
        <el-date-picker
          v-model="filter.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          size="small"
        />
        <el-input
          v-model="filter.keyword"
          placeholder="搜索备注"
          size="small"
          clearable
          style="width: 200px"
        />
      </div>
    </el-card>

    <el-card>
      <el-table :data="filteredTransactions" v-loading="loading">
        <el-table-column prop="date" label="日期" width="120" sortable />
        <el-table-column prop="type" label="类型" width="80">
          <template #default="{ row }">
            <el-tag :type="row.type === 'income' ? 'success' : 'danger'" size="small">
              {{ row.type === 'income' ? '收入' : '支出' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="account" label="账户" width="120" />
        <el-table-column prop="note" label="备注" show-overflow-tooltip />
        <el-table-column prop="amount" label="金额" width="120" align="right" sortable>
          <template #default="{ row }">
            <span :class="row.type === 'income' ? 'text-success' : 'text-danger'">
              {{ row.type === 'income' ? '+' : '-' }}¥{{ settingsStore.formatAmount(row.amount) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center">
          <template #default="{ row }">
            <el-button link type="danger" size="small" @click="handleDelete(row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="flex justify-end mt-4">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="ledgerStore.transactions.length"
          layout="prev, pager, next"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLedgerStore } from '@/stores/ledger'
import { useSettingsStore } from '@/stores/settings'

const ledgerStore = useLedgerStore()
const settingsStore = useSettingsStore()
const loading = ref(false)
const page = ref(1)
const pageSize = ref(10)

const filter = ref({
  type: '',
  dateRange: [] as Date[],
  keyword: '',
})

const filteredTransactions = computed(() => {
  let list = ledgerStore.transactions
  if (filter.value.type) {
    list = list.filter((t) => t.type === filter.value.type)
  }
  if (filter.value.keyword) {
    const kw = filter.value.keyword.toLowerCase()
    list = list.filter((t) => t.note?.toLowerCase().includes(kw))
  }
  return list.slice((page.value - 1) * pageSize.value, page.value * pageSize.value)
})

const handleDelete = (id: string) => {
  ledgerStore.deleteTransaction(id)
}
</script>
