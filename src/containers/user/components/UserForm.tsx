import React from "react";
import { useForm } from "react-hook-form";
import { Form } from "reactstrap";
import { oc } from "ts-optchain";
import Button from "../../../shared/components/Button";
import Input from "../../../shared/components/forms/Input";
import * as yup from "yup";

const UserForm = (props: UserFormProps) => {
  const { register, handleSubmit, errors } = useForm<UserFormValues>({
    validationSchema,
    defaultValues: props.defaultValues
  });

  function onSubmit(data: UserFormValues) {
    props.onSubmit && !props.submitting && props.onSubmit(data);
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Input
        required
        label="Name"
        name="name"
        innerRef={register({ required: true })}
        error={errors && errors.name && errors.name.message}
      />
      <Input
        required
        label="Email"
        name="email"
        type="email"
        innerRef={register({ required: true })}
        error={oc(errors).email.message("")}
      />
      <Input
        required
        label="Password"
        name="password"
        type="password"
        innerRef={register({ required: true })}
        error={oc(errors).password.message("")}
      />
      <Input
        required
        label="Password Confirmation"
        name="passwordConfirmation"
        type="password"
        innerRef={register({ required: true })}
        error={oc(errors).passwordConfirmation.message("")}
      />
      <Input
        required
        label="Phone"
        name="phone"
        type="tel"
        innerRef={register({ required: true })}
        error={oc(errors).phone.message("")}
      />

      <Button type="submit" className="pwc" loading={props.submitting}>
        Submit
      </Button>
    </Form>
  );
};

const validationSchema = yup.object().shape({
  name: yup.string().required(),
  email: yup.string().required(),
  password: yup.string().required(),
  passwordConfirmation: yup
    .string()
    .trim()
    .required()
    .oneOf([yup.ref("password")], "Password does not match"),
  phone: yup.string().required()
});

export interface UserFormProps {
  onSubmit?: (values: UserFormValues) => void;
  defaultValues?: UserFormValues;
  submitting?: boolean;
}

export interface UserFormValues {
  name?: string;
  email?: string;
  password?: string;
  passwordConfirmation?: string;
  phone?: string;
}

export default UserForm;
