import { getTransactions, saveTransactions } from './storage'
import type { Transaction } from './storage'

const MOCK_VERSION_KEY = 'finance_mock_version'
const CURRENT_MOCK_VERSION = '2024-2026-v1'

const expenseCats = ['餐饮', '交通', '购物', '娱乐', '居住', '医疗', '其他']
const incomeCats = ['工资', '奖金', '理财', '其他收入']
const paymentMethods = ['支付宝', '微信', '银行卡', '其它']

function rnd(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function genId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function getDates(start: string, end: string): string[] {
  const res: string[] = []
  let cur = new Date(start + 'T00:00:00')
  const stop = new Date(end + 'T00:00:00')
  while (cur <= stop) {
    res.push(cur.toISOString().split('T')[0])
    cur.setDate(cur.getDate() + 1)
  }
  return res
}

export function initMockData() {
  const existingVersion = localStorage.getItem(MOCK_VERSION_KEY)
  if (existingVersion === CURRENT_MOCK_VERSION && getTransactions().length > 0) {
    return
  }

  // 清除旧数据并重新生成
  localStorage.removeItem('finance_records')

  const list: Omit<Transaction, 'id'>[] = []
  const dates = getDates('2024-01-01', '2026-05-21')

  dates.forEach((date) => {
    const day = Number(date.split('-')[2])
    const month = Number(date.split('-')[1])

    const isFirst = day === 1
    const isFifth = day === 5
    const isTenth = day === 10
    const isFifteenth = day === 15
    const isTwentyFifth = day === 25

    // ---- 固定收入 ----
    if (isFirst) {
      list.push({
        type: 'income',
        category: '工资',
        amount: rnd(12000, 15000),
        date,
        note: '月度工资',
        paymentMethod: '银行卡',
      })
    }
    if (isTenth || isTwentyFifth) {
      list.push({
        type: 'income',
        category: '理财',
        amount: rnd(50, 500),
        date,
        note: '理财收益',
        paymentMethod: '银行卡',
      })
    }

    // 季度奖金（每季度首月15号）
    if (isFifteenth && [1, 4, 7, 10].includes(month)) {
      list.push({
        type: 'income',
        category: '奖金',
        amount: rnd(2000, 5000),
        date,
        note: pick(['季度奖金', '项目奖金', '绩效奖金']),
        paymentMethod: '银行卡',
      })
    }

    // ---- 固定支出 ----
    if (isFirst) {
      list.push({
        type: 'expense',
        category: '居住',
        amount: 2500,
        date,
        note: '房租',
        paymentMethod: pick(['支付宝', '微信', '银行卡']),
      })
    }
    if (isFifth) {
      list.push({
        type: 'expense',
        category: '其他',
        amount: rnd(50, 100),
        date,
        note: '手机话费',
        paymentMethod: pick(['支付宝', '微信']),
      })
    }
    if (isFifteenth) {
      list.push({
        type: 'expense',
        category: '居住',
        amount: rnd(80, 200),
        date,
        note: '水电费',
        paymentMethod: pick(['支付宝', '微信']),
      })
    }

    // ---- 随机账单 ----
    const hasFixed =
      isFirst || isFifth || isTenth || isFifteenth || isTwentyFifth
    const maxRandom = hasFixed ? 6 : 8
    const count = rnd(0, maxRandom)

    for (let i = 0; i < count; i++) {
      const isExpense = Math.random() < 0.88
      if (isExpense) {
        const cat = pick(expenseCats.filter((c) => c !== '居住'))
        let amount = 0
        let note = ''

        if (cat === '餐饮') {
          const r = Math.random()
          if (r < 0.25) { amount = rnd(5, 15); note = '早餐' }
          else if (r < 0.5) { amount = rnd(15, 35); note = '午餐' }
          else if (r < 0.75) { amount = rnd(20, 50); note = '晚餐' }
          else { amount = rnd(10, 30); note = pick(['奶茶', '咖啡', '夜宵', '零食']) }
        } else if (cat === '交通') {
          if (Math.random() < 0.75) { amount = rnd(2, 8); note = pick(['地铁', '公交']) }
          else { amount = rnd(15, 60); note = '打车' }
        } else if (cat === '购物') {
          if (Math.random() < 0.6) { amount = rnd(30, 150); note = pick(['日用品', '超市采购', '水果', '零食囤货']) }
          else { amount = rnd(200, 800); note = pick(['衣服', '鞋子', '包包', '化妆品', '数码配件']) }
        } else if (cat === '娱乐') {
          const r = Math.random()
          if (r < 0.3) { amount = rnd(40, 80); note = '电影票' }
          else if (r < 0.6) { amount = rnd(80, 200); note = '聚餐' }
          else if (r < 0.8) { amount = rnd(50, 150); note = pick(['KTV', '桌游', '剧本杀']) }
          else { amount = rnd(30, 98); note = '游戏充值' }
        } else if (cat === '医疗') {
          amount = rnd(20, 200)
          note = pick(['感冒药', '口罩', '体检', '买药', '维生素'])
        } else if (cat === '其他') {
          amount = rnd(5, 50)
          note = pick(['快递费', '打印', '捐赠', '会员充值', '停车费'])
        }

        list.push({
          type: 'expense',
          category: cat,
          amount,
          date,
          note,
          paymentMethod: pick(paymentMethods),
          reimbursement: Math.random() < 0.05 ? 'reimbursable' : 'personal',
        })
      } else {
        const cat = pick(['理财', '其他收入'])
        list.push({
          type: 'income',
          category: cat,
          amount: rnd(10, 300),
          date,
          note: cat === '理财' ? '理财收益' : pick(['红包', '退款', '二手转卖', '兼职']),
          paymentMethod: pick(paymentMethods),
        })
      }
    }
  })

  list.sort((a, b) => b.date.localeCompare(a.date) || Math.random() - 0.5)

  const withId: Transaction[] = list.map((t) => ({ ...t, id: genId() }))
  saveTransactions(withId)
  localStorage.setItem(MOCK_VERSION_KEY, CURRENT_MOCK_VERSION)
}
