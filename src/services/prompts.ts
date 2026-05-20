export interface BillSummary {
  month: string
  totalIncome: number
  totalExpense: number
  balance: number
  categoryBreakdown: { category: string; amount: number; percentage: number }[]
  dailyAverage: number
  maxSingle: { amount: number; category: string; note: string }
}

export function buildAnalysisPrompt(summary: BillSummary): string {
  return `你是一位细心又亲切的私人财务管家。
请根据以下用户${summary.month}消费摘要，用口语化、友好的语气给出分析：
1. 消费结构中的亮点或问题；
2. 与健康财务比例（餐饮20-30%，购物15-20%，娱乐5-10%）的对比；
3. 2-3条针对该用户的具体可行的省钱建议。
请控制在200字以内，不要使用Markdown。

消费摘要：
- 月份：${summary.month}
- 总收入：¥${summary.totalIncome.toFixed(2)}
- 总支出：¥${summary.totalExpense.toFixed(2)}
- 结余：¥${summary.balance.toFixed(2)}
- 日均支出：¥${summary.dailyAverage.toFixed(2)}
- 最大单笔：¥${summary.maxSingle.amount.toFixed(2)}（${summary.maxSingle.category}${summary.maxSingle.note ? ' - ' + summary.maxSingle.note : ''}）
- 分类占比：${summary.categoryBreakdown.map((c) => `${c.category} ${c.percentage}%`).join('，')}`
}

export function buildChatSystemPrompt(): string {
  return `你是用户的私人财务管家，可以基于提供的账单数据回答问题。
保持亲切、鼓励的语气，给出具体建议。如果问题超出财务范围，礼貌引导回正题。`
}

export function buildChatUserPrompt(question: string, summary: BillSummary, history: string): string {
  return `${history ? '历史对话：\n' + history + '\n\n' : ''}用户问题：${question}

当前${summary.month}账单摘要：
- 总收入：¥${summary.totalIncome.toFixed(2)}
- 总支出：¥${summary.totalExpense.toFixed(2)}
- 结余：¥${summary.balance.toFixed(2)}
- 分类占比：${summary.categoryBreakdown.map((c) => `${c.category} ${c.percentage}%`).join('，')}

请结合以上信息回答。`
}
