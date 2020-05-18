import React, { Fragment } from "react";
import { useForm } from "react-hook-form";
import { Form, Input } from "reactstrap";
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
        className="d-flex align-items-center mb-1"
      >
        <Fragment>
          <Input
            name="name"
            placeholder="Business Process Name*"
            innerRef={register}
            required
          />
        </Fragment>
        {onCancel && (
          <Button onClick={onCancel} className="ml-3" color="grey">
            Cancel
          </Button>
        )}
        <DialogButton
          onConfirm={handleSubmit(submit)}
          className="soft orange ml-3"
          type="button"
          color=""
          message={`${submitButtonName} business process?`}
        >
          {submitButtonName}
        </DialogButton>
      </Form>
      {errors.name && (
        <div className="text-red ml-2 mt-1" style={{ fontSize: "12px" }}>
          {errors.name?.message}
        </div>
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
