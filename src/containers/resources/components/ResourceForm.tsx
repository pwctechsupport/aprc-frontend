import React, { Fragment, useEffect, useState } from "react";
import { Form, Label } from "reactstrap";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import {
  BusinessProcessesDocument,
  BusinessProcessesQuery,
  ControlsDocument,
  ControlsQuery,
  EnumListsDocument,
  EnumListsQuery,
  PoliciesDocument,
  PoliciesQuery
} from "../../../generated/graphql";
import DialogButton from "../../../shared/components/DialogButton";
import AsyncSelect from "../../../shared/components/forms/AsyncSelect";
import AsyncCreatableSelect from "../../../shared/components/forms/AsyncCreatableSelect";
import Input from "../../../shared/components/forms/Input";
import {
  Suggestion,
  Suggestions,
  toBase64,
  toLabelValue
} from "../../../shared/formatter";
import useLazyQueryReturnPromise from "../../../shared/hooks/useLazyQueryReturnPromise";

const ResourceForm = ({
  defaultValues,
  onSubmit,
  submitting
}: ResourceFormProps) => {
  const { register, setValue, handleSubmit, errors, watch } = useForm<
    ResourceFormValues
  >({ defaultValues, validationSchema });
  const [activityType, setActivityType] = useState("text");

  useEffect(() => {
    register({ name: "resuploadBase64", type: "custom" });
    register({ name: "resuploadFileName" });
  }, [register]);

  async function handleChangeFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setValue("resuploadFileName", e.target.files[0].name);
      setValue(
        "resuploadBase64",
        String(await toBase64(e.target.files[0])),
        true
      );
    }
  }

  function submit(data: ResourceFormValues) {
    onSubmit && onSubmit(data);
  }

  const handleGetCategories = useLoadCategories();
  const handleGetPolicies = useLoadPolicies();
  const handleGetControls = useLoadControls();
  const handleGetBps = useLoadBps();

  const selectedCategory = watch("category");
  const name = defaultValues?.name;

  return (
    <Form onSubmit={handleSubmit(submit)}>
      <Input
        name="name"
        label="Name"
        innerRef={register({ required: true })}
        error={errors.name && errors.name.message}
      />
      <AsyncCreatableSelect
        name="category"
        label="Category"
        register={register}
        setValue={setValue}
        cacheOptions
        loadOptions={handleGetCategories}
        defaultOptions
        defaultValue={defaultValues?.category}
      />
      {selectedCategory?.value === "Flowchart" ? (
        <AsyncSelect
          name="businessProcessId"
          label="Related Sub-business Process"
          register={register}
          setValue={setValue}
          cacheOptions
          loadOptions={handleGetBps}
          defaultOptions
          defaultValue={defaultValues?.businessProcessId}
        />
      ) : (
        <Fragment>
          <AsyncSelect
            name="policyIds"
            label="Related Policies"
            register={register}
            setValue={setValue}
            cacheOptions
            loadOptions={handleGetPolicies}
            defaultOptions
            defaultValue={defaultValues?.policyIds || []}
            isMulti
          />
          <AsyncSelect
            name="controlIds"
            label="Related Control"
            register={register}
            setValue={setValue}
            cacheOptions
            loadOptions={handleGetControls}
            defaultOptions
            defaultValue={defaultValues?.controlIds || []}
            isMulti
          />
        </Fragment>
      )}
      <span className="mt-2 mb-3">Upload</span>
      <div className="d-flex ml-4">
        <Label check className="d-flex align-items-center pr-4">
          <Input
            type="radio"
            name="controlActivity_type"
            value="text"
            onChange={() => setActivityType("text")}
            defaultChecked={activityType === "text"}
          />{" "}
          Image URL
        </Label>
        <Label check className="d-flex align-items-center pl-3">
          <Input
            type="radio"
            name="controlActivity_type"
            value="attachment"
            onChange={() => setActivityType("attachment")}
            defaultChecked={activityType === "attachment"}
          />{" "}
          Attachment
        </Label>
      </div>
      <div className="mt-1">
        {activityType === "text" ? (
          <Input type="text" name="resuploadLink" innerRef={register} />
        ) : (
          <Input type="file" onChange={handleChangeFile} />
        )}
      </div>

      <div className="d-flex justify-content-end mt-3">
        <DialogButton
          onConfirm={handleSubmit(submit)}
          type="button"
          color="primary"
          className="pwc px-5"
          loading={submitting}
          message={name ? `Save changes on "${name}"?` : "Create new resource?"}
        >
          Submit
        </DialogButton>
      </div>
    </Form>
  );
};

export default ResourceForm;

// ==========================================
// Form Validation
// ==========================================

const validationSchema = yup.object().shape({
  name: yup.string().required(),
  category: yup
    .object()
    .shape({
      label: yup.string(),
      value: yup.string()
    })
    .required()
});

// ==========================================
// Type Definitions
// ==========================================

interface ResourceFormProps {
  defaultValues?: ResourceFormValues;
  onSubmit?: (data: ResourceFormValues) => void;
  submitting?: boolean;
}

export interface ResourceFormValues {
  name?: string;
  category?: Suggestion;
  policyIds?: Suggestions;
  controlIds?: Suggestions;
  businessProcessId?: Suggestion;
  resuploadBase64?: any;
  resuploadFileName?: string;
  resuploadUrl?: string;
  resuploadLink?: string;
}

// ==========================================
// Custom Hooks
// ==========================================

function useLoadCategories() {
  const query = useLazyQueryReturnPromise<EnumListsQuery>(EnumListsDocument);
  async function getSuggestions(name_cont: string = ""): Promise<Suggestions> {
    try {
      const { data } = await query({
        filter: { name_cont, category_type_eq: "Category" }
      });
      return data.enumLists?.collection.map(toLabelValue) || [];
    } catch (error) {
      return [];
    }
  }
  return getSuggestions;
}

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

function useLoadControls() {
  const query = useLazyQueryReturnPromise<ControlsQuery>(ControlsDocument);
  async function getSuggestions(
    description_cont: string = ""
  ): Promise<Suggestions> {
    try {
      const { data } = await query({
        filter: { description_cont }
      });
      return (
        data.controls?.collection
          ?.map(({ description, id }) => ({ id, name: description }))
          .map(toLabelValue) || []
      );
    } catch (error) {
      return [];
    }
  }
  return getSuggestions;
}

function useLoadBps() {
  const query = useLazyQueryReturnPromise<BusinessProcessesQuery>(
    BusinessProcessesDocument
  );
  async function getSuggestions(name_cont: string = ""): Promise<Suggestions> {
    try {
      const { data } = await query({
        filter: { name_cont }
      });
      return data.businessProcesses?.collection.map(toLabelValue) || [];
    } catch (error) {
      return [];
    }
  }
  return getSuggestions;
}
