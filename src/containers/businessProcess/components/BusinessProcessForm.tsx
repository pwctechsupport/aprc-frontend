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
          <Col lg={10}>
            <div style={{ border: `${errors.name ? "1px solid red" : ""}` }}>
              <Input
                name="name"
                placeholder="Business Process Name*"
                innerRef={register}
                required
              />
            </div>
          </Col>
          {onCancel && (
            <Button onClick={onCancel} className="ml-3" color="grey">
              Cancel
            </Button>
          )}
          <Col lg={2}>
            <DialogButton
              onConfirm={handleSubmit(submit)}
              className="soft orange ml-0"
              type="button"
              color=""
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
