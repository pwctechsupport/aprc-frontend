import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Col, Form, FormFeedback, Input, Row } from "reactstrap";
import * as yup from "yup";
import {
  useCreateReferenceMutation,
  PoliciesQuery,
  PoliciesDocument,
} from "../../generated/graphql";
import DialogButton from "../../shared/components/DialogButton";
import AsyncSelect from "../../shared/components/forms/AsyncSelect";
import useLazyQueryReturnPromise from "../../shared/hooks/useLazyQueryReturnPromise";
import { Suggestions, toLabelValue } from "../../shared/formatter";

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
const CreateReference = () => {
  const { register, handleSubmit, reset, errors, setValue } = useForm<
    CreateReferenceFormValues
  >({ validationSchema });
  const handleGetPolicies = useLoadPolicies();

  const [createReference, createReferenceM] = useCreateReferenceMutation({
    refetchQueries: ["references"],
    onCompleted: () => {
      toast.success("Create Success");
      reset();
    },
    onError: () => toast.error("Create Failed"),
  });

  function submit(values: CreateReferenceFormValues) {
    const input: any = {
      name: values.name,
      policyIds: values.policyIds.map((a: any) => a.value),
    };
    createReference({ variables: { input } });
  }

  return (
    <Form onSubmit={handleSubmit(submit)} className="mb-4">
      <Row>
        <Col lg={10}>
          <Input
            name="name"
            placeholder="Add new reference..."
            innerRef={register}
            invalid={errors.name && errors.name.message ? true : false}
            required
          />
          <AsyncSelect
            name="policyIds"
            label="Related Policies*"
            register={register}
            setValue={setValue}
            cacheOptions
            loadOptions={handleGetPolicies}
            defaultOptions
            defaultValue={[]}
            isMulti
          />
          <FormFeedback>{errors.name && errors.name.message}</FormFeedback>
        </Col>
        <Col lg={2} className="mt-3 mt-lg-0">
          <DialogButton
            onConfirm={handleSubmit(submit)}
            disabled={createReferenceM.loading}
            color="primary"
            block
            type="button"
            className="pwc"
            message="Add reference?"
          >
            Add
          </DialogButton>
        </Col>
      </Row>
    </Form>
  );
};

export default CreateReference;

interface CreateReferenceFormValues {
  name: string;
  policyIds: any;
}

// yup.addMethod(yup.string, "reference", function(formats, parsetStrict) {
//   return this.transform(function(value, originalValue) {
//     if (this.isType(value)) return value;

//     return originalValue.includes("#") ? true : false;
//   });
// });

const validationSchema = yup.object().shape({
  name: yup.string().required("Reference name cannot be empty"),
  // .test("reference", "Require a hashtag", function(value: string) {
  //   return value[0] === "#";
  // })
});
