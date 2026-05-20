<template>
  <el-container class="h-full">
    <el-header class="flex items-center justify-between bg-white shadow-sm z-10 px-6">
      <div class="flex items-center gap-2">
        <el-icon class="text-xl text-primary"><Wallet /></el-icon>
        <span class="text-lg font-bold">AI 记账助手</span>
      </div>
      <div class="text-xs text-gray-400">
        数据仅存本地，AI 仅接收匿名摘要
      </div>
    </el-header>

    <el-main class="bg-[#f5f7fa] p-4">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
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
