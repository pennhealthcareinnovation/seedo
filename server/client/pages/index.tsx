import React, { Suspense } from 'react'
import { NextPage } from 'next'
import getConfig from 'next/config'
import { Container, Icon, Table } from 'semantic-ui-react'
import { format } from 'date-fns'
import { Chart as ChartJS } from 'chart.js'
import { Bar } from 'react-chartjs-2'

import { ObservableController, TraineeReport } from '../../src/observe/observable.controller'
import { capitalize } from 'lodash'

interface Props {
  traineeReport: TraineeReport
}
const Summary: NextPage = ({ traineeReport }: Props) => {
  // ChartJS.register()
  return <>
    <h1>Procedure Summary</h1>

    Welcome {traineeReport?.trainee?.firstName}, it looks like you've been busy.

    {traineeReport?.items?.map((item, itemIndex) => <Container key={itemIndex} style={{ marginBottom: 30 }}>
      <h2>{item.observableDefinition.displayName}</h2>

      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Patient Name</Table.HeaderCell>
            <Table.HeaderCell>Patient ID</Table.HeaderCell>
            <Table.HeaderCell>{capitalize(item.observableDefinition.ehrObservationIdType)}</Table.HeaderCell>
            <Table.HeaderCell>Observation Date</Table.HeaderCell>
            <Table.HeaderCell>Synced to MedHub</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {item.observations.map((observation, observationIndex) => <Table.Row key={observationIndex}>
            <Table.Cell>{observation.patientName}</Table.Cell>
            <Table.Cell>{observation.patientId}</Table.Cell>
            <Table.Cell>{observation.ehrObservationId}</Table.Cell>
            <Table.Cell><Suspense>{format(new Date(observation.observationDate), 'M/dd/yyyy')}</Suspense></Table.Cell>
            <Table.Cell>{observation.syncedAt != null ? <Suspense>
                {/* @ts-ignore */}
                <Icon name='check circle' style={{ color: 'green'}} />{format(new Date(observation.syncedAt), 'M/dd/yyyy')}
              </Suspense> : <></>}
            </Table.Cell>
          </Table.Row>)}
        </Table.Body>
      </Table>
    </Container>)}
  </>
}
 
export default Summary

export async function getServerSideProps(context) {
  const { serverRuntimeConfig } = getConfig()
  
  const observableController = serverRuntimeConfig.observableController as ObservableController
  let traineeReport = await observableController.traineeReport(2)
  /** get around serialization errors: https://github.com/vercel/next.js/issues/11993 */
  traineeReport = JSON.parse(JSON.stringify(traineeReport))
  
  return { 
    props: { traineeReport }
  }
}