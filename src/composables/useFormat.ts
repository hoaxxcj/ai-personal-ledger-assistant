export function useFormat() {
  const currency = (value: number, prefix = '¥') =>
    `${prefix}${value.toFixed(2)}`

  const percent = (value: number, digits = 2) =>
    `${(value * 100).toFixed(digits)}%`

  const compactNumber = (value: number) =>
    new Intl.NumberFormat('zh-CN', { notation: 'compact' }).format(value)

  return { currency, percent, compactNumber }
}
