<template>
  <div class="bg-stone-100 rounded-md p-3 mb-10 flex justify-between content-center">
    <div class="flex justify-center content-center">
      Program Director View
    </div>
    <Listbox as="div" v-model="selectedTrainee">
    <div class="relative">
      <ListboxButton class="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm">
        <span class="block truncate">{{ selectedTrainee?.lastName + ', ' + selectedTrainee?.firstName }}</span>
        <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
        </span>
      </ListboxButton>

      <transition leave-active-class="transition ease-in duration-100" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <ListboxOptions class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          <ListboxOption as="template" v-for="t in trainees" :key="t.id" :value="t" v-slot="{ active, selected }">
            <li :class="[active ? 'text-white bg-indigo-600' : 'text-gray-900', 'relative cursor-default select-none py-2 pl-3 pr-9']">
              <span :class="[selected ? 'font-semibold' : 'font-normal', 'block truncate']">{{ t.lastName + ', ' + t.firstName }}</span>

              <span v-if="selected" :class="[active ? 'text-white' : 'text-indigo-600', 'absolute inset-y-0 right-0 flex items-center pr-4']">
                <CheckIcon class="h-5 w-5" aria-hidden="true" />
              </span>
            </li>
          </ListboxOption>
        </ListboxOptions>
      </transition>
    </div>
  </Listbox>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { Listbox, ListboxButton, ListboxLabel, ListboxOption, ListboxOptions } from '@headlessui/vue'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid'

import { apiRequest, type ApiResponse } from '../lib/api';
import type { TraineeController } from '@seedo/server/program/trainee.controller';

type response = ApiResponse<TraineeController['get']>

const trainees = ref<response>();
const selectedTrainee = ref<response[number]>()
const emit = defineEmits<{
  (e: 'changeTrainee', id: number): void
}>()

watch(selectedTrainee, (newTrainee, oldTrainee) => {
  if (newTrainee && (newTrainee !== oldTrainee)) {
    emit('changeTrainee', newTrainee.id)
  }
})

onMounted(async () =>{
  const traineesReq = await apiRequest<TraineeController['get']>({ endpoint: 'trainees' })
  trainees.value = traineesReq
  selectedTrainee.value = traineesReq[0]
})

</script>
