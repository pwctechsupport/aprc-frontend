import React, { useState, useEffect } from "react";
import Helmet from "react-helmet";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
// import { toast } from "react-toastify";
import styled from "styled-components";
import { oc } from "ts-optchain";
import pwcLogoOutline from "../../assets/images/pwc-logo-outline-black.png";
import {
  useLoginMutation,
  LoginMutationVariables,
  // useUsersQuery,
} from "../../generated/graphql";
import { authorize } from "../../redux/auth";
import Button from "../../shared/components/Button";
import { notifyGraphQLErrors, notifySuccess } from "../../shared/utils/notif";
import Captcha from "react-numeric-captcha";
// import useWindowSize from "../../shared/hooks/useWindowSize";
import { Container as BsContainer, Row, Col } from "reactstrap";
import Footer from "../../shared/components/Footer";
import * as yup from "yup";
import FormInput from '../../shared/components/forms/Input';

export default function Login({ history }: RouteComponentProps) {
  const dispatch = useDispatch();
  const [captcha, setCaptcha] = useState(false);
  const [login, { loading }] = useLoginMutation({
    onError: notifyGraphQLErrors
  });
  const { register, handleSubmit, watch, errors } = useForm<LoginMutationVariables>({
    validationSchema,
  });

  //refreshes Captcha when error
  const [t, st] = useState({
    refresh: () => {},
  });

  async function onSubmit(values: LoginMutationVariables) {
    try {
      const res = await login({ variables: values });
      if (!res.data?.login) {
        t.refresh();
        throw new Error("Error");
      }
      notifySuccess("Welcome");
      dispatch(
        authorize(
          {
            id: res.data.login.id,
            email: oc(res).data.login.email(""),
            firstName: oc(res).data.login.firstName(""),
            lastName: oc(res).data.login.lastName(""),
            name: oc(res).data.login.name(""),
            phone: oc(res).data.login.phone(""),
            jobPosition: oc(res).data.login.jobPosition(""),
            department: oc(res).data.login.department.name(""),
            roles: oc(res).data.login.roles([]),
          },
          oc(res).data.login.token("")
        )
      );
      history.push("/");
    } catch (error) {
      console.error(error)
    }
  }
  // const screenSize = useWindowSize();

  return (
    <BsContainer fluid className="login-background">
      <Row>
        <Col>
          <Image
            className="mt-0"
            src={pwcLogoOutline}
            alt="pwc-logo"
          />
        </Col>
        <Col className="login-wrapper">
          <Helmet>
            <title>Login - PricewaterhouseCoopers</title>
          </Helmet>
          <LoginBox>
            <H1>Welcome to <br />Automated Policy, Risk and <br /> Control Management Tool</H1>

            <Form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
              <Label>Email</Label>
              <SFormInput
                formGroupclassName="mb-0"
                name="email"
                placeholder="Enter email address"
                required
                innerRef={register}
                error={errors.email?.message}
              />
              <Gap />
              <Label>Password</Label>
              <SFormInput
                formGroupclassName="mb-0"
                name="password"
                type="password"
                placeholder="Enter password"
                required
                innerRef={register}
                error={errors.password?.message}
              />
              <Captcha
                ref={(e: any) => st(e)}
                onChange={setCaptcha}
                placeholder="Insert captcha"
              />
              <Row>
                <Col>
                  <h6></h6>
                  <SLink to="/forgot-password" className="link-pwc">
                    Forgot password?
                  </SLink>
                </Col>
                <Col>
                  <Button
                    className="confirmYes"
                    color="primary"
                    type="submit"
                    block
                    loading={loading}
                    disabled={!captcha}
                  >
                    Login
                  </Button>
                </Col>
              </Row>
              <div className="text-center my-0"></div>
            </Form>
          </LoginBox>
        </Col>
      </Row>
      <Footer fontColor={'white'} linebreak origin="login" />
    </BsContainer>
  )
}

const validationSchema = yup.object().shape({
  email: yup.string().required("Email is a required field"),
  password: yup.string().required("Password is a required field"),
})

const SLink = styled(Link)`
  font-size: 14px;
  @media (max-height: 568px) {
    font-size: 12px;
  }
`;

const SFormInput = styled(FormInput)`
  @media (max-height: 568px) {
    font-size: 12px;
  }
`;

const Gap = styled.div`
  margin: 0 0 15px 0;
  @media (max-height: 568px) {
    margin: 0 0 0 0;
  }
`

export const LoginBox = styled.div`
  border: 1px solid rgba(0,0,0,0.2);
  padding: 10px;
  border-radius: 3px;
  background: rgba(255,255,255,.7);
  @media (max-height: 568px) {
    margin-top: 5px;
  }
`
export const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

export const Form = styled.form`
  width: 90%;
`;

export const Image = styled.img`
  width: 200px;
  height: auto;
  @media (max-width: 760px) {
    width: 100px;
  }
`;

export const H1 = styled.h3`
  margin-bottom: 15px;
  font-size: 23px;
  @media (max-height: 568px) {
    font-size: 21px;
    margin-bottom: 10px;
  }
`;

export const Label = styled.label`
  font-weight: 600;
  font-size: 14px;
  line-height: 16px;
  color: #3a3838;
  margin-bottom: 10px;
  @media (max-height: 568px) {
    font-size: 12px;
    line-height: 10px;
  }
`;

export const Input = styled.input`
  border: 1px solid #c4c4c4;
  box-sizing: border-box;
  border-radius: 3px;
  height: 38px;
  width: 100%;
  padding: 5px 10px 5px 10px;
  ::placeholder {
    /* Chrome, Firefox, Opera, Safari 10.1+ */
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 25px;
    color: var(--darker-grey);
  }
`;
