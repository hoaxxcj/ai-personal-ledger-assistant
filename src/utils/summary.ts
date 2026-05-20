import { getTransactions } from './storage'
import type { BillSummary } from '@/services/prompts'
import dayjs from 'dayjs'

export function buildBillSummary(month?: string): BillSummary {
  const targetMonth = month || dayjs().format('YYYY-MM')
  const list = getTransactions().filter((t) => t.date.startsWith(targetMonth))

  const incomeList = list.filter((t) => t.type === 'income')
  const expenseList = list.filter((t) => t.type === 'expense')

  const totalIncome = incomeList.reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = expenseList.reduce((sum, t) => sum + t.amount, 0)

  const categoryMap: Record<string, number> = {}
  expenseList.forEach((t) => {
    categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount
  })

  const categoryBreakdown = Object.entries(categoryMap)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount)

  const daysInMonth = dayjs(targetMonth).daysInMonth()
  const dailyAverage = totalExpense / daysInMonth

  const maxSingle = expenseList.length
    ? expenseList.reduce((max, t) => (t.amount > max.amount ? t : max), expenseList[0])
    : { amount: 0, category: '-', note: '' }

  return {
    month: targetMonth,
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    categoryBreakdown,
    dailyAverage,
    maxSingle: {
      amount: maxSingle.amount,
      category: maxSingle.category,
      note: maxSingle.note,
    },
  }
}

export function getLast7DaysExpense(): { date: string; amount: number }[] {
  const result: { date: string; amount: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD')
    const amount = getTransactions()
      .filter((t) => t.date === date && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    result.push({ date: dayjs(date).format('MM-DD'), amount })
  }
  return result
}

export function getCategoryPieData(month?: string) {
  const targetMonth = month || dayjs().format('YYYY-MM')
  const expenseList = getTransactions().filter(
    (t) => t.date.startsWith(targetMonth) && t.type === 'expense'
  )
  const map: Record<string, number> = {}
  expenseList.forEach((t) => {
    map[t.category] = (map[t.category] || 0) + t.amount
  })
  return Object.entries(map)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}
