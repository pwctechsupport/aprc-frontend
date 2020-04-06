import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Form } from "reactstrap";
import { oc } from "ts-optchain";
import * as yup from "yup";
import { usePolicyCategoriesQuery } from "../../../generated/graphql";
import DialogButton from "../../../shared/components/DialogButton";
import Input from "../../../shared/components/forms/Input";
import Select from "../../../shared/components/forms/Select";
import TextEditor from "../../../shared/components/forms/TextEditor";
import LoadingSpinner from "../../../shared/components/LoadingSpinner";
import { toLabelValue } from "../../../shared/formatter";

const PolicyForm = ({
  onSubmit,
  defaultValues,
  submitting,
  onSubmitDraft,
  premise,
  submittingDraft,
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

  function onChangeEditor(data: string) {
    setValue("description", data);
  }

  function handleChange(name: keyof PolicyFormValues) {
    return function(value: any) {
      if (value) {
        setValue(name, value.value);
      }
    };
  }

  function submit(values: PolicyFormValues) {
    onSubmit && onSubmit(values);
  }
  function submitDraft(values: PolicyFormValues) {
    onSubmitDraft && onSubmitDraft(values);
  }

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
        <div className="d-flex justify-content-end mt-3">
          {premise ? (
            <DialogButton
              color="primary"
              loading={submittingDraft}
              className="pwc px-5"
              onConfirm={handleSubmit(submitDraft)}
            >
              Save As Draft
            </DialogButton>
          ) : (
            <DialogButton
              color="primary"
              loading={submitting}
              className="pwc px-5"
              onConfirm={handleSubmit(submit)}
            >
              {defaultValues ? "Save" : "Submit"}
            </DialogButton>
          )}
        </div>
      </Form>
    </div>
  );
};

export default PolicyForm;

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
}

export interface PolicyFormProps {
  imagePreviewUrl?: string;
  onCancel?: () => void;
  onSubmit?: (data: PolicyFormValues) => void;
  submitting?: boolean;
  defaultValues?: PolicyFormValues;
  isAdmin?: boolean;
  onSubmitDraft?: any;
  premise?: boolean;
  submittingDraft?: any;
}
