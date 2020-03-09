import React from "react";
import useForm from "react-hook-form";
import { Form } from "reactstrap";
import { oc } from "ts-optchain";
import { PoliciesDocument } from "../../../generated/graphql";
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

  const getPolicies = useLazyQueryReturnPromise(PoliciesDocument);
  async function handleGetPolicies(
    title_cont: string = ""
  ): Promise<Suggestions> {
    try {
      const { data } = await getPolicies({
        filter: { title_cont }
      });
      return oc(data)
        .policies.collection([])
        .map(toLabelValue);
    } catch (error) {
      return [];
    }
  }

  const policies = oc(defaultValues).policies([]);

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
        loadOptions={handleGetPolicies}
        defaultOptions
        defaultValue={policies}
        isMulti
        // onInputChange={handleChangeSelect("policyIds")}
      />
      {renderSubmit()}
    </Form>
  );
};

export default PolicyCategoryForm;

export interface PolicyCategoryFormValues {
  name: string;
  policyIds: string[];
}

interface PolicyCategoryFormProps {
  onSubmit: (data: PolicyCategoryFormValues) => void;
  submitting: boolean;
  defaultValues?: PolicyCategoryFormDefaultValues;
  isDraft?: boolean;
}

interface PolicyCategoryFormDefaultValues {
  name?: string;
  policies?: Suggestions;
}
