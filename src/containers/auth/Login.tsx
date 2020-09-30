import React, { useState, useEffect } from "react";
import Helmet from "react-helmet";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import styled from "styled-components";
import { oc } from "ts-optchain";
import pwcLogoOutline from "../../assets/images/pwc-logo-outline.png";
import {
  useLoginMutation,
  LoginMutationVariables,
  useUsersQuery,
} from "../../generated/graphql";
import { authorize } from "../../redux/auth";
import Button from "../../shared/components/Button";
import { notifySuccess } from "../../shared/utils/notif";
import Captcha from "react-numeric-captcha";
// import useWindowSize from "../../shared/hooks/useWindowSize";
import { Container as BsContainer, Row, Col } from "reactstrap";
import Footer from "../../shared/components/Footer";
export default function Login({ history }: RouteComponentProps) {
  const dispatch = useDispatch();
  const [captcha, setCaptcha] = useState(false);
  const [login, { loading }] = useLoginMutation();
  const [mail, sMail] = useState("");
  const { data, loading: loadingUsers } = useUsersQuery({
    variables: { filter: { email_cont: mail } },
  });
  const { register, handleSubmit, watch } = useForm<LoginMutationVariables>();
  const checkEmail = watch("email");
  useEffect(() => {
    sMail(checkEmail);
  }, [checkEmail]);

  //refreshes Captcha when error
  const email = data?.users?.collection.map((a) => a.email);
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
      if (email?.includes(checkEmail) === false) {
        toast.error(
          <div>
            <h5>Email is not registered in database</h5>
            <div>Please try again</div>
          </div>
        );
      } else {
        toast.error(
          <div>
            <h5>Wrong password</h5>
            <div>Please try again</div>
          </div>
        );
      }
    }
  }
  // const screenSize = useWindowSize();

  return (
    <BsContainer fluid className="login-background pt-md-5">
      <Image
        style={{
          position: "absolute",
          top: "10px",
          left: 0,
          height: "150px",
          width: "150px",
        }}
        className="mt-0 ml-5"
        src={pwcLogoOutline}
        alt="pwc-logo"
      />
      <Row style={{ minHeight: "80vh" }}>
        <Col sm={12} md={7}></Col>
        <Col sm={12} md={5} className="px-0 px-md-2 pr-md-5">
          <BsContainer className="px-0">
            <Helmet>
              <title>Login - PricewaterhouseCoopers</title>
            </Helmet>
            <div
              style={{
                border: "1px solid rgba(0,0,0,0.2)",
                padding: "2vh",
                borderRadius: "3px",
                backgroundColor: "rgba(255,255,255,.7)",
                marginLeft: "100px",
                marginTop: "60px",
                height: "450px",
                width: "290px",
              }}
            >
              <H1>Welcome to eGRC</H1>

              <Form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
                <Label>Email</Label>
                <br />
                <Input
                  name="email"
                  placeholder="Enter email address"
                  required
                  ref={register({ required: true })}
                />
                <br />
                <br />
                <Label>Password</Label>
                <br />
                <Input
                  name="password"
                  type="password"
                  placeholder="Enter password"
                  required
                  ref={register({ required: true })}
                />
                <br />
                <br />
                <Captcha
                  ref={(e: any) => st(e)}
                  onChange={setCaptcha}
                  placeholder="Insert captcha"
                />
                <br />
                <br />

                <Row>
                <Col sm={6}>
                  <h6></h6>
                  <Link to="/forgot-password" className="link-pwc">
                    Forgot password?
                  </Link>
                  </Col>
                  <Col sm={6}>
                  <Button
                  className="pwc"
                  color="primary"
                  type="submit"
                  block
                  loading={loading || loadingUsers}
                  disabled={!captcha}
                >
                  Login
                </Button>
                  </Col>
                </Row>
                <div className="text-center my-4">
                </div>
              </Form>
            </div>
          </BsContainer>
        </Col>
      </Row>
      <Footer fontColor={"white"} linebreak />
    </BsContainer>
  );
}

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
  margin: 70px;
`;

export const H1 = styled.h3`
  margin-bottom: 15px;
  font-size: 23px;
`;

export const Label = styled.label`
  font-weight: 600;
  font-size: 14px;
  line-height: 16px;
  color: #3a3838;
  margin-bottom: 10px;
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
