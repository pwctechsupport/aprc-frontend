import React, { useEffect, Fragment } from "react";
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
  const policyCategoriesState = usePolicyCategoriesQuery();
  const { register, setValue, watch, errors, handleSubmit } = useForm<
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
  function submitToReviewer(values: PolicyFormValues) {
    handleSubmitToReviewer && handleSubmitToReviewer(values);
  }
  function submitFromDrafted(values:SubmitAsliBro){
    submitFromDraft && submitFromDraft(values)
  }
  function submitAsDraft(values: PolicyFormValues) {
    onSubmitAsDraft && onSubmitAsDraft(values);
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
          label="Title*"
          placeholder="Title"
          innerRef={register({ required: true })}
          error={errors.title && errors.title.message}
        />
        <div className="mb-3">
          <label>Policy Description*</label>
          <TextEditor
            data={watch("description")}
            onChange={onChangeEditor}
            invalid={!!errors.description}
          />
        </div>
        <Select
          name="policyCategoryId"
          label="Policy Category*"
          placeholder="Policy Category"
          options={options}
          onChange={handleChange("policyCategoryId")}
          defaultValue={options.find(
            (option) => option.value === policyCategoryId
          )}
          error={errors.policyCategoryId && errors.policyCategoryId.message}
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
              loading={submitting}
              message="Save Policy as Draft?"
              className="pwc mr-2 px-5"
              onConfirm={handleSubmit(submit)}
            >
              Save As Draft
            </DialogButton>
             <DialogButton
             color="primary"
            //  loading={}
             className="pwc px-5"
             message="Submit Policy?"
             onConfirm={handleSubmit(submitToReviewer)}
           >
             Submit 
           </DialogButton>
           </Fragment>
          )}
          {isCreate ? (
            <DialogButton
              className="black px-5 ml-2"
              style={{ backgroundColor: "rgba(233, 236, 239, 0.8)" }}
              onConfirm={() => history.replace(`/policy`)}
              isCreate
            >
              Cancel
            </DialogButton>
          ) : (
            <DialogButton
              className="black px-5 ml-2"
              style={{ backgroundColor: "rgba(233, 236, 239, 0.8)" }}
              onConfirm={toggleEditMode}
              isEdit
            >
              Cancel
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
  submitFromDraft?:any;
  loadingSubmit?:any;
  handleSubmitToReviewer?:any;
}
export interface SubmitAsliBro{
  description?:string;
  policyCategoryId?:string;
  title?:string;
}