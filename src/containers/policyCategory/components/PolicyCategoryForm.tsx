import React from "react";
import { useForm } from "react-hook-form";
import { Form } from "reactstrap";
import { oc } from "ts-optchain";
import { PoliciesDocument, PoliciesQuery } from "../../../generated/graphql";
import Button from "../../../shared/components/Button";
import AsyncSelect from "../../../shared/components/forms/AsyncSelect";
import Input from "../../../shared/components/forms/Input";
import { Suggestions, toLabelValue } from "../../../shared/formatter";
import useLazyQueryReturnPromise from "../../../shared/hooks/useLazyQueryReturnPromise";
import DialogButton from "../../../shared/components/DialogButton";
import * as yup from "yup";
import styled from "styled-components";

const PolicyCategoryForm = ({
  defaultValues,
  onSubmit,
  isCreate,
  submitting,
  isDraft,
  toggleEditMode,
  history,
}: PolicyCategoryFormProps) => {
  const { register, setValue, handleSubmit, errors } = useForm<
    PolicyCategoryFormValues
  >({
    defaultValues,
    validationSchema,
  });

  const getPolicies = useLoadPolicies();
  const policies = defaultValues?.policies || [];
  const renderSubmit = () => {
    if (!isDraft) {
      return (
        <div className="d-flex justify-content-end">
          <Button type="submit" className="pwc px-5" loading={submitting}>
            {oc(defaultValues).name("") ? "Save" : "Submit"}
          </Button>
          {isCreate ? (
            <StyledDialogButton
              className="cancel px-5 ml-2"
              onConfirm={() => history.replace(`/policy-category`)}
              isCreate
            >
              Cancel
            </StyledDialogButton>
          ) : (
            <StyledDialogButton
              className="cancel px-5 ml-2"
              onConfirm={toggleEditMode}
              isEdit
            >
              Cancel
            </StyledDialogButton>
          )}
        </div>
      );
    }
  };
  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Input
        name="name"
        innerRef={register}
        placeholder="Name"
        label="Name*"
        error={errors.name && errors.name.message}
      />
      {/* <AsyncSelect
        name="policyIds"
        label="Related policies"
        register={register}
        setValue={setValue}
        cacheOptions
        loadOptions={getPolicies}
        defaultOptions
        defaultValue={policies}
        isMulti
        isDisabled={true}
      /> */}
      {renderSubmit()}
    </Form>
  );
};

export default PolicyCategoryForm;

const StyledDialogButton = styled(DialogButton)`
  background: var(--soft-grey);
`;

export interface PolicyCategoryFormValues {
  name?: string;
  policyIds?: Suggestions;
  policies?: any;
}

interface PolicyCategoryFormProps {
  onSubmit: (data: PolicyCategoryFormValues) => void;
  submitting: boolean;
  defaultValues?: PolicyCategoryFormValues;
  isDraft?: boolean;
  isCreate?: boolean;
  history?: any;
  toggleEditMode?: any;
}

function useLoadPolicies() {
  const query = useLazyQueryReturnPromise<PoliciesQuery>(PoliciesDocument);
  async function getSuggestions(title_cont: string = ""): Promise<Suggestions> {
    try {
      const { data } = await query({
        filter: { title_cont, ancestry_not_null: false },
      });
      return data.policies?.collection?.map(toLabelValue) || [];
    } catch (error) {
      return [];
    }
  }
  return getSuggestions;
}
const validationSchema = yup.object().shape({
  name: yup.string().required("Name is a required field"),
});
