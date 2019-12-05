import React from 'react'

import ResourceForm, { ResourceFormValues } from './components/ResourceForm'
import { useCreateResourceMutation, CreateResourceInput } from '../../generated/graphql';
import { RouteComponentProps } from 'react-router';

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
      policyIds: []
    }

    createResource({ variables: { input } })
  }

  return (
    <div>
      <ResourceForm onSubmit={handleSubmit} submitting={createResourceM.loading} />
    </div>
  )
}

export default CreateResource