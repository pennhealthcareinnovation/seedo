import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { user } from '@prisma/client'


export const useUserStore = defineStore('user', () => {
  const user = ref<user | undefined>(undefined)

  const setUser = (newUser: user) => user.value = newUser

  const isAdmin = computed(() => user.value?.isAdmin)

  const isLoggedIn = computed(() => user.value !== undefined)

  return { user, setUser, isAdmin, isLoggedIn }
})
