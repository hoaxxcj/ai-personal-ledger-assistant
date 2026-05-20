import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getTransactions,
  addTransaction as storageAdd,
  updateTransaction as storageUpdate,
  deleteTransaction as storageDelete,
} from '@/utils/storage'
import type { Transaction } from '@/utils/storage'

export type { Transaction }

export const useLedgerStore = defineStore('ledger', () => {
  const transactions = ref<Transaction[]>(getTransactions())

  const categories = [
    { id: '餐饮', name: '餐饮', icon: 'Food', type: 'expense' as const },
    { id: '交通', name: '交通', icon: 'Van', type: 'expense' as const },
    { id: '购物', name: '购物', icon: 'ShoppingBag', type: 'expense' as const },
    { id: '娱乐', name: '娱乐', icon: 'Film', type: 'expense' as const },
    { id: '居住', name: '居住', icon: 'House', type: 'expense' as const },
    { id: '医疗', name: '医疗', icon: 'FirstAidKit', type: 'expense' as const },
    { id: '其他', name: '其他', icon: 'More', type: 'expense' as const },
    { id: '工资', name: '工资', icon: 'Money', type: 'income' as const },
    { id: '奖金', name: '奖金', icon: 'Present', type: 'income' as const },
    { id: '理财', name: '理财', icon: 'TrendCharts', type: 'income' as const },
    { id: '其他收入', name: '其他收入', icon: 'More', type: 'income' as const },
  ]

  const incomeCategories = computed(() => categories.filter((c) => c.type === 'income'))
  const expenseCategories = computed(() => categories.filter((c) => c.type === 'expense'))

  function refresh() {
    transactions.value = getTransactions()
  }

  function add(record: Omit<Transaction, 'id'>) {
    storageAdd(record)
    refresh()
  }

  function update(id: string, data: Partial<Omit<Transaction, 'id'>>) {
    storageUpdate(id, data)
    refresh()
  }

  function remove(id: string) {
    storageDelete(id)
    refresh()
  }

  function getByMonth(month: string) {
    return transactions.value.filter((t) => t.date.startsWith(month))
  }

  function getByDateRange(start: string, end: string) {
    return transactions.value.filter((t) => t.date >= start && t.date <= end)
  }

  return {
    transactions,
    categories,
    incomeCategories,
    expenseCategories,
    refresh,
    add,
    update,
    remove,
    getByMonth,
    getByDateRange,
  }
})
