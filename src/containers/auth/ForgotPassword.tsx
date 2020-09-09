import React from "react";
import { useForm } from "react-hook-form";
import { RouteComponentProps } from "react-router-dom";
import { toast } from "react-toastify";
import pwcLogo from "../../assets/images/pwc-logo.png";
import { useForgotPasswordMutation } from "../../generated/graphql";
import Button from "../../shared/components/Button";
import { Container, Form, H1, Image, Input, Label } from "./Login";
import Helmet from "react-helmet";
import { Link } from "react-router-dom";
import useWindowSize from "../../shared/hooks/useWindowSize";
import Footer from "../../shared/components/Footer";

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
          minHeight: "90vh",
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
          <H1 style={{ fontSize: "16px", textAlign: "center" }}>eGRC</H1>
          <H1 style={{ fontSize: "16px", textAlign: "center" }}>
            Password recovery
          </H1>
          <h4 style={{ fontSize: "14px", textAlign: "center" }}>
            Enter the email address for your account and we'll send you
            instructions to reset your password.
          </h4>
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
              className="pwc"
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
      <Footer />
    </>
  );
};

export default ForgotPassword;
