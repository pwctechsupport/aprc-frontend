import React from "react";
import useForm from "react-hook-form";
import { Form } from "reactstrap";
import Input from "../../../shared/components/forms/Input";
import AsyncSelect from "../../../shared/components/forms/AsyncSelect";
import useLazyQueryReturnPromise from "../../../shared/hooks/useLazyQueryReturnPromise";
import { PoliciesDocument } from "../../../generated/graphql";
import { ToLabelValueOutput, toLabelValue } from "../../../shared/formatter";
import { oc } from "ts-optchain";
import Button from "../../../shared/components/Button";

const PolicyCategoryForm = ({
  defaultValues,
  onSubmit,
  submitting
}: PolicyCategoryFormProps) => {
  const { register, setValue, handleSubmit } = useForm<
    PolicyCategoryFormValues
  >({
    defaultValues
  });

  const getPolicies = useLazyQueryReturnPromise(PoliciesDocument);
  async function handleGetPolicies(
    title_cont: string = ""
  ): Promise<Array<ToLabelValueOutput>> {
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
}

interface PolicyCategoryFormDefaultValues {
  name?: string;
  policies?: ToLabelValueOutput[];
}
