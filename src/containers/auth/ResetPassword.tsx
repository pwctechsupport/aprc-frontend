import React from "react";
import { useForm } from "react-hook-form";
import { RouteComponentProps } from "react-router-dom";
import { toast } from "react-toastify";
import * as yup from "yup";
import { get } from "lodash";
import pwcLogoOutline from "../../assets/images/pwc-logo-outline-black.png";
import { useUpdatePasswordMutation } from "../../generated/graphql";
import Button from "../../shared/components/Button";
import {  H1, Image, Label } from "./Login";
import { FieldError } from "react-hook-form/dist/types";
import { Col, Container, Row, Form } from "reactstrap";
import Input  from '../../shared/components/forms/Input'
import { PasswordRequirements } from "../../shared/components/forms/PasswordRequirements";

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

  const { register, handleSubmit, errors, watch } = useForm<ResetPasswordFormValues>({
    validationSchema,
  });

  const checkPassword = watch("password")?.split("") || [""];
  const capitalWords = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const lowerCaseWords = "abcdefghijklmnopqrstuvwxyz".split("");
  const specialsCharacters = " `!@#$%^&*()_+-{\\\"'}[/]~|?<=>:;.,".split("");
  const numbers = "1234567890".split("");

  const noLowerCasePassword = checkPassword
    ?.map((a) => lowerCaseWords.includes(a))
    .every((a) => a === false);

  const noCapitalPassword = checkPassword
    ?.map((a) => capitalWords.includes(a))
    .every((a) => a === false);

  const noSpecialCharacterPassword = checkPassword
    ?.map((a) => specialsCharacters.includes(a))
    .every((a) => a === false);

  const noNumberPassword = checkPassword
    ?.map((a) => numbers.includes(a))
    .every((a) => a === false);

  const falsePasswordLength = (checkPassword?.length || 0) < 8;

  const checkingPasswordValidity = 
    falsePasswordLength ||
    noLowerCasePassword ||
    noCapitalPassword ||
    noNumberPassword ||
    noSpecialCharacterPassword

  const [updatePassword, { loading }] = useUpdatePasswordMutation({
    onCompleted,
    onError,
  });

  const onSubmit = (data: any) => {
    if (!checkingPasswordValidity) {
      updatePassword({
        variables: {
          input: {
            password: data.password,
            passwordConfirmation: data.passwordConfirmation,
            resetPasswordToken: token,
          },
        },
      });
    } else {
      toast.error("Password doesn't fullfill requirement(s)");
    }
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
        <Col xs={12} md={4} >
            <div className="text-center">
              <Image src={pwcLogoOutline} alt="pwc-logo" className="mt-3" />
              <H1 style={{fontSize: '16px'}}>Change Password</H1>
            </div>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <div className="my-4">
                <Label>New Password</Label>
                <Input
                  formGroupclassName="mb-4"
                  type="password"
                  name="password"
                  placeholder="Password"
                  required
                  innerRef={register({ required: true })}
                />
                <Label>Password Confirmation</Label>
                <Input
                  type="password"
                  name="passwordConfirmation"
                  placeholder="Password Confirmation"
                  required
                  innerRef={register({ required: true })}
                  error={errors && errors.passwordConfirmation?.message}
                />
                {checkingPasswordValidity && (
                  <PasswordRequirements 
                    falsePasswordLength={falsePasswordLength}
                    noCapitalPassword={noCapitalPassword}
                    noLowerCasePassword={noLowerCasePassword}
                    noSpecialCharacterPassword={noSpecialCharacterPassword}
                    noNumberPassword={noNumberPassword}
                  />
                )}
              </div>
              <div style={{ marginBottom: '25px'}}>
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

export default ResetPassword;
