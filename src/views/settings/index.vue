<template>
  <div class="max-w-3xl mx-auto">
    <el-tabs type="border-card">
      <el-tab-pane label="个人资料">
        <el-form :model="profileForm" label-width="100px" class="mt-4">
          <el-form-item label="头像">
            <el-avatar :size="80" :src="profileForm.avatar" />
          </el-form-item>
          <el-form-item label="昵称">
            <el-input v-model="profileForm.nickname" />
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="profileForm.email" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary">保存</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="分类管理">
        <el-table :data="ledgerStore.categories" class="mt-4">
          <el-table-column prop="name" label="名称" />
          <el-table-column prop="type" label="类型">
            <template #default="{ row }">
              <el-tag :type="row.type === 'income' ? 'success' : 'danger'">
                {{ row.type === 'income' ? '收入' : '支出' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="editCategory(row)">编辑</el-button>
              <el-button link type="danger" size="small">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="账户管理">
        <el-table :data="ledgerStore.accounts" class="mt-4">
          <el-table-column prop="name" label="名称" />
          <el-table-column label="操作" width="120">
            <template #default>
              <el-button link type="danger" size="small">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="数据管理">
        <div class="space-y-4 mt-4">
          <el-card shadow="never">
            <template #header>导出数据</template>
            <p class="text-sm text-gray-500 mb-4">将你的记账数据导出为 Excel 或 CSV 格式。&lt;/p&gt;
            <el-button type="primary" :icon="Download">导出 Excel</el-button>
            <el-button :icon="Document">导出 CSV</el-button>
          </el-card>
          <el-card shadow="never">
            <template #header>数据清除</template>
            <p class="text-sm text-gray-500 mb-4">此操作将清空所有记账数据，请谨慎操作。&lt;/p&gt;
            <el-button type="danger" :icon="Delete">清除所有数据</el-button>
          </el-card>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { Download, Document, Delete } from '@element-plus/icons-vue'
import { useLedgerStore } from '@/stores/ledger'

const ledgerStore = useLedgerStore()

const profileForm = reactive({
  avatar: '',
  nickname: '记账达人',
  email: 'user@example.com',
})

const editCategory = (_row: any) => {
  // TODO: implement category edit
}
</script>
