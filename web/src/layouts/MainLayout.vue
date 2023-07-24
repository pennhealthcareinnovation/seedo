<script setup lang="ts">
  import { defineComponent } from 'vue'
  import NavigationBar from '../components/NavigationBar.vue'
  import { routes } from '../router';

  const navigationBarLinks = routes.filter(i => ['summary', 'about'].includes(i.name.toLowerCase()))
</script>

<template>
  <NavigationBar :navigation="navigationBarLinks" />
    <div className='mx-auto max-w-7xl py-10'>

      <slot />
    </div>
</template>