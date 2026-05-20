import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const SETTINGS_KEY = 'finance_settings'

export interface Settings {
  defaultMonth: 'current' | 'last'
  thousandSeparator: boolean
  autoCloseLedger: boolean
}

const defaultSettings: Settings = {
  defaultMonth: 'current',
  thousandSeparator: true,
  autoCloseLedger: true,
}

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) return { ...defaultSettings, ...JSON.parse(raw) }
  } catch {
    // ignore
  }
  return { ...defaultSettings }
}

function saveSettings(s: Settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s))
}

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<Settings>(loadSettings())

  const defaultMonth = computed(() => settings.value.defaultMonth)
  const thousandSeparator = computed(() => settings.value.thousandSeparator)
  const autoCloseLedger = computed(() => settings.value.autoCloseLedger)

  function update(partial: Partial<Settings>) {
    settings.value = { ...settings.value, ...partial }
    saveSettings(settings.value)
  }

  function formatAmount(value: number): string {
    const n = Math.abs(value).toFixed(2)
    if (settings.value.thousandSeparator) {
      const parts = n.split('.')
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      return parts.join('.')
    }
    return n
  }

  return {
    settings,
    defaultMonth,
    thousandSeparator,
    autoCloseLedger,
    update,
    formatAmount,
  }
})
