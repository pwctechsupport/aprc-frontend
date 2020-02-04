import React from 'react'
import useForm from 'react-hook-form'
import { RouteComponentProps } from 'react-router-dom'
import { toast } from 'react-toastify'
import * as yup from 'yup'
import { get } from 'lodash'
import pwcLogo from '../../assets/images/pwc-logo.png'
import { useUpdatePasswordMutation } from '../../generated/graphql'
import Button from '../../shared/components/Button'
import { Container, Form, H1, Image, Input, Label } from './Login'
import { FieldError } from 'react-hook-form/dist/types'

const required = 'Wajib diisi'
const validationSchema = yup.object().shape({
  password: yup.string().required(),
  passwordConfirmation: yup
    .string()
    .trim()
    .required(required)
    .oneOf([yup.ref('password')], 'Password tidak sama'),
})

const ResetPassword = ({ history, location }: RouteComponentProps) => {
  const searhParams = new URLSearchParams(location.search)
  const token = searhParams.get('reset_password_token')

  const { register, handleSubmit, errors } = useForm({ validationSchema })
  const [updatePassword, { loading }] = useUpdatePasswordMutation({
    onCompleted,
    onError,
  })

  const onSubmit = (data: any) => {
    updatePassword({
      variables: {
        input: {
          password: data.password,
          passwordConfirmation: data.passwordConfirmation,
          resetPasswordToken: token,
        },
      },
    })
  }

  function onCompleted() {
    toast.success('Password berhasil diubah')
    history.push('/auth')
  }

  function onError() {
    toast.error(
      <div>
        <h5>Error!</h5>
        <div>Mohon coba lagi</div>
      </div>
    )
  }

  console.log({ errors })

  return (
    <Container>
      <Image src={pwcLogo} alt="pwc-logo" />
      <H1>Change Password</H1>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <div className="my-5">
          <Label>Password Baru</Label>
          <br />
          <Input
            type="password"
            name="password"
            placeholder="Password"
            required
            ref={register({ required: true })}
          />
          <br />
          <br />

          <Label>Konfirmasi Password</Label>
          <br />
          <Input
            type="password"
            name="passwordConfirmation"
            placeholder="Password Confirmation"
            required
            ref={register({ required: true })}
          />
          <FormError error={get(errors, 'passwordConfirmation.message')} />
        </div>

        <Button
          className="pwc"
          color="primary"
          type="submit"
          block
          loading={loading}
        >
          Change Password
        </Button>
      </Form>
    </Container>
  )
}

const FormError = ({ error }: { error?: FieldError }) => {
  if (error) {
    return <span className="text-danger">{error}</span>
  } else {
    return null
  }
}

export default ResetPassword
