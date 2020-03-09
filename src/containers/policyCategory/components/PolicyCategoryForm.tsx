import React from "react";
import useForm from "react-hook-form";
import { Form } from "reactstrap";
import { oc } from "ts-optchain";
import { PoliciesDocument, PoliciesQuery } from "../../../generated/graphql";
import Button from "../../../shared/components/Button";
import AsyncSelect from "../../../shared/components/forms/AsyncSelect";
import Input from "../../../shared/components/forms/Input";
import { Suggestions, toLabelValue } from "../../../shared/formatter";
import useLazyQueryReturnPromise from "../../../shared/hooks/useLazyQueryReturnPromise";

const PolicyCategoryForm = ({
  defaultValues,
  onSubmit,
  submitting,
  isDraft
}: PolicyCategoryFormProps) => {
  const { register, setValue, handleSubmit } = useForm<
    PolicyCategoryFormValues
  >({
    defaultValues
  });

  const getPolicies = useLoadPolicies();
  const policies = defaultValues?.policyIds || [];

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
        </div>
      );
    }
  };
  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Input name="name" innerRef={register} label="Name" />
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
}

interface PolicyCategoryFormProps {
  onSubmit: (data: PolicyCategoryFormValues) => void;
  submitting: boolean;
  defaultValues?: PolicyCategoryFormValues;
  isDraft?: boolean;
}

function useLoadPolicies() {
  const query = useLazyQueryReturnPromise<PoliciesQuery>(PoliciesDocument);
  async function getSuggestions(title_cont: string = ""): Promise<Suggestions> {
    try {
      const { data } = await query({
        filter: { title_cont }
      });
      return data.policies?.collection?.map(toLabelValue) || [];
    } catch (error) {
      return [];
    }
  }
  return getSuggestions;
}
