<template>
    <div className="container">
      <div className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow p-8">
        <button
          type="button"
          @click="login"
          className="inline-flex items-center rounded border border-transparent bg-indigo-600 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Login to App
        </button>
      </div>
    </div>
</template>

<script setup lang="ts">
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router';

const router = useRouter()

const login = () => {
  router.push('/callback')
}
</script>

<style>
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
  }
</style>