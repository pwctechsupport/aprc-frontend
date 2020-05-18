import React, { Fragment, useState } from "react";
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
  Tag,
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
  toLabelValue,
} from "../../../shared/formatter";
import useDialogBox from "../../../shared/hooks/useDialogBox";
import useLazyQueryReturnPromise from "../../../shared/hooks/useLazyQueryReturnPromise";
import DialogButton from "../../../shared/components/DialogButton";
import styled from "styled-components";
// import Flowchart from "../../riskAndControl/components/Flowchart";

interface ResourceFormProps {
  base64File?: any;
  defaultValues?: ResourceFormValues;
  onSubmit?: (data: ResourceFormValues) => void;
  submitting?: boolean;
  isDraft?: boolean;
  imagePreviewUrl?: string;
  resourceId?: string;
  bpId?: string;
  resourceTitle?: string;
  toggleEditMode?: any;
  isCreate?: boolean;
  history?: any;
  policy?: boolean;
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
  base64File,
  onSubmit,
  submitting,
  toggleEditMode,
  history,
  isCreate,
  policy,
}: // isDraft,
ResourceFormProps) {
  const dialogBox = useDialogBox();
  const name = defaultValues?.name;
  const { register, setValue, handleSubmit, errors, watch } = useForm<
    ResourceFormValues
  >({
    defaultValues,
    validationSchema,
  });

  const [activityType, setActivityType] = useState(
    `${defaultValues?.resuploadBase64 ? "attachment" : "text"}`
  );
  const [tags, setTags] = useState(defaultValues?.tagsAttributes || []);
  const [preview, setPreview] = useState<string | null>(
    defaultValues ? `${APP_ROOT_URL}${defaultValues.resuploadUrl}` : ""
  );

  function submit(data: ResourceFormValues) {
    if (data.resuploadBase64) {
      if (
        (data.resuploadBase64 &&
          data.category?.value === "Flowchart" &&
          data.resuploadBase64.includes("application/pdf")) ||
        (data.resuploadBase64 &&
          data.category?.value === "Flowchart" &&
          data.resuploadBase64.includes(
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          ))
      ) {
      } else {
        dialogBox({
          text: name ? `Update Resource "${name}"?` : "Create Resource?",
          callback: () => onSubmit?.({ ...data, tagsAttributes: tags }),
        });
      }
    } else {
      dialogBox({
        text: name ? `Update Resource "${name}"?` : "Create Resource?",
        callback: () => onSubmit?.({ ...data, tagsAttributes: tags }),
      });
    }
  }

  const handleGetCategories = useLoadCategories(policy);
  const handleGetPolicies = useLoadPolicies();
  const handleGetControls = useLoadControls();
  const handleGetBps = useLoadBps();
  const selectedCategory = watch("category");
  const selectedBusinessProcess = watch("businessProcessId");
  const watchresuploadBase64 = watch("resuploadBase64");
  return (
    <Form onSubmit={handleSubmit(submit)}>
      <Input
        name="name"
        label="Name*"
        placeholder="Name"
        innerRef={register({ required: true })}
        error={errors.name && errors.name.message}
      />
      <AsyncCreatableSelect
        name="category"
        label="Category*"
        isDisabled={defaultValues?.businessProcessId ? true : false}
        register={register}
        setValue={setValue}
        cacheOptions
        loadOptions={handleGetCategories}
        defaultOptions
        defaultValue={defaultValues?.category}
        error={errors.category && (errors.category as any)?.label.message}
      />

      {selectedCategory?.value === "Flowchart" ? (
        <AsyncSelect
          name="businessProcessId"
          label="Related Sub-business Process*"
          register={register}
          setValue={setValue}
          cacheOptions
          loadOptions={handleGetBps}
          defaultOptions
          defaultValue={defaultValues?.businessProcessId}
          error={
            errors.policyIds &&
            "Related sub-business process is a required field"
          }
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
            error={errors.policyIds && errors.policyIds.message}
            isResourcePolicy
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
            error={errors.policyIds && errors.policyIds.message}
          />
        </Fragment>
      )}
      <span className="mt-2 mb-3">Upload*</span>
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
            error={errors.resuploadLink && errors.resuploadLink.message}
          />
        ) : selectedCategory?.value !== "Flowchart" &&
          activityType !== "text" ? (
          <Fragment>
            <FileInput
              name="resuploadBase64"
              register={register}
              setValue={setValue}
              onFileSelect={setPreview}
              errorForm={errors.resuploadLink && errors.resuploadLink.message}
            />
            {watchresuploadBase64 === base64File &&
            defaultValues?.resuploadBase64?.includes("application/pdf") ? (
              <div>{defaultValues.name}.pdf</div>
            ) : null}
            {watchresuploadBase64 === base64File &&
            defaultValues?.resuploadBase64?.includes("data:image") ? (
              <ResourceBoxImagePreview
                src={`${APP_ROOT_URL}${defaultValues?.resuploadUrl}`}
              ></ResourceBoxImagePreview>
            ) : null}
            {watchresuploadBase64 === base64File &&
            defaultValues?.resuploadBase64?.includes(
              "data:application/vnd.openxmlformats-officedocument"
            ) ? (
              <div>{defaultValues.name}.docx</div>
            ) : null}
            {watchresuploadBase64 === base64File &&
            defaultValues?.resuploadBase64?.includes(
              "data:application/msword"
            ) ? (
              <div>{defaultValues.name}.doc</div>
            ) : null}
          </Fragment>
        ) : (
          <FileInput
            name="resuploadBase64"
            flowchart
            register={register}
            setValue={setValue}
            onFileSelect={setPreview}
            errorForm={errors.resuploadLink && errors.resuploadLink.message}
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
        {isCreate ? (
          <DialogButton
            className="black px-5 ml-2"
            style={{ backgroundColor: "rgba(233, 236, 239, 0.5)" }}
            onConfirm={() => history.replace(`/resources`)}
            isCreate
          >
            Cancel
          </DialogButton>
        ) : (
          <DialogButton
            className="black px-5 ml-2"
            style={{ backgroundColor: "rgba(233, 236, 239, 0.5)" }}
            onConfirm={toggleEditMode}
            isEdit
          >
            Cancel
          </DialogButton>
        )}
      </div>
    </Form>
  );
}

// ==========================================
// Form Validation
// ==========================================

const validationSchema = yup.object().shape({
  name: yup.string().required("Name is a required field"),
  category: yup.object().shape({
    label: yup.string().required("Category is a required field"),
    value: yup.string().required(),
  }),
  controlIds: yup.array(),
  businessProcessId: yup.object(),
  policyIds: yup.array().when(["controlIds", "businessProcessId"], {
    is: undefined,
    then: yup
      .array()
      .required("Please select related policies or related control"),
    otherwise: yup.array(),
  }),
  resuploadBase64: yup.string(),
  resuploadLink: yup.string().when("resuploadBase64", {
    is: undefined,
    then: yup.string().required("Please insert URL or attachment"),
    otherwise: yup.string(),
  }),
});
// ==========================================
// Custom Hooks
// ==========================================

function useLoadCategories(policy?: any) {
  const query = useLazyQueryReturnPromise<EnumListsQuery>(EnumListsDocument);
  async function getSuggestions(name_cont: string = ""): Promise<Suggestions> {
    try {
      const { data } = await query({
        filter: { name_cont, category_type_eq: "Category" },
      });
      return policy
        ? data.enumLists?.collection
            .map(toLabelValue)
            .filter((a) => a.value !== "Flowchart") || []
        : data.enumLists?.collection.map(toLabelValue) || [];
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
        filter: { title_cont },
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
        filter: { description_cont },
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
        filter: { name_cont },
      });
      return data.businessProcesses?.collection.map(toLabelValue) || [];
    } catch (error) {
      return [];
    }
  }
  return getSuggestions;
}
const ResourceBoxImagePreview = styled.img`
  max-width: 100%;
  max-height: 30vh;
  border-image-repeat: stretch;
`;
