import React from "react";
import useForm from "react-hook-form";
import { Form, Input } from "reactstrap";
import Button from "../../../shared/components/Button";
import DialogButton from "../../../shared/components/DialogButton";

const BusinessProcessForm = ({
  onSubmit,
  defaultValues,
  submitButtonName = "Add",
  onCancel
}: BusinessProcessFormProps) => {
  const { register, handleSubmit, reset } = useForm<BusinessProcessFormValues>({
    defaultValues
  });

  const submit = (values: BusinessProcessFormValues) => {
    onSubmit && onSubmit(values, { reset });
  };

  return (
    <Form
      onSubmit={handleSubmit(submit)}
      className="d-flex align-items-center mb-4"
    >
      <Input
        name="name"
        placeholder="Business Process Name"
        innerRef={register}
        required
      />
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
