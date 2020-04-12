import React, { Fragment, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Form, Label } from "reactstrap";
import * as yup from "yup";
import {
  BusinessProcessesDocument,
  BusinessProcessesQuery,
  ControlsDocument,
  ControlsQuery,
  EnumListsDocument,
  EnumListsQuery,
  PoliciesDocument,
  PoliciesQuery,
  Tag
} from "../../../generated/graphql";
import { APP_ROOT_URL } from "../../../settings";
import Button from "../../../shared/components/Button";
import AsyncCreatableSelect from "../../../shared/components/forms/AsyncCreatableSelect";
import AsyncSelect from "../../../shared/components/forms/AsyncSelect";
import FileInput from "../../../shared/components/forms/FileInput";
import Input from "../../../shared/components/forms/Input";
import ImageTagger from "../../../shared/components/ImageTagger";
import {
  Suggestion,
  Suggestions,
  toLabelValue
} from "../../../shared/formatter";
import useDialogBox from "../../../shared/hooks/useDialogBox";
import useLazyQueryReturnPromise from "../../../shared/hooks/useLazyQueryReturnPromise";
// import Flowchart from "../../riskAndControl/components/Flowchart";

interface ResourceFormProps {
  defaultValues?: ResourceFormValues;
  onSubmit?: (data: ResourceFormValues) => void;
  submitting?: boolean;
  // isDraft?: boolean;
  // imagePreviewUrl?: string;
  // resourceId?: string;
  // bpId?: string;
  // resourceTitle?: string;
}

export interface ResourceFormValues {
  name?: string;
  category?: Suggestion;
  policyIds?: Suggestions;
  controlIds?: Suggestions;
  businessProcessId?: Suggestion;
  resuploadBase64?: any;
  resuploadUrl?: string;
  resuploadLink?: string;
  tagsAttributes?: Omit<Tag, "createdAt" | "updatedAt">[];
}

export default function ResourceForm({
  defaultValues,
  onSubmit,
  submitting
}: // isDraft,
ResourceFormProps) {
  const dialogBox = useDialogBox();
  const name = defaultValues?.name;
  const { register, setValue, handleSubmit, errors, watch } = useForm<
    ResourceFormValues
  >({
    defaultValues,
    validationSchema
  });
  const [activityType, setActivityType] = useState("text");
  const [tags, setTags] = useState(defaultValues?.tagsAttributes || []);
  const [preview, setPreview] = useState<string | null>(
    defaultValues ? `${APP_ROOT_URL}${defaultValues.resuploadUrl}` : ""
  );

  function submit(data: ResourceFormValues) {
    dialogBox({
      text: name ? `Update Resource "${name}"?` : "Create Resource?",
      callback: () => onSubmit?.({ ...data, tagsAttributes: tags })
    });
  }

  const handleGetCategories = useLoadCategories();
  const handleGetPolicies = useLoadPolicies();
  const handleGetControls = useLoadControls();
  const handleGetBps = useLoadBps();

  const selectedCategory = watch("category");
  const selectedBusinessProcess = watch("businessProcessId");

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
            label="Related Policies*"
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
            label="Related Control*"
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
      {selectedCategory?.value === "Flowchart" ? null : (
        <div className="d-flex ml-4">
          <Label check className="d-flex align-items-center pr-4">
            <Input
              type="radio"
              name="controlActivity_type"
              value="text"
              onChange={() => setActivityType("text")}
              defaultChecked={activityType === "text"}
            />{" "}
            URL
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
      )}

      <div className="mt-1">
        {selectedCategory?.value !== "Flowchart" && activityType === "text" ? (
          <Input
            type="text"
            name="resuploadLink"
            placeholder="Type image URL..."
            innerRef={register}
          />
        ) : (
          <FileInput
            name="resuploadBase64"
            register={register}
            setValue={setValue}
            onFileSelect={setPreview}
          />
        )}
      </div>

      {preview && selectedCategory?.value === "Flowchart" && (
        <div>
          <ImageTagger
            src={preview}
            bpId={selectedBusinessProcess?.value || ""}
            editable
            onTagsChanged={setTags}
            defaultTags={defaultValues?.tagsAttributes}
          />
        </div>
      )}

      <div className="d-flex justify-content-end mt-3">
        <Button
          className="soft red px-5"
          color=""
          loading={submitting}
          message="Create New Resource?"
        >
          {defaultValues?.name ? "Save" : "Submit"}
        </Button>
      </div>
    </Form>
  );
}

// ==========================================
// Form Validation
// ==========================================

const validationSchema = yup.object().shape({
  name: yup.string(),
  category: yup
    .object()
    .shape({
      label: yup.string(),
      value: yup.string()
    })
    .required()
});
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
