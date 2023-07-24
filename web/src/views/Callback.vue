<template>
    Redirecting...
</template>

<script setup lang="ts">
import { defineComponent, onMounted } from 'vue'
import { useRouter } from 'vue-router';

import { apiRequest } from '../lib/api';
import { useUserStore } from '../stores/user';
import type { UserController } from '@seedo/server/user/user.controller';

const { setUser } = useUserStore()
const router = useRouter()

onMounted(async () => {
  const validToken = true

  if (validToken) {
    const user = await apiRequest<UserController['getUser']>({ endpoint: 'user' })
    if (user) {
      setUser(user)
      router.push('/')
    }
  }
})
</script>
