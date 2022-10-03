<template>
  <nav class="space-y-1 bg-stone-100 rounded-md py-2" aria-label="Sidebar">
    <a v-for="item in items" :key="item.name" @click="$emit('goto', item.id); selected=item.id;" :class="[item.id == selected ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900', 'flex items-center px-3 py-2 text-sm font-medium cursor-pointer']" :aria-current="item.current ? 'page' : undefined">
      <span class="truncate">{{ item.name }}</span>
      <span v-if="item.count" :class="[item.current ? 'bg-gray-50' : 'bg-gray-200 text-gray-600', 'ml-auto inline-block py-0.5 px-3 text-xs rounded-full']">{{ item.count }}</span>
    </a>
  </nav>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

export interface SideBarItem {
  name: string
  id: string
  current?: boolean
  count?: number
  handler?: () => void
}

const selected = ref<SideBarItem['id'] | undefined>('')

const emits = defineEmits<{
  (e: 'goto', id: string): void
}>()

const props = defineProps<{
  items: SideBarItem[]
  initialSelection?: string
}>()

onMounted(() => {
  selected.value = props?.initialSelection
})
</script>