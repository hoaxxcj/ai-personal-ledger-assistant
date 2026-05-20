<template>
  <el-container class="h-full">
    <!-- 左侧导航栏 -->
    <aside class="w-[72px] bg-white border-r border-gray-100 flex flex-col items-center py-4 shrink-0">
      <!-- 用户头像 -->
      <div class="mb-6">
        <el-avatar :size="40" :icon="UserFilled" class="bg-primary text-white" />
      </div>

      <!-- 导航菜单 -->
      <nav class="flex flex-col gap-2 w-full">
        <div
          v-for="item in menuItems"
          :key="item.path"
          :class="[
            'flex flex-col items-center py-3 px-2 rounded-lg mx-2 cursor-pointer transition-colors',
            isActive(item.path) ? 'text-primary bg-blue-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50',
          ]"
          @click="$router.push(item.path)"
        >
          <el-icon class="text-xl mb-1">
            <component :is="item.icon" />
          </el-icon>
          <span class="text-[10px]">{{ item.label }}</span>
        </div>
      </nav>
    </aside>

    <!-- 主内容区 -->
    <el-main class="bg-[#f5f7fa] p-0 overflow-hidden">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

const menuItems = [
  { path: '/', label: '账本', icon: 'Document' },
  { path: '/analysis', label: '分析', icon: 'TrendCharts' },
  { path: '/settings', label: '设置', icon: 'Setting' },
]

function isActive(path: string) {
  if (path === '/') return route.path === '/' || route.path === '/dashboard'
  return route.path.startsWith(path)
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
