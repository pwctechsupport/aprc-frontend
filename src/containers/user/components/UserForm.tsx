import React, { Fragment } from "react";
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
import { toast } from "react-toastify";
import styled from "styled-components";
import { capitalCase } from "capital-case";
import { capitalize } from "lodash";
import { PasswordRequirements } from '../../../shared/components/forms/PasswordRequirements';

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
  const { register, handleSubmit, errors, setValue, watch } = useForm<
    UserFormValues
  >({
    validationSchema,
    defaultValues: props.defaultValues,
  });
  const checkPassword = watch("password")?.split("") || [""];
  const capitalWords = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const lowerCaseWords = "abcdefghijklmnopqrstuvwxyz".split("");
  const specialsCharacters = " `!@#$%^&*()_+-{\\\"'}[/]~|?<=>:;.,".split("");
  const numbers = "1234567890".split("");

  const noLowerCasePassword = checkPassword
    ?.map((a) => lowerCaseWords.includes(a))
    .every((a) => a === false);

  const noCapitalPassword = checkPassword
    ?.map((a) => capitalWords.includes(a))
    .every((a) => a === false);

  const noSpecialCharacterPassword = checkPassword
    ?.map((a) => specialsCharacters.includes(a))
    .every((a) => a === false);

  const noNumberPassword = checkPassword
    ?.map((a) => numbers.includes(a))
    .every((a) => a === false);

  const falsePasswordLength = (checkPassword?.length || 0) < 12;

  const validatePassword =
    noLowerCasePassword ||
    noCapitalPassword ||
    noNumberPassword ||
    noSpecialCharacterPassword ||
    falsePasswordLength;
  function onSubmit(data: UserFormValues) {
    if (!props.submitting && !validatePassword) {
      props.onSubmit?.(data);
    } else {
      toast.error("Password doesn't fullfill requirement(s)");
    }
  }

  const handleGetRoles = useLoadRoles();
  const handleGetPolicyCategories = useLoadPolicyCategories();
  const handleGetDepartments = useLoadDepartments();

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Input
        label="Name*"
        name="name"
        innerRef={register({ required: true })}
        error={capitalize(errors?.name?.message || "")}
      />
      <Input
        label="Email*"
        name="email"
        type="email"
        innerRef={register({ required: true })}
        error={capitalize(errors?.email?.message || "")}
      />
      <Input
        label="Password*"
        name="password"
        type="password"
        innerRef={register({ required: true })}
        error={capitalize(errors?.password?.message || "")}
      />
      {validatePassword && (
        <PasswordRequirements falsePasswordLength noCapitalPassword noLowerCasePassword noSpecialCharacterPassword noNumberPassword />
      )}
      <Input
        label="Password Confirmation*"
        name="passwordConfirmation"
        type="password"
        innerRef={register({ required: true })}
        error={capitalize(errors?.passwordConfirmation?.message || "")}
      />
      <Input
        label="Phone*"
        name="phone"
        onKeyDown={(e) =>
          (e.keyCode === 69 ||
            e.keyCode === 188 ||
            e.keyCode === 190 ||
            e.keyCode === 38 ||
            e.keyCode === 40) &&
          e.preventDefault()
        }
        type="number"
        innerRef={register({ required: true })}
        error={capitalize(oc(errors).phone.message(""))}
      />
      <AsyncSelect
        label="User Group*"
        cacheOptions
        defaultOptions
        name="roleIds"
        register={register}
        setValue={setValue}
        loadOptions={handleGetRoles}
        error={errors.roleIds && "User group is a required field"}
      />
      <AsyncSelect
        label="Department*"
        cacheOptions
        defaultOptions
        name="departmentIds"
        register={register}
        setValue={setValue}
        loadOptions={handleGetDepartments}
        error={errors.departmentIds && "Department is a required field"}
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
          <StyledDialogButton
            className="cancel black px-5 ml-2"
            onConfirm={() => props.history.replace(`/user`)}
            isCreate
          >
            Cancel
          </StyledDialogButton>
        )}
      </div>
    </Form>
  );
}
const StyledDialogButton = styled(DialogButton)`
  background: var(--soft-grey);
`;
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
  roleIds: yup.object().required(),
  departmentIds: yup.object().required(),
});

// =======================================================
// Custom Hooks
// =======================================================

export function useLoadRoles() {
  const getRoles = useLazyQueryReturnPromise<RolesQuery>(RolesDocument);
  async function handleGetRoles(input: string) {
    try {
      const queryResult = await getRoles({
        filter: {
          name_cont: input,
          name_matches_any: ["admin_preparer", "user", "admin_reviewer"],
        },
      });

      return (
        queryResult.data?.roles?.collection?.map(toLabelValue).map((a) => {
          return {
            label: capitalCase(a.label.split("_").join(" ")),
            value: a.value,
          };
        }) || []
      );
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
        queryResult.data?.navigatorPolicyCategories?.collection?.map(
          toLabelValue
        ) || []
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
