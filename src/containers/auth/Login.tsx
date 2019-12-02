import React from "react";
import useForm from "react-hook-form";
import { toast } from "react-toastify";
import { useLoginMutation } from "../../generated/graphql";
import { authorize } from "../../redux/auth";
import { useDispatch } from "react-redux";
import { RouteComponentProps } from "react-router";
import pwcLogo from "../../assets/images/pwc-logo.png";

const Login = ({ history }: RouteComponentProps) => {
  const dispatch = useDispatch();
  const { register, handleSubmit } = useForm();
  const [login] = useLoginMutation({
    onCompleted: res => {
      toast("Login Success !");
      if (res.login) {
        dispatch(
          authorize(
            { name: res.login.firstName, email: res.login.email },
            res.login.token
          )
        );
      }
    },
    onError: () => toast("Error!")
  });
  const onSubmit = (data: any): void => {
    login({ variables: data });
  };
  return (
    <div>
      <img src={pwcLogo} alt="pwc-logo" />
      <form onSubmit={handleSubmit(onSubmit)}>
        <label>Email</label>
        <input name="email" ref={register({ required: true })} /> <br />
        <label>Password</label>
        <input
          name="password"
          type="password"
          ref={register({ required: true })}
        />
        <input type="submit" />
      </form>
    </div>
  );
};

export default Login;
