import React, { Fragment, useEffect } from "react";
import useForm from "react-hook-form";
import { Form } from "reactstrap";
import { oc } from "ts-optchain";
import * as yup from "yup";
import {
  EnumListsDocument,
  // Category,
  PoliciesDocument,
  useResourceFormMasterQuery,
  ControlsDocument,
  ControlsQuery,
  PoliciesQuery,
  EnumListsQuery
} from "../../../generated/graphql";
import DialogButton from "../../../shared/components/DialogButton";
import AsyncSelect from "../../../shared/components/forms/AsyncSelect";
import Input from "../../../shared/components/forms/Input";
import Select from "../../../shared/components/forms/Select";
import LoadingSpinner from "../../../shared/components/LoadingSpinner";
import {
  Suggestions,
  Suggestion,
  toBase64,
  toLabelValue
} from "../../../shared/formatter";
import useLazyQueryReturnPromise from "../../../shared/hooks/useLazyQueryReturnPromise";
import ApolloSelect from "../../../shared/components/forms/ApolloSelect";
import { DocumentNode } from "graphql";

const ResourceForm = ({
  defaultValues,
  onSubmit,
  submitting
}: ResourceFormProps) => {
  const { register, setValue, handleSubmit, errors, watch } = useForm<
    ResourceFormValues
  >({ defaultValues, validationSchema });

  const { data, ...mastersQ } = useResourceFormMasterQuery();
  const masters = {
    controls: oc(data)
      .controls.collection([])
      .map(p => ({
        ...p,
        value: String(p.id),
        label: String(p.description)
      })),
    businessProcesses: oc(data)
      .businessProcesses.collection([])
      .map(toLabelValue)
  };

  useEffect(() => {
    register({ name: "controlId", required: true, type: "custom" });
    register({ name: "businessProcessId", required: true, type: "custom" });
    register({ name: "resuploadBase64", type: "custom" });
    register({ name: "resuploadFileName" });
  }, [register]);

  function handleChangeSelect(name: keyof ResourceFormValues) {
    return function(e: any) {
      if (e) setValue(name, e.value, true);
    };
  }

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
    console.log("values:", data);
    // onSubmit && onSubmit(data);
  }

  // const getPolicies = useLazyQueryReturnPromise(PoliciesDocument);
  // async function handleGetPolicies(
  //   title_cont: string = ""
  // ): Promise<Suggestions> {
  //   try {
  //     const { data } = await getPolicies({
  //       filter: { title_cont }
  //     });
  //     return oc(data)
  //       .policies.collection([])
  //       .map(toLabelValue);
  //   } catch (error) {
  //     return [];
  //   }
  // }

  // const getCategories = useLazyQueryReturnPromise(EnumListsDocument);
  // async function handleGetCategories(
  //   name_cont: string = ""
  // ): Promise<Suggestions> {
  //   try {
  //     const { data } = await getCategories({
  //       filter: { name_cont, category_type_eq: "Category" }
  //     });
  //     const options = data?.enumLists?.collection?.map(toLabelValue) || [];
  //     console.log("options: ", options);
  //     return options;
  //   } catch (error) {
  //     return [];
  //   }
  // }

  const handleGetCategories = useLoadCategories();
  const handleGetPolicies = useLoadPolicies();
  const handleGetControls = useLoadControls();

  if (mastersQ.loading) {
    return (
      <div>
        <LoadingSpinner size={30} centered />
      </div>
    );
  }

  const selectedCategory = watch("category", "");
  console.log("selectedCategory:", selectedCategory);

  const name = oc(defaultValues).name("");

  return (
    <Form onSubmit={handleSubmit(submit)}>
      <Input
        name="name"
        label="Name"
        innerRef={register({ required: true })}
        error={errors.name && errors.name.message}
      />
      <AsyncSelect
        name="category"
        label="Category"
        register={register}
        setValue={setValue}
        cacheOptions
        loadOptions={handleGetCategories}
        defaultOptions
      />
      {selectedCategory === "Flowchart" ? (
        <Select
          name="businessProcessId"
          label="Related sub-business Process"
          options={masters.businessProcesses}
          defaultValue={
            defaultValues &&
            masters.businessProcesses.find(
              c => c.value === defaultValues.businessProcessId
            )
          }
          onChange={handleChangeSelect("businessProcessId")}
          error={oc(errors).businessProcessId.message()}
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
            defaultValue={defaultValues?.policies || []}
            isMulti
          />
          <AsyncSelect
            name="controlId"
            label="Related Control"
            register={register}
            setValue={setValue}
            cacheOptions
            loadOptions={handleGetControls}
            defaultOptions
            defaultValue={defaultValues?.controls || []}
            isMulti
          />
          {/* <Select
            name="controlId"
            label="Related Control"
            options={masters.controls}
            defaultValue={
              defaultValues &&
              masters.controls.find(c => c.value === defaultValues.controlId)
            }
            onChange={handleChangeSelect("controlId")}
            error={oc(errors).controlId.message()}
          /> */}
        </Fragment>
      )}
      <Input type="file" label="Upload" onChange={handleChangeFile} />

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
  category: yup.string().required()
});

// ==========================================
// Type Definitions
// ==========================================

interface ResourceFormProps {
  defaultValues?: ResourceFormDefaultValues;
  onSubmit?: (data: ResourceFormValues) => void;
  submitting?: boolean;
}

export interface ResourceFormValues {
  name: string;
  category: string;
  policyIds: string[];
  controlId: string;
  businessProcessId?: string;
  resuploadBase64?: any;
  resuploadFileName?: string;
  resuploadUrl?: string;
}

export interface ResourceFormDefaultValues {
  name?: string;
  category?: string;
  policies?: Suggestions;
  controls?: Suggestions;
  policyIds?: string[];
  // controlId?: Suggestion;
  businessProcessId?: string;
  resuploadBase64?: any;
  resuploadFileName?: string;
  resuploadUrl?: string;
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
      return oc(data)
        .policies.collection([])
        .map(toLabelValue);
    } catch (error) {
      return [];
    }
  }
  return getSuggestions;
}

function useLoadControls() {
  const query = useLazyQueryReturnPromise<ControlsQuery>(ControlsDocument);
  async function getSuggestions(title_cont: string = ""): Promise<Suggestions> {
    try {
      const { data } = await query({
        filter: { title_cont }
      });
      return oc(data)
        .controls.collection([])
        .map(toLabelValue);
    } catch (error) {
      return [];
    }
  }
  return getSuggestions;
}
