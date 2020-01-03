import { capitalCase } from "capital-case";
import React, { useEffect } from "react";
import useForm from "react-hook-form";
import { Form } from "reactstrap";
import { oc } from "ts-optchain";
import * as yup from "yup";
import { Status, usePolicyCategoriesQuery } from "../../../generated/graphql";
import DialogButton from "../../../shared/components/DialogButton";
import Input from "../../../shared/components/forms/Input";
import Select from "../../../shared/components/forms/Select";
import TextEditor from "../../../shared/components/forms/TextEditor";
import LoadingSpinner from "../../../shared/components/LoadingSpinner";
import { prepDefaultValue, toLabelValue } from "../../../shared/formatter";

const PolicyForm = ({
  onSubmit,
  defaultValues,
  submitting,
  isAdmin = true
}: PolicyFormProps) => {
  const policyCategoriesState = usePolicyCategoriesQuery();
  const { register, setValue, watch, errors, handleSubmit } = useForm<
    PolicyFormValues
  >({
    validationSchema,
    defaultValues
  });

  useEffect(() => {
    register({ name: "policyCategoryId", required: true });
    register({ name: "referenceId" });
    register({ name: "description", required: true });
    register({ name: "status" });
  }, [register]);

  function onChangeEditor(event: any, editor: any) {
    const data = editor.getData();
    setValue("description", data);
  }

  function handleChange(name: string) {
    return function(value: any) {
      if (value) {
        setValue(name, value.value);
      }
    };
  }

  function submit(values: PolicyFormValues) {
    onSubmit && onSubmit(values);
  }

  const status = oc(defaultValues).status();
  const options = oc(policyCategoriesState)
    .data.policyCategories.collection([])
    .map(toLabelValue);
  const policyCategoryId = oc(defaultValues).policyCategoryId("");

  if (policyCategoriesState.loading) {
    return <LoadingSpinner centered size={30} />;
  }

  return (
    <div>
      <Form>
        <Input
          name="title"
          label="Title"
          innerRef={register({ required: true })}
          error={errors.title && errors.title.message}
        />
        <div className="mb-3">
          <label>Policy Description</label>
          <TextEditor
            data={watch("description")}
            onChange={onChangeEditor}
            invalid={!!errors.description}
          />
        </div>
        <Select
          name="policyCategoryId"
          label="Policy Category"
          options={options}
          onChange={handleChange("policyCategoryId")}
          defaultValue={options.find(
            option => option.value === policyCategoryId
          )}
          error={errors.policyCategoryId && errors.policyCategoryId.message}
        />
        <Select
          name="status"
          label="Status"
          options={statuses}
          onChange={handleChange("status")}
          error={errors.status && errors.status.message}
          defaultValue={prepDefaultValue(status, statuses) || Status.Draft}
          isDisabled={!isAdmin}
        />
        <div className="d-flex justify-content-end mt-3">
          <DialogButton
            color="primary"
            loading={submitting}
            className="pwc px-5"
            onConfirm={handleSubmit(submit)}
          >
            {defaultValues ? "Save" : "Submit"}
          </DialogButton>
        </div>
      </Form>
    </div>
  );
};

export default PolicyForm;

// ---------------------------------------------------
// Construct Options
// ---------------------------------------------------

const statuses = Object.entries(Status).map(([label, value]) => ({
  label: capitalCase(value),
  value
}));

// ---------------------------------------------------
// Validation
// ---------------------------------------------------

const validationSchema = yup.object().shape({
  title: yup.string().required(),
  description: yup.string().required(),
  policyCategoryId: yup.string().required()
});

// ---------------------------------------------------
// Type Definition
// ---------------------------------------------------

export interface PolicyFormValues {
  title: string;
  description: string;
  policyCategoryId: string;
  status: Status;
}

export interface PolicyFormProps {
  imagePreviewUrl?: string;
  onCancel?: () => void;
  onSubmit?: (data: PolicyFormValues) => void;
  submitting?: boolean;
  defaultValues?: PolicyFormValues;
  isAdmin?: boolean;
}
