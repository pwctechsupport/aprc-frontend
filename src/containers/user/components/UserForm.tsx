import React from "react";
import { useForm } from "react-hook-form";
import { Form } from "reactstrap";
import { oc } from "ts-optchain";
import * as yup from "yup";
import {
  PolicyCategoriesDocument,
  PolicyCategoriesQuery,
  DepartmentsQuery,
  DepartmentsDocument,
  RolesDocument,
  RolesQuery,
} from "../../../generated/graphql";
import Button from "../../../shared/components/Button";
import AsyncSelect from "../../../shared/components/forms/AsyncSelect";
import Input from "../../../shared/components/forms/Input";
import { Suggestions, toLabelValue } from "../../../shared/formatter";
import useLazyQueryReturnPromise from "../../../shared/hooks/useLazyQueryReturnPromise";
import DialogButton from "../../../shared/components/DialogButton";

export interface UserFormProps {
  onSubmit?: (values: UserFormValues) => void;
  defaultValues?: UserFormValues;
  submitting?: boolean;
  history?: any;
  isCreate?: boolean;
}

export interface UserFormValues {
  name?: string;
  email?: string;
  password?: string;
  passwordConfirmation?: string;
  phone?: string;
  roleIds?: any;
  departmentIds?: any;
  policyCategoryIds?: Suggestions;
}

export default function UserForm(props: UserFormProps) {
  const { register, handleSubmit, errors, setValue } = useForm<UserFormValues>({
    validationSchema,
    defaultValues: props.defaultValues,
  });

  function onSubmit(data: UserFormValues) {
    if (!props.submitting) props.onSubmit?.(data);
  }

  const handleGetRoles = useLoadRoles();
  const handleGetPolicyCategories = useLoadPolicyCategories();
  const handleGetDepartments = useLoadDepartments();

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
        label="User Group"
        cacheOptions
        defaultOptions
        name="roleIds"
        register={register}
        setValue={setValue}
        loadOptions={handleGetRoles}
      />
      <AsyncSelect
        label="Department"
        cacheOptions
        defaultOptions
        name="departmentIds"
        register={register}
        setValue={setValue}
        loadOptions={handleGetDepartments}
      />
      <AsyncSelect
        label="Policy Categories*"
        placeholder="Policy Categories"
        isMulti
        cacheOptions
        defaultOptions
        name="policyCategoryIds"
        register={register}
        setValue={setValue}
        loadOptions={handleGetPolicyCategories}
        error={
          errors.policyCategoryIds && "Policy categories is a required field"
        }
      />
      <div className="d-flex justify-content-end my-3">
        <Button type="submit" className="pwc px-5" loading={props.submitting}>
          Submit
        </Button>
        {props.isCreate && (
          <DialogButton
            className="black px-5 ml-2"
            style={{ backgroundColor: "rgba(233, 236, 239, 0.8)" }}
            onConfirm={() => props.history.replace(`/user`)}
            isCreate
          >
            Cancel
          </DialogButton>
        )}
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
  phone: yup.string().required(),
  policyCategoryIds: yup.array().required(),
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
        filter: { name_cont: input },
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
export function useLoadDepartments() {
  const getDepartments = useLazyQueryReturnPromise<DepartmentsQuery>(
    DepartmentsDocument
  );
  async function handleGetDepartments(input: string) {
    try {
      const queryResult = await getDepartments({
        filter: { name_cont: input },
      });
      return queryResult.data?.departments?.collection?.map(toLabelValue) || [];
    } catch (error) {
      return [];
    }
  }
  return handleGetDepartments;
}
