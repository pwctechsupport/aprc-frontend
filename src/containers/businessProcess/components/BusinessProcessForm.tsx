import React, { Fragment } from "react";
import { useForm } from "react-hook-form";
import { Form, Input, Row, Col, FormText } from "reactstrap";
import Button from "../../../shared/components/Button";
import DialogButton from "../../../shared/components/DialogButton";
import * as yup from "yup";

const BusinessProcessForm = ({
  onSubmit,
  defaultValues,
  submitButtonName = "Add",
  onCancel,
}: BusinessProcessFormProps) => {
  const { register, handleSubmit, reset, errors } = useForm<
    BusinessProcessFormValues
  >({
    defaultValues,
    validationSchema,
  });

  const submit = (values: BusinessProcessFormValues) => {
    onSubmit && onSubmit(values, { reset });
  };

  return (
    <Fragment>
      <Form
        onSubmit={handleSubmit(submit)}
        // className="d-flex align-items-center mb-1"
      >
        <Row>
          <Col lg={9}>
            <div style={{ border: `${errors.name ? "1px solid red" : ""}` }}>
              <Input
                name="name"
                placeholder="Business process name*"
                innerRef={register}
                required
              />
            </div>
          </Col>

          <Col lg={3}>
            {onCancel && (
              <Button onClick={onCancel} className="button reset-95px mr-2">
                Cancel
              </Button>
            )}
            <DialogButton
              onConfirm={handleSubmit(submit)}
              className="add ml-0"
              type="button"
              message={`${submitButtonName} business process?`}
            >
              {submitButtonName}
            </DialogButton>
          </Col>
        </Row>
      </Form>
      {errors.name && (
        <FormText className="text-danger " color="red">
          {errors.name?.message}
        </FormText>
      )}
    </Fragment>
  );
};

export default BusinessProcessForm;

export interface BusinessProcessFormProps {
  onSubmit?: (values: BusinessProcessFormValues, options: any) => void;
  defaultValues?: BusinessProcessFormValues;
  submitButtonName?: string;
  onCancel?: () => void;
}

export interface BusinessProcessFormValues {
  name: string;
}
const validationSchema = yup.object().shape({
  name: yup.string().required("Name is a required field"),
});
