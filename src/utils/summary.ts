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

// ===== 报销相关 =====

export function getReimbursementSummary(month?: string) {
  const targetMonth = month || dayjs().format('YYYY-MM')
  const list = getTransactions().filter(
    (t) => t.date.startsWith(targetMonth) && t.type === 'expense'
  )
  const reimbursable = list
    .filter((t) => t.reimbursement === 'reimbursable')
    .reduce((s, t) => s + t.amount, 0)
  const reimbursed = list
    .filter((t) => t.reimbursement === 'reimbursed')
    .reduce((s, t) => s + t.amount, 0)
  return { reimbursable, reimbursed }
}

export function getReimbursableList(month?: string) {
  const targetMonth = month || dayjs().format('YYYY-MM')
  return getTransactions()
    .filter(
      (t) =>
        t.date.startsWith(targetMonth) &&
        t.type === 'expense' &&
        t.reimbursement === 'reimbursable'
    )
    .sort((a, b) => b.date.localeCompare(a.date))
}

// ===== 同环比分析 =====

export interface CompareResult {
  current: number
  compare: number
  diff: number
  diffPercent: number
}

function calcCompare(current: number, compare: number): CompareResult {
  const diff = current - compare
  return {
    current,
    compare,
    diff,
    diffPercent: compare !== 0 ? diff / compare : 0,
  }
}

export function getMonthCompare(month?: string) {
  const targetMonth = month || dayjs().format('YYYY-MM')
  const current = buildBillSummary(targetMonth)

  // 环比：上月
  const prevMonthStr = dayjs(targetMonth + '-01').subtract(1, 'month').format('YYYY-MM')
  const prev = buildBillSummary(prevMonthStr)

  // 同比：去年同期
  const yoyMonthStr = dayjs(targetMonth + '-01').subtract(1, 'year').format('YYYY-MM')
  const yoy = buildBillSummary(yoyMonthStr)

  return {
    income: {
      mom: calcCompare(current.totalIncome, prev.totalIncome),
      yoy: calcCompare(current.totalIncome, yoy.totalIncome),
    },
    expense: {
      mom: calcCompare(current.totalExpense, prev.totalExpense),
      yoy: calcCompare(current.totalExpense, yoy.totalExpense),
    },
    balance: {
      mom: calcCompare(current.balance, prev.balance),
      yoy: calcCompare(current.balance, yoy.balance),
    },
  }
}

export function getCategoryCompare(month?: string) {
  const targetMonth = month || dayjs().format('YYYY-MM')
  const currentDetail = getCategoryDetail(targetMonth)
  const prevMonthStr = dayjs(targetMonth + '-01').subtract(1, 'month').format('YYYY-MM')
  const prevDetail = getCategoryDetail(prevMonthStr)

  return currentDetail.map((c) => {
    const prev = prevDetail.find((p) => p.category === c.category)
    return {
      category: c.category,
      currentAmount: c.amount,
      currentPercent: c.percentage,
      prevAmount: prev?.amount || 0,
      prevPercent: prev?.percentage || 0,
      diff: prev ? c.amount - prev.amount : c.amount,
      diffPercent: prev && prev.amount > 0 ? (c.amount - prev.amount) / prev.amount : 0,
    }
  })
}
