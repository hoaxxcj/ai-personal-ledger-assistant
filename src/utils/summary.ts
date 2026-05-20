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

export function getMonthDailyData(month: string): { date: string; expense: number; income: number }[] {
  const daysInMonth = dayjs(month).daysInMonth()
  const result: { date: string; expense: number; income: number }[] = []
  for (let i = 1; i <= daysInMonth; i++) {
    const date = `${month}-${String(i).padStart(2, '0')}`
    const dayTrans = getTransactions().filter((t) => t.date === date)
    const expense = dayTrans.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const income = dayTrans.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    result.push({ date: String(i), expense, income })
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

export function getCategoryDetail(month?: string) {
  const targetMonth = month || dayjs().format('YYYY-MM')
  const expenseList = getTransactions().filter(
    (t) => t.date.startsWith(targetMonth) && t.type === 'expense'
  )
  const total = expenseList.reduce((s, t) => s + t.amount, 0)
  const map: Record<string, { amount: number; count: number }> = {}
  expenseList.forEach((t) => {
    if (!map[t.category]) map[t.category] = { amount: 0, count: 0 }
    map[t.category].amount += t.amount
    map[t.category].count += 1
  })
  return Object.entries(map)
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      count: data.count,
      percentage: total > 0 ? data.amount / total : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
}

export function getDayTransactions(date: string) {
  return getTransactions()
    .filter((t) => t.date === date)
    .sort((a, b) => b.id.localeCompare(a.id))
}

export function getDaySummary(date: string) {
  const list = getTransactions().filter((t) => t.date === date)
  const expense = list.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const income = list.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  return { expense, income }
}

export function getNetAssetTrend(month?: string) {
  const targetMonth = month || dayjs().format('YYYY-MM')
  const daysInMonth = dayjs(targetMonth).daysInMonth()
  let runningTotal = 0
  const result: { date: string; asset: number }[] = []
  for (let i = 1; i <= daysInMonth; i++) {
    const date = `${targetMonth}-${String(i).padStart(2, '0')}`
    const dayTrans = getTransactions().filter((t) => t.date === date)
    const dayNet = dayTrans.reduce((s, t) => s + (t.type === 'income' ? t.amount : -t.amount), 0)
    runningTotal += dayNet
    result.push({ date: String(i), asset: runningTotal })
  }
  return result
}
