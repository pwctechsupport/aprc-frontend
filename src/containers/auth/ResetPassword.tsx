import React from "react";
import { useForm } from "react-hook-form";
import { RouteComponentProps } from "react-router-dom";
import { toast } from "react-toastify";
import * as yup from "yup";
import { get } from "lodash";
import pwcLogo from "../../assets/images/pwc-logo.png";
import { useUpdatePasswordMutation } from "../../generated/graphql";
import Button from "../../shared/components/Button";
import {  H1, Image, Label } from "./Login";
import { FieldError } from "react-hook-form/dist/types";
import { Col, Container, Row, Form } from "reactstrap";
import Input  from '../../shared/components/forms/Input'

const required = "Wajib diisi";
const validationSchema = yup.object().shape({
  password: yup.string().required(),
  passwordConfirmation: yup
    .string()
    .trim()
    .required(required)
    .oneOf(
      [yup.ref("password")],
      "Password confirmation does not match new password"
    ),
});
interface ResetPasswordFormValues {
  password: string;
  passwordConfirmation: string;
}
const ResetPassword = ({ history, location }: RouteComponentProps) => {
  const searhParams = new URLSearchParams(location.search);
  const token = searhParams.get("reset_password_token");

  const { register, handleSubmit, errors } = useForm<ResetPasswordFormValues>({
    validationSchema,
  });
  const [updatePassword, { loading }] = useUpdatePasswordMutation({
    onCompleted,
    onError,
  });

  const onSubmit = (data: any) => {
    updatePassword({
      variables: {
        input: {
          password: data.password,
          passwordConfirmation: data.passwordConfirmation,
          resetPasswordToken: token,
        },
      },
    });
  };

  function onCompleted() {
    toast.success("Password successfully changed");
    history.push("/auth");
  }

  function onError() {
    toast.error(
      <div>
        <h5>Error!</h5>
        <div>Please try again</div>
      </div>
    );
  }

  console.log({ errors });

  return (
    <Container fluid>
      <Row className="d-flex justify-content-center">
        <Col xs={12} md={2} >
            <div className="text-center">
              <Image src={pwcLogo} alt="pwc-logo" className="mt-3" />
              <H1 className="mt-4">Change Password</H1>
            </div>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <div className="my-5">
                <Label>New Password</Label>
                <Input
                  formGroupclassName="mb-4"
                  type="password"
                  name="password"
                  placeholder="Password"
                  required
                  ref={register({ required: true })}
                />
                <Label>Password Confirmation</Label>
                <Input
                  type="password"
                  name="passwordConfirmation"
                  placeholder="Password Confirmation"
                  required
                  ref={register({ required: true })}
                />
                <FormError error={get(errors, "passwordConfirmation.message")} />
              </div>
              <div>
              <Button
                className="base"
                color="primary"
                type="submit"
                block
                loading={loading}
                >
                Change Password
              </Button>
              </div>
            </Form>
        </Col>
      </Row>
    </Container>
  );
};

const FormError = ({ error }: { error?: FieldError }) => {
  if (error) {
    return <span className="text-danger">{error}</span>;
  } else {
    return null;
  }
};

export default ResetPassword;
