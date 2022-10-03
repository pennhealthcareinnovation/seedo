<template>
<div v-if="!observations" class="mt-8 flex flex-col">
    <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
        <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table class="min-w-full divide-y divide-gray-300">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">&nbsp;</th>
              </tr>
            </thead>
            <tbody class="bg-white">
              <tr class="h-60 fl">
                <td class="whitespace-nowrap text-l font-medium text-gray-500 sm:pl-6 flex flex-row justify-center py-10">
                  <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading..
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="mt-8 flex flex-col">
    <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
        <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table class="min-w-full divide-y divide-gray-300">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Patient Name</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Patient ID</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{{ capitalize(observations?.[0]?.ehrObservationIdType) ?? 'Observation ID' }}</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Observation Date</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Sync Status</th>
              </tr>
            </thead>
            <tbody class="bg-white">
              <tr v-for="(obs, obsIdx) in observations" :key="obs.ehrObservationId" :class="obsIdx % 2 === 0 ? undefined : 'bg-gray-50'">
                <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{{ obs.patientName }}</td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ obs.patientId }}</td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ obs.ehrObservationId }}</td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ format(new Date(obs.observationDate), 'MM/dd/yyyy') }}</td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <div v-if="obs.syncedAt" class="flex flex-row items-center">
                    <CheckCircleIcon class="h-6 w-6 pr-1 text-emerald-600" />
                    {{ format(new Date(obs.syncedAt), 'MM/dd/yyyy') }}
                  </div>
                  <template v-else>-</template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { format } from 'date-fns'
import { CheckCircleIcon } from '@heroicons/vue/24/solid'
import { capitalize } from 'lodash'

import type { ApiResponse } from '../lib/api'
import type { ObservableController } from '@seedo/server/src/observe/observable.controller'

const props = defineProps<{
  observations: ApiResponse<ObservableController['traineeReport']>
}>()


</script>