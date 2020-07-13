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
    toast.success("Cek email anda untuk mengganti password");
    history.push("/auth");
  }

  function onError() {
    toast.error(
      <div>
        <h5>Error!</h5>
        <div>Mohon coba lagi</div>
      </div>
    );
  }

  return (
    <Container>
      <Helmet>
        <title>Forgot Password - PricewaterhouseCoopers</title>
      </Helmet>
      <Image src={pwcLogo} alt="pwc-logo" />
      <H1>Password recovery</H1>
      <h4>
        Enter the email address for your account and we'll send you instructions
        to reset your password.
      </h4>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <div className="my-5">
          <Label>Email</Label>
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
          Confirm Email
        </Button>
      </Form>
      <div className="text-center my-4">
        <Link to="/auth" className="link-pwc">
          Back to log in page
        </Link>
      </div>
    </Container>
  );
};

export default ForgotPassword;
