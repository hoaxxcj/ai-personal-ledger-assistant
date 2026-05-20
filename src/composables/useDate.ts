import { computed } from 'vue'
import dayjs from 'dayjs'

export function useDate() {
  const today = computed(() => dayjs().format('YYYY-MM-DD'))
  const currentMonth = computed(() => dayjs().format('YYYY-MM'))
  const monthStart = computed(() => dayjs().startOf('month').format('YYYY-MM-DD'))
  const monthEnd = computed(() => dayjs().endOf('month').format('YYYY-MM-DD'))

  const formatDate = (date: string | Date, template = 'YYYY-MM-DD') =>
    dayjs(date).format(template)

  return { today, currentMonth, monthStart, monthEnd, formatDate }
}
