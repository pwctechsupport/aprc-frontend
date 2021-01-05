import React from "react";
import { useForm } from "react-hook-form";
import { RouteComponentProps } from "react-router-dom";
import { toast } from "react-toastify";
import styled from "styled-components";
import { useForgotPasswordMutation } from "../../generated/graphql";
import Button from "../../shared/components/Button";
import { Container, Form, H1, Image, Input, Label } from "../auth/Login";
import Helmet from "react-helmet";
import { Link } from "react-router-dom";
import useWindowSize from "../../shared/hooks/useWindowSize";
import Footer from "../../shared/components/Footer";
import pwcLogo from "../../assets/images/pwc-logo-outline-black.png";

const ForgotPassword = ({ history }: RouteComponentProps) => {
  const { register, handleSubmit } = useForm();
  const [forgotPassword, { loading }] = useForgotPasswordMutation({
    onCompleted,
    onError,
  });

  const onSubmit = (data: any) => {
    forgotPassword({ variables: { email: data.email } });
  };

  function onCompleted() {
    toast.success("Check your email inbox to change password");
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
  const screenSize = useWindowSize();

  return (
    <>
      <Container
        style={{
          minHeight: "85vh",
        }}
      >
        <Helmet>
          <title>Forgot Password - PricewaterhouseCoopers</title>
        </Helmet>
        <Container
          style={{
            width: `${screenSize.width < 768 ? "100%" : "30%"}`,
          }}
        >
          <Image src={pwcLogo} alt="pwc-logo" />
          <H4 style={{ fontSize: "16px" }}>Automated Policy, Risk and Control Management Tool</H4>
          <H1 style={{ fontSize: "16px", textAlign: "center" }}>
            Password recovery
          </H1>
          <H4>
            Enter the email address for your account and we'll send you
            instructions to reset your password.
          </H4>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <div className="my-5">
              <Label>Your Email</Label>
              <br />
              <Input
                name="email"
                placeholder="Enter email address"
                required
                ref={register({ required: true })}
              />
            </div>

            <Button
              className="pwc mx-auto"
              color="primary"
              type="submit"
              block
              loading={loading}
            >
              Reset Password
            </Button>
          </Form>
          <div className="text-center my-4">
            <Link to="/auth" className="link-pwc">
              Cancel
            </Link>
          </div>
        </Container>
      </Container>
      <Footer linebreak />
    </>
  );
};

export default ForgotPassword;

const H4 = styled.h4`
  font-size: 14px;
  text-align: center;
  margin-bottom: 15px;
  @media (max-width: 414px) {
    margin: 0 21px 15px 21px;
  }
  @media (max-width: 375px) {
    margin: 0 16px 15px 16px;
  }
  @media (max-width: 320px) {
    margin: 0 20px 15px 20px;
  }
`