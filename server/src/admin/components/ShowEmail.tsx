import React from 'react'
import { Section, Label } from '@adminjs/design-system'
import { format } from 'date-fns'

import { sentEmails } from '@prisma/client'

const ShowEmail = (props: any) => {
  const params = props?.record?.params as sentEmails
  console.debug(params)

  return <>
    <Section>
      <Label>Sent: </Label> { format( new Date(params.createdAt), 'MMM d, yyyy HH:mm') }
      <Label>To: </Label> { params.to }
      <Label>Subject: </Label> { params.subject }
    </Section>
    <div 
      style={{ backgroundColor: 'white'}}
      dangerouslySetInnerHTML={{ __html: params?.['email.html'] }}
    />
  </>
}

export default ShowEmail