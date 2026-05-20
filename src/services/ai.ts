import { getApiConfig } from '@/utils/storage'
import type { BillSummary, ChatMessage } from './prompts'
import { buildAnalysisPrompt, buildChatSystemPrompt, buildChatUserPrompt } from './prompts'

const API_BASE = 'https://api.deepseek.com/v1/chat/completions'

export interface StreamChunk {
  done: boolean
  content: string
  error?: string
}

export async function* streamAnalysis(summary: BillSummary): AsyncGenerator<StreamChunk> {
  const config = getApiConfig()
  if (!config.apiKey) {
    yield { done: true, content: '', error: '请先配置 DeepSeek API Key' }
    return
  }

  const prompt = buildAnalysisPrompt(summary)

  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model || 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        stream: true,
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      const msg = err.error?.message || `请求失败 (${response.status})`
      yield { done: true, content: '', error: msg }
      return
    }

    const reader = response.body?.getReader()
    if (!reader) {
      yield { done: true, content: '', error: '无法读取响应流' }
      return
    }

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed === 'data: [DONE]') continue
        if (trimmed.startsWith('data: ')) {
          try {
            const json = JSON.parse(trimmed.slice(6))
            const delta = json.choices?.[0]?.delta?.content || ''
            if (delta) {
              yield { done: false, content: delta }
            }
          } catch {
            // ignore malformed json
          }
        }
      }
    }

    yield { done: true, content: '' }
  } catch (err: any) {
    yield {
      done: true,
      content: '',
      error: err.name === 'TypeError' ? '网络异常，请检查网络连接' : err.message || '请求失败',
    }
  }
}

export async function* streamChat(
  question: string,
  summary: BillSummary,
  history: ChatMessage[]
): AsyncGenerator<StreamChunk> {
  const config = getApiConfig()
  if (!config.apiKey) {
    yield { done: true, content: '', error: '请先配置 DeepSeek API Key' }
    return
  }

  const historyText = history
    .slice(-6)
    .map((m) => `${m.role === 'user' ? '用户' : '助手'}：${m.content}`)
    .join('\n')

  const userPrompt = buildChatUserPrompt(question, summary, historyText)

  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model || 'deepseek-chat',
        messages: [
          { role: 'system', content: buildChatSystemPrompt() },
          { role: 'user', content: userPrompt },
        ],
        stream: true,
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      const msg = err.error?.message || `请求失败 (${response.status})`
      yield { done: true, content: '', error: msg }
      return
    }

    const reader = response.body?.getReader()
    if (!reader) {
      yield { done: true, content: '', error: '无法读取响应流' }
      return
    }

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed === 'data: [DONE]') continue
        if (trimmed.startsWith('data: ')) {
          try {
            const json = JSON.parse(trimmed.slice(6))
            const delta = json.choices?.[0]?.delta?.content || ''
            if (delta) {
              yield { done: false, content: delta }
            }
          } catch {
            // ignore
          }
        }
      }
    }

    yield { done: true, content: '' }
  } catch (err: any) {
    yield {
      done: true,
      content: '',
      error: err.name === 'TypeError' ? '网络异常，请检查网络连接' : err.message || '请求失败',
    }
  }
}
