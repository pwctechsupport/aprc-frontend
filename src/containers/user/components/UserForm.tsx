import React from "react";
import { useForm } from "react-hook-form";
import { Form } from "reactstrap";
import { oc } from "ts-optchain";
import * as yup from "yup";
import {
  PolicyCategoriesDocument,
  PolicyCategoriesQuery,
  RolesDocument,
  RolesQuery
} from "../../../generated/graphql";
import Button from "../../../shared/components/Button";
import AsyncSelect from "../../../shared/components/forms/AsyncSelect";
import Input from "../../../shared/components/forms/Input";
import { Suggestions, toLabelValue } from "../../../shared/formatter";
import useLazyQueryReturnPromise from "../../../shared/hooks/useLazyQueryReturnPromise";

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
  roleIds?: Suggestions;
  policyCategoryIds?: Suggestions;
}

export default function UserForm(props: UserFormProps) {
  const { register, handleSubmit, errors, setValue } = useForm<UserFormValues>({
    validationSchema,
    defaultValues: props.defaultValues
  });

  function onSubmit(data: UserFormValues) {
    if (!props.submitting) props.onSubmit?.(data);
  }

  const handleGetRoles = useLoadRoles();
  const handleGetPolicyCategories = useLoadPolicyCategories();

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Input
        required
        label="Name"
        name="name"
        innerRef={register({ required: true })}
        error={errors?.name?.message}
      />
      <Input
        required
        label="Email"
        name="email"
        type="email"
        innerRef={register({ required: true })}
        error={errors?.email?.message}
      />
      <Input
        required
        label="Password"
        name="password"
        type="password"
        innerRef={register({ required: true })}
        error={errors?.password?.message}
      />
      <Input
        required
        label="Password Confirmation"
        name="passwordConfirmation"
        type="password"
        innerRef={register({ required: true })}
        error={errors?.passwordConfirmation?.message}
      />
      <Input
        required
        label="Phone"
        name="phone"
        type="tel"
        innerRef={register({ required: true })}
        error={oc(errors).phone.message("")}
      />
      <AsyncSelect
        label="Roles"
        isMulti
        cacheOptions
        defaultOptions
        name="roleIds"
        register={register}
        setValue={setValue}
        loadOptions={handleGetRoles}
      />

      <AsyncSelect
        label="Policy Categories"
        isMulti
        cacheOptions
        defaultOptions
        name="policyCategoryIds"
        register={register}
        setValue={setValue}
        loadOptions={handleGetPolicyCategories}
      />

      <div className="d-flex justify-content-end my-3">
        <Button type="submit" className="pwc px-5" loading={props.submitting}>
          Submit
        </Button>
      </div>
    </Form>
  );
}
// =======================================================
// Validation Schema
// =======================================================

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

// =======================================================
// Custom Hooks
// =======================================================

export function useLoadRoles() {
  const getRoles = useLazyQueryReturnPromise<RolesQuery>(RolesDocument);
  async function handleGetRoles(input: string) {
    try {
      const queryResult = await getRoles({ filter: { name_cont: input } });
      return queryResult.data?.roles?.collection?.map(toLabelValue) || [];
    } catch (error) {
      return [];
    }
  }
  return handleGetRoles;
}

export function useLoadPolicyCategories() {
  const getPolicyCategories = useLazyQueryReturnPromise<PolicyCategoriesQuery>(
    PolicyCategoriesDocument
  );
  async function handleGetPolicyCategories(input: string) {
    try {
      const queryResult = await getPolicyCategories({
        filter: { name_cont: input }
      });
      return (
        queryResult.data?.policyCategories?.collection?.map(toLabelValue) || []
      );
    } catch (error) {
      return [];
    }
  }
  return handleGetPolicyCategories;
}
