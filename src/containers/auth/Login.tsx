import React from "react";
import useForm from "react-hook-form";
import { toast } from "react-toastify";
import { useLoginMutation } from "../../generated/graphql";

const Login = () => {
  const { register, handleSubmit } = useForm();
  const [login] = useLoginMutation({
    onCompleted: () => toast("Wow so easy !"),
    onError: () => toast("Error!")
  });
  const onSubmit = (data: any): void => {
    console.log("submitting", data);
    login({ variables: data });
  };
  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input name="email" ref={register({ required: true })} />
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
