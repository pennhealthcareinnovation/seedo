<script setup lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import { PATH_METADATA } from '@nestjs/common/constants';

import MainLayout from '../layouts/MainLayout.vue'
import SideBar from '../components/SideBar.vue'
import ObservationTable from '../components/ObservationTable.vue'
import BarGraph from '../components/BarGraph.vue'
import { apiRequest, type ApiResponse } from '../lib/api'
import type { ObservableController } from '@seedo/server/observe/observable.controller'
import type { SideBarItem } from '../components/SideBar.vue'
import TraineeSelect from '../components/TraineeSelect.vue'
import { useUserStore } from '../stores/user';

const tasks = ref<ApiResponse<ObservableController['tasks']> | undefined>()
const navItems = ref<SideBarItem[] | undefined>([])
const curObservableType = ref<string | undefined>(undefined)
const curObservable = computed<any>(() => tasks.value?.find( task => curObservableType.value == task.observableDefinition.type )?.observableDefinition)
const observations = ref<ApiResponse<ObservableController['traineeReport']> | undefined>(undefined)
const { isAdmin } = useUserStore()
const traineeId = ref<number | undefined>(1)



onMounted(async () => {
  tasks.value = await apiRequest<ObservableController['tasks']>({ endpoint: 'observable/tasks', query: new URLSearchParams({ programId: '34' }) })
  navItems.value = tasks.value?.map(task => ({
    name: task.observableDefinition.displayName,
    id: task.observableDefinition.type,
  }))
  curObservableType.value = navItems.value?.[0].id
})

const loadReport = async (traineeId: number, type: string) => {
  observations.value = await apiRequest<ObservableController['traineeReport']>({ 
    endpoint: 'observable/observations',
    query: new URLSearchParams({
      traineeId: traineeId.toString(),
      type,
      startDate: '2021-01-01',
      endDate: '2022-12-31'
    })
  })
}

const changeObservable = (id: string) => {
  observations.value = undefined
  curObservableType.value = id
}

watch(curObservableType, (newObsType, oldObsType) => {
  if (newObsType == oldObsType || !newObsType || !traineeId.value) return
  loadReport(traineeId.value!, newObsType)
})

watch(traineeId, (newId, oldId) => {
  if (newId == oldId || !newId || !curObservableType.value) return
  loadReport(newId, curObservableType.value)
})
</script>

<script lang="ts">
  export default defineComponent({
    data() {
      return {
        chartData: {
          labels: [
            'COCATs Milestone',
            'Total',
            'Current Academic Year',
            'This Month'
          ],
          datasets: [{
            data: [700, 400, 150, 25],
            backgroundColor: [
              'rgba(209, 202, 190, 0.8)',
              'rgba(164, 151, 121, 0.8)',
              'rgba(147, 135, 162, 0.8)',
              'rgba(143, 178, 141, 0.8)',
            ]
          }]
        },
        chartOptions: {
          plugins: {
            legend: { display: false }
          }
        }
      }
    }
  })
</script>

<template>
  <MainLayout>
    <TraineeSelect v-if="isAdmin" @changeTrainee="(id: number) => traineeId = id" />
    <div class='grid grid-flow-col grid-cols-5'>
      <div class='col-span-1 pr-10'>
        <SideBar :items="navItems" :initalSelection="curObservableType" @goto="changeObservable" />
      </div>
      <div class='col-span-4'>
        <h2 class="text-2xl font-medium leading-7 text-gray-700 sm:truncate sm:text-3xl sm:tracking-tight pb-5">
          {{ curObservable?.displayName }}
        </h2>

        <BarGraph
          :chartData="chartData"
          :chartOptions="chartOptions"
          :height=80
        />
        
        <ObservationTable
          :observations="observations"
        />
      </div>
    </div>
  </MainLayout>
</template>