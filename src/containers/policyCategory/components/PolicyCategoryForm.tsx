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
          <Button
            type="submit"
            className="soft red"
            color=""
            loading={submitting}
          >
            {oc(defaultValues).name("") ? "Save" : "Submit"}
          </Button>
          {isCreate ? (
            <DialogButton
              className="black ml-2"
              style={{ backgroundColor: "rgba(233, 236, 239, 0.8)" }}
              onConfirm={() => history.replace(`/policy-category`)}
              isCreate
            >
              Cancel
            </DialogButton>
          ) : (
            <DialogButton
              className="black ml-2"
              style={{ backgroundColor: "rgba(233, 236, 239, 0.8)" }}
              onConfirm={toggleEditMode}
              isEdit
            >
              Cancel
            </DialogButton>
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
      <AsyncSelect
        name="policyIds"
        label="Related Policies"
        register={register}
        setValue={setValue}
        cacheOptions
        loadOptions={getPolicies}
        defaultOptions
        defaultValue={policies}
        isMulti
      />
      {renderSubmit()}
    </Form>
  );
};

export default PolicyCategoryForm;

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
        filter: { title_cont },
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
