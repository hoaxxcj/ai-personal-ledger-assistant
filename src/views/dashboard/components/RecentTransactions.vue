<template>
  <el-table :data="transactions" style="width: 100%">
    <el-table-column prop="date" label="日期" width="120" />
    <el-table-column prop="category" label="分类" width="120">
      <template #default="{ row }">
        <el-tag size="small" :type="row.type === 'income' ? 'success' : 'danger'">
          {{ row.category }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column prop="note" label="备注" show-overflow-tooltip />
    <el-table-column prop="amount" label="金额" width="120" align="right">
      <template #default="{ row }">
        <span :class="row.type === 'income' ? 'text-success' : 'text-danger'">
          {{ row.type === 'income' ? '+' : '-' }}¥{{ row.amount.toFixed(2) }}
        </span>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
const transactions = [
  { date: '2026-05-19', category: '餐饮', type: 'expense', note: '午餐', amount: 35.0 },
  { date: '2026-05-18', category: '交通', type: 'expense', note: '地铁', amount: 6.0 },
  { date: '2026-05-18', category: '工资', type: 'income', note: '5月工资', amount: 12000.0 },
  { date: '2026-05-17', category: '购物', type: 'expense', note: '超市采购', amount: 128.5 },
  { date: '2026-05-16', category: '娱乐', type: 'expense', note: '电影票', amount: 45.0 },
]
</script>
