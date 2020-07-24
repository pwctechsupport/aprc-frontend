import React, { useEffect, Fragment, useState } from "react";
import { useForm } from "react-hook-form";
import { Form } from "reactstrap";
import { oc } from "ts-optchain";
import * as yup from "yup";
import { usePolicyCategoriesQuery } from "../../../generated/graphql";
import DialogButton from "../../../shared/components/DialogButton";
import Input from "../../../shared/components/forms/Input";
import Select from "../../../shared/components/forms/Select";
import TextEditorField from "../../../shared/components/forms/TextEditorTinyMce";
import LoadingSpinner from "../../../shared/components/LoadingSpinner";
import { toLabelValue } from "../../../shared/formatter";
import styled from "styled-components";
// import TextEditor from "../../../shared/components/forms/TextEditor";
// import { Editor } from "@tinymce/tinymce-react";

const PolicyForm = ({
  submitFromDraft,
  handleSubmitToReviewer,
  loadingSubmit,
  onSubmit,
  defaultValues,
  submitting,
  onSubmitAsDraft,
  premise,
  submittingAsDraft,
  isCreate,
  history,
  toggleEditMode,
  isAdmin = true,
}: PolicyFormProps) => {
  const [createS, setCreateS] = useState(false);
  const policyCategoriesState = usePolicyCategoriesQuery();
  const { register, setValue, errors, handleSubmit } = useForm<
    PolicyFormValues
  >({
    validationSchema,
    defaultValues,
  });

  useEffect(() => {
    register({ name: "policyCategoryId", required: true });
    register({ name: "referenceId" });
    register({ name: "description", required: true });
    register({ name: "status" });
  }, [register]);

  function onChangeEditor(data: any) {
    setValue("description", data?.level?.content);
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
    setCreateS(true);
  }
  function submitToReviewer(values: PolicyFormValues) {
    handleSubmitToReviewer && handleSubmitToReviewer(values);
    setCreateS(false);
  }
  function submitFromDrafted(values: SubmitAsliBro) {
    submitFromDraft && submitFromDraft(values);
  }
  function submitAsDraft(values: PolicyFormValues) {
    onSubmitAsDraft && onSubmitAsDraft(values);
  }

  const options = oc(policyCategoriesState)
    .data.navigatorPolicyCategories.collection([])
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
          label="Title*"
          placeholder="Title"
          innerRef={register({ required: true })}
          error={errors.title && "Policy title is a required field"}
        />
        <div className="mb-3">
          <label>Policy Description*</label>
          <TextEditorField
            name="description"
            register={register}
            defaultValue={defaultValues?.description || ""}
            onChange={onChangeEditor}
            invalid={!!errors.description}
            error={
              errors.description &&
              "Description field is too short and the field is required"
            }
          />
          {/* <TextEditor
            data={watch("description")}
            onChange={onChangeEditor}
            invalid={!!errors.description}
            error={errors.description && "Description field is too short"}
          />  */}
        </div>
        <Select
          name="policyCategoryId"
          label="Policy Category*"
          loading={policyCategoriesState.loading}
          placeholder="Policy Category"
          options={options}
          onChange={handleChange("policyCategoryId")}
          defaultValue={options.find(
            (option) => option.value === policyCategoryId
          )}
          error={
            errors.policyCategoryId && "Policy category is a required field"
          }
        />

        <div className="d-flex justify-content-end mt-3">
          {premise ? (
            <Fragment>
              <DialogButton
                color="primary"
                loading={submittingAsDraft}
                className="pwc mr-2 px-5"
                message="Save Policy as Draft?"
                onConfirm={handleSubmit(submitAsDraft)}
              >
                Save As Draft
              </DialogButton>
              <DialogButton
                color="primary"
                loading={loadingSubmit}
                className="pwc px-5"
                message="Submit Policy?"
                onConfirm={handleSubmit(submitFromDrafted)}
              >
                Submit
              </DialogButton>
            </Fragment>
          ) : (
            <Fragment>
              <DialogButton
                color="primary"
                loading={createS ? submitting : false}
                message="Save Policy as Draft?"
                className="pwc mr-2 px-5"
                onConfirm={handleSubmit(submit)}
              >
                Save As Draft
              </DialogButton>

              <DialogButton
                color="primary"
                loading={createS ? false : loadingSubmit || submitting}
                className="pwc px-5"
                message="Submit Policy?"
                onConfirm={handleSubmit(submitToReviewer)}
              >
                Submit
              </DialogButton>
            </Fragment>
          )}
          {isCreate ? (
            <StyledDialogButton
              className="black px-5 ml-2"
              onConfirm={() => history.replace(`/policy`)}
              isCreate
            >
              Cancel
            </StyledDialogButton>
          ) : (
            <StyledDialogButton
              className="black px-5 ml-2"
              onConfirm={toggleEditMode}
              isEdit
            >
              Cancel
            </StyledDialogButton>
          )}
        </div>
      </Form>
    </div>
  );
};

export default PolicyForm;

const StyledDialogButton = styled(DialogButton)`
  background: var(--soft-grey);
`;

// ---------------------------------------------------
// Validation
// ---------------------------------------------------

const validationSchema = yup.object().shape({
  title: yup.string().required(),
  description: yup
    .string()
    .min(11)
    .required(),
  policyCategoryId: yup.string().required(),
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
  onSubmitAsDraft?: any;
  premise?: boolean;
  submittingAsDraft?: any;
  isCreate?: boolean;
  history?: any;
  toggleEditMode?: any;
  submitFromDraft?: any;
  loadingSubmit?: any;
  handleSubmitToReviewer?: any;
}
export interface SubmitAsliBro {
  description?: string;
  policyCategoryId?: string;
  title?: string;
}
