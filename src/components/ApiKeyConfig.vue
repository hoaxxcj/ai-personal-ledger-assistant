<template>
  <div>
    <el-alert
      v-if="!hasKey"
      type="warning"
      :closable="false"
      show-icon
      class="mb-4"
    >
      <template #title>
        <span>AI 功能需要配置 DeepSeek API Key</span>
        <el-button link type="primary" class="ml-2" @click="dialogVisible = true">
          立即配置
        </el-button>
      </template>
    </el-alert>

    <el-dialog v-model="dialogVisible" title="配置 DeepSeek API Key" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="API Key">
          <el-input
            v-model="form.apiKey"
            type="password"
            show-password
            placeholder="sk-..."
          />
        </el-form-item>
        <el-form-item label="模型">
          <el-select v-model="form.model" class="w-full">
            <el-option label="deepseek-chat" value="deepseek-chat" />
            <el-option label="deepseek-reasoner" value="deepseek-reasoner" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getApiConfig, saveApiConfig } from '@/utils/storage'

const dialogVisible = ref(false)
const form = ref({ apiKey: '', model: 'deepseek-chat' })

const hasKey = computed(() => !!form.value.apiKey)

onMounted(() => {
  const cfg = getApiConfig()
  form.value = { ...cfg }
})

function handleSave() {
  saveApiConfig(form.value)
  dialogVisible.value = false
  ElMessage.success('配置已保存')
}

defineExpose({ open: () => (dialogVisible.value = true) })
</script>
