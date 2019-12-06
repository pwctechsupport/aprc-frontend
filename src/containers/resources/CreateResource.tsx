import React from 'react'

import ResourceForm, { ResourceFormValues } from './components/ResourceForm'
import { useCreateResourceMutation, CreateResourceInput } from '../../generated/graphql';
import { RouteComponentProps } from 'react-router';
import HeaderWithBackButton from '../../shared/components/HeaderWithBack';

const CreateResource = ({ history }: RouteComponentProps) => {
  const [createResource, createResourceM] = useCreateResourceMutation({
    refetchQueries: ['resources'],
    onCompleted: _ => history.push('/resources')
  })

  function handleSubmit(data: ResourceFormValues) {
    const input: CreateResourceInput = {
      category: data.category,
      name: data.name,
      resuploadBase64: data.resuploadBase64,
      resuploadFileName: data.resuploadFileName,
      policyIds: data.policyId ? [data.policyId] : [],
      controlIds: data.controlId ? [data.controlId] : [],
      businessProcessId: data.businessProcessId,
    }

    createResource({ variables: { input } })
  }

  return (
    <div>
      <HeaderWithBackButton heading="Create Resource" />
      <ResourceForm onSubmit={handleSubmit} submitting={createResourceM.loading} />
    </div>
  )
}

export default CreateResource