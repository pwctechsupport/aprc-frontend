import React, { useEffect, useState } from 'react';
import useForm from 'react-hook-form';
import { Form } from 'reactstrap';
import { oc } from 'ts-optchain';
import * as yup from 'yup';
import { Category, useResourceFormMasterQuery } from '../../../generated/graphql';
import Button from '../../../shared/components/Button';
import Input from '../../../shared/components/forms/Input';
import Select from '../../../shared/components/forms/Select';
import { toBase64, toLabelValue } from '../../../shared/formatter';


const ResourceForm = ({ onSubmit, submitting }: ResourceFormProps) => {
  const { register, setValue, handleSubmit, errors } = useForm<ResourceFormValues>({ validationSchema })

  const { data } = useResourceFormMasterQuery()
  const masters = {
    policyCategories: Object.entries(Category).map(p => ({ label: p[0], value: p[1] })),
    policies: oc(data).policies.collection([]).map(p => ({ ...p, value: String(p.id), label: String(p.title) })),
    controls: oc(data).controls.collection([]).map(p => ({ ...p, value: String(p.id), label: String(p.typeOfControl) })),
    businessProcesses: oc(data).businessProcesses.collection([]).map(toLabelValue),
  }

  useEffect(() => {
    register({ name: 'category', required: true })
    register({ name: 'policyId', required: true })
    register({ name: 'controlId', required: true })
    register({ name: 'businessProcessId', required: true })
    register({ name: 'resuploadBase64', type: 'custom' })
    register({ name: 'resuploadFileName' })
  }, [])

  function handleChangeSelect(name: string) {
    return function (e: any) {
      if (e) setValue(name, e.value)
    }
  }

  async function handleChangeFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setValue('resuploadFileName', e.target.files[0].name)
      setValue('resuploadBase64', String(await toBase64(e.target.files[0])), true)
    }
  }

  function submit(data: ResourceFormValues) {
    onSubmit && onSubmit(data)
  }

  return (
    <Form onSubmit={handleSubmit(submit)}>
      <Input
        name="name"
        label="Name"
        innerRef={register({ required: true })}
        error={errors.name && errors.name.message}
      />
      <Select
        name="category"
        label="Category"
        options={masters.policyCategories}
        onChange={handleChangeSelect('category')}
        error={oc(errors).category.message()}
      />
      <Select
        name="policyId"
        label="Related Policy"
        options={masters.policies}
        onChange={handleChangeSelect('policyId')}
        error={oc(errors).policyId.message()}
      />
      <Select
        name="controlId"
        label="Related Control"
        options={masters.controls}
        onChange={handleChangeSelect('controlId')}
        error={oc(errors).controlId.message()}
      />
      <Select
        name="businessProcessId"
        label="Related sub-business Process"
        options={masters.businessProcesses}
        onChange={handleChangeSelect('businessProcessId')}
        error={oc(errors).businessProcessId.message()}
      />
      <Input
        type="file"
        label="Upload"
        onChange={handleChangeFile}
      />

      <div className="d-flex justify-content-end mt-3">
        <Button
          type="submit"
          color="primary"
          className="pwc px-5"
          loading={submitting}
        >
          Simpan
        </Button>
      </div>
    </Form>
  )
}

export default ResourceForm

const validationSchema = yup.object().shape({
  name: yup.string().required(),
  category: yup.string().oneOf(Object.values(Category)).required()
})

interface ResourceFormProps {
  onSubmit?: (data: ResourceFormValues) => void
  submitting?: boolean
}

export interface ResourceFormValues {
  name: string
  category: Category
  policyId: string
  controlId: string
  businessProcessId: string
  resuploadBase64: any
  resuploadFileName: string
}