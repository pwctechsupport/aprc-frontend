import React from "react";
import useForm from "react-hook-form";
import { useDispatch } from "react-redux";
import { RouteComponentProps } from "react-router";
import { toast } from "react-toastify";
import styled from "styled-components";
import pwcLogo from "../../assets/images/pwc-logo.png";
import { useLoginMutation } from "../../generated/graphql";
import { authorize } from "../../redux/auth";
import Button from "../../shared/components/Button";
import { oc } from "ts-optchain";
import { Link } from "react-router-dom";

const Login = ({ history }: RouteComponentProps) => {
  const dispatch = useDispatch();
  const { register, handleSubmit } = useForm();
  const [login, { loading }] = useLoginMutation({
    onCompleted: res => {},
    onError: () => {}
  });
  const onSubmit = async (data: any) => {
    try {
      const res = await login({ variables: data });
      if (!oc(res).data.login()) {
        throw new Error("Error");
      }
      toast.success("Welcome");
      dispatch(
        authorize(
          {
            id: oc(res).data.login.id(""),
            email: oc(res).data.login.email(""),
            firstName: oc(res).data.login.firstName(""),
            lastName: oc(res).data.login.lastName(""),
            phone: oc(res).data.login.phone(""),
            jobPosition: oc(res).data.login.jobPosition(""),
            department: oc(res).data.login.department("")
          },
          oc(res).data.login.token("")
        )
      );
      history.push("/");
    } catch (error) {
      toast.error(
        <div>
          <h5>Login Error!</h5>
          <div>Mohon coba lagi</div>
        </div>
      );
    }
  };
  return (
    <Container>
      <Image src={pwcLogo} alt="pwc-logo" />
      <H1>Welcome, Please Sign in Here</H1>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Label>Email</Label>
        <br />
        <Input
          name="email"
          placeholder="Enter email address"
          required
          ref={register({ required: true })}
        />{' '}
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
        <div className="text-center my-4">
          <Link to="/forgot-password" className="link-pwc">
            Forgot Password?
          </Link>
        </div>
        <Button
          className="pwc"
          color="primary"
          type="submit"
          block
          loading={loading}
        >
          Login
        </Button>
      </Form>
    </Container>
  )
};

export const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

export const Form = styled.form`
  width: 30vw;
`;

export const Image = styled.img`
  width: 90px;
  height: auto;
  margin: 70px;
`;

export const H1 = styled.h1`
  margin-bottom: 30px;
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
  border-radius: 10px;
  height: 35px;
  width: 100%;
  padding: 5px 10px 5px 10px;
  ::placeholder {
    /* Chrome, Firefox, Opera, Safari 10.1+ */
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 25px;
    color: #bfbfbf;
  }
`;

export default Login;
