import React from "react";
import useForm from "react-hook-form";
import { toast } from "react-toastify";
import { Form, Input, FormFeedback, Row, Col } from "reactstrap";
import * as yup from "yup";
import { useCreateReferenceMutation } from "../../generated/graphql";
import Button from "../../shared/components/Button";
import DialogButton from "../../shared/components/DialogButton";

const CreateReference = () => {
  const { register, handleSubmit, reset, errors } = useForm<
    CreateReferenceFormValues
  >({ validationSchema });
  const [createReference, createReferenceM] = useCreateReferenceMutation({
    refetchQueries: ["references"],
    onCompleted: () => {
      toast.success("Create Success");
      reset();
    },
    onError: () => toast.error("Create Failed")
  });

  function submit(values: CreateReferenceFormValues) {
    createReference({ variables: { input: values } });
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
}

// yup.addMethod(yup.string, "reference", function(formats, parsetStrict) {
//   return this.transform(function(value, originalValue) {
//     if (this.isType(value)) return value;

//     return originalValue.includes("#") ? true : false;
//   });
// });

const validationSchema = yup.object().shape({
  name: yup.string().required("Reference name cannot be empty")
  // .test("reference", "Require a hashtag", function(value: string) {
  //   return value[0] === "#";
  // })
});
