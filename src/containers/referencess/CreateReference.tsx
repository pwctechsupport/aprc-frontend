import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Col, Form, FormFeedback, Row } from "reactstrap";
import Input from "../../shared/components/forms/Input";
import * as yup from "yup";
import {
  useCreateReferenceMutation,
  PoliciesQuery,
  PoliciesDocument
} from "../../generated/graphql";
import AsyncSelect from "../../shared/components/forms/AsyncSelect";
import useLazyQueryReturnPromise from "../../shared/hooks/useLazyQueryReturnPromise";
import { Suggestions, toLabelValue } from "../../shared/formatter";
import Helmet from "react-helmet";
import BreadCrumb from "../../shared/components/BreadCrumb";
import Button from "../../shared/components/Button";
import { RouteComponentProps } from "react-router-dom";

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
const CreateReference = ({ history }: RouteComponentProps) => {
  const { register, handleSubmit, reset, errors, setValue } = useForm<
    CreateReferenceFormValues
  >({ validationSchema });
  const handleGetPolicies = useLoadPolicies();

  const [createReference, createReferenceM] = useCreateReferenceMutation({
    refetchQueries: ["references"],
    onCompleted: () => {
      toast.success("Create Success");
      history.replace(`/references`);
      reset();
    },
    onError: () => toast.error("Create Failed")
  });

  function submit(values: CreateReferenceFormValues) {
    const input: any = {
      name: values.name,
      policyIds: values.policyIds
        ? values.policyIds.map((a: any) => a.value)
        : null
    };
    createReference({ variables: { input } });
  }

  return (
    <div>
      <Helmet>
        <title>Create - Reference - PricewaterhouseCoopers</title>
      </Helmet>
      <BreadCrumb
        crumbs={[
          ["/references", "Reference"],
          ["/reference/create", "Create Reference"]
        ]}
      />
      <h4>Create Reference</h4>
      <Form onSubmit={handleSubmit(submit)} className="mb-4">
        <Row>
          <Col className="mt-3">
            <Input
              name="name"
              label="Name*"
              innerRef={register}
              placeholder="Name"
            />
            <FormFeedback>{errors.name && errors.name.message}</FormFeedback>
          </Col>
        </Row>
        <Row>
          <Col>
            <AsyncSelect
              name="policyIds"
              label="Related Policies*"
              placeholder="Select"
              register={register}
              setValue={setValue}
              cacheOptions
              loadOptions={handleGetPolicies}
              defaultOptions
              defaultValue={[]}
              isMulti
            />
          </Col>
        </Row>
        <Row>
          <Col className="text-right mt-2">
            <Button
              type="submit"
              className="soft red"
              color=""
              loading={createReferenceM.loading}
            >
              Submit{" "}
            </Button>
          </Col>
        </Row>
      </Form>
    </div>
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
  policyIds: yup.array().required("Related policies cannot be empty")
  // .test("reference", "Require a hashtag", function(value: string) {
  //   return value[0] === "#";
  // })
});
