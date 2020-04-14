import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Form } from "reactstrap";
import { oc } from "ts-optchain";
import {
  useBusinessProcessesQuery,
  useControlsQuery,
  useReferencesQuery,
  useResourcesQuery,
  useRisksQuery
} from "../../../generated/graphql";
import Button from "../../../shared/components/Button";
import DialogButton from "../../../shared/components/DialogButton";
import Input from "../../../shared/components/forms/Input";
import Select, { FormSelect } from "../../../shared/components/forms/Select";
import TextEditor from "../../../shared/components/forms/TextEditor";
import LoadingSpinner from "../../../shared/components/LoadingSpinner";
import Modal from "../../../shared/components/Modal";
import { toLabelValue } from "../../../shared/formatter";

const SubPolicyForm = ({
  onSubmit,
  defaultValues,
  submitting,
  onSubmitDraft,
  premise,
  submittingDraft,
  isAdmin = true
}: SubPolicyFormProps) => {
  const {
    resourceIds,
    businessProcessIds,
    controlIds,
    riskIds
  } = defaultValues;
  const [showAttrs, setShowAttrs] = useState(false);
  const [attr, setAttr] = useState<SubPolicyModalFormValues>({
    resourceIds,
    businessProcessIds,
    controlIds,
    riskIds
  });

  const { register, handleSubmit, setValue, errors, watch } = useForm<
    SubPolicyFormValues
  >({
    defaultValues
  });

  const referenceData = useReferencesQuery({ variables: { filter: {} } });
  const references = oc(referenceData)
    .data.references.collection([])
    .map(toLabelValue);

  useEffect(() => {
    register({ name: "parentId" });
    register({ name: "referenceIds" });
    register({ name: "description", required: true });
  }, [register]);

  function handleReferenceChange(multiSelect: any) {
    if (multiSelect) {
      setValue(
        "referenceIds",
        multiSelect.map((a: any) => a.value)
      );
    }
  }

  function handleEditorChange(data: string) {
    setValue("description", data);
  }

  function submit(values: SubPolicyFormValues) {
    onSubmit && onSubmit({ ...values, ...attr });
  }
  function submitDraft(values: SubPolicyFormValues) {
    onSubmitDraft && onSubmitDraft({ ...values, ...attr });
  }

  function onSubmitModal(values: SubPolicyModalFormValues) {
    setAttr(values);
    setShowAttrs(false);
  }

  if (referenceData.loading) {
    return <LoadingSpinner centered size={30} />;
  }

  const defaultReference = references.filter(reference => {
    return oc(defaultValues)
      .referenceIds([])
      .includes(reference.value);
  });
  return (
    <div>
      <Form>
        <Input
          name="title"
          label="Sub-Policy Title*"
          placeholder="Sub-Policy Title"
          innerRef={register({ required: true })}
          error={errors.title && errors.title.message}
        />
        <div className="mb-3">
          <label>Policy Description*</label>
          <TextEditor
            data={watch("description")}
            onChange={handleEditorChange}
            invalid={errors.description ? true : false}
          />
        </div>
        <Select
          label="Sub-Policy Reference*"
          placeholder="Sub-Policy Reference"
          onChange={handleReferenceChange}
          options={references}
          isMulti
          defaultValue={defaultReference}
        />

        <div className="d-flex justify-content-end mt-3">
          <Button
            type="button"
            onClick={() => setShowAttrs(true)}
            className="pwc mr-2"
          >
            Insert Attributes
          </Button>
          {premise ? (
            <DialogButton
              color="primary"
              loading={submittingDraft}
              className="pwc px-5"
              onConfirm={handleSubmit(submitDraft)}
              message={
                defaultValues.title
                  ? `Save your change on "${defaultValues.title}"?`
                  : "Create Sub-Policy?"
              }
            >
              Save As Draft
            </DialogButton>
          ) : (
            <DialogButton
              color="primary"
              loading={submitting}
              className="pwc px-5"
              onConfirm={handleSubmit(submit)}
              message={
                defaultValues.title
                  ? `Save your change on "${defaultValues.title}"?`
                  : "Create Sub-Policy?"
              }
            >
              Save
            </DialogButton>
          )}
        </div>
      </Form>

      {/* MODAL */}
      <Modal
        isOpen={showAttrs}
        size="xl"
        toggle={() => setShowAttrs(!showAttrs)}
        title="Insert Attributes"
      >
        <SubPolicyAttributeForm
          defaultValues={attr}
          onSubmit={onSubmitModal}
          onCancel={() => setShowAttrs(false)}
        />
      </Modal>
    </div>
  );
};

export default SubPolicyForm;

// -------------------------------------------------------------------------
// Construct Modal Form Component
// -------------------------------------------------------------------------

const SubPolicyAttributeForm = ({
  defaultValues,
  onSubmit,
  onCancel
}: {
  defaultValues: SubPolicyModalFormValues;
  onCancel: () => void;
  onSubmit: (v: SubPolicyModalFormValues) => void;
}) => {
  const formModal = useForm<SubPolicyModalFormValues>({
    defaultValues
  });

  const resourceQ = useResourcesQuery();
  const resourceOptions = oc(resourceQ.data)
    .resources.collection([])
    .map(toLabelValue);

  const businessProcessesQ = useBusinessProcessesQuery();
  const businessProcessesOptions = oc(businessProcessesQ.data)
    .businessProcesses.collection([])
    .map(toLabelValue);
  const checkBp = formModal.watch("businessProcessIds");

  const [filter, setFilter] = useState({});

  useEffect(() => {
    setFilter({ business_processes_id_in: checkBp });
  }, [checkBp]);

  const controlsQ = useControlsQuery({
    variables: {
      filter
    },
    fetchPolicy: "network-only"
  });
  const controlsOptions = oc(controlsQ.data)
    .controls.collection([])
    .map(({ id, description }) => ({ label: description || "", value: id }));
  const risksQ = useRisksQuery({
    variables: {
      filter
    },
    fetchPolicy: "network-only"
  });
  const risksOptions = oc(risksQ.data)
    .risks.collection([])
    .map(toLabelValue);

  // if (
  //   resourceQ.loading ||
  //   businessProcessesQ.loading ||
  //   controlsQ.loading ||
  //   risksQ.loading
  // ) {
  //   return <LoadingSpinner centered size={30} />;
  // }

  return (
    <Form>
      <FormSelect
        isMulti
        isLoading={resourceQ.loading}
        name="resourceIds"
        register={formModal.register}
        setValue={formModal.setValue}
        label="Resources"
        options={resourceOptions}
        defaultValue={resourceOptions.filter(res =>
          oc(defaultValues)
            .resourceIds([])
            .includes(res.value)
        )}
      />

      <FormSelect
        isMulti
        isLoading={businessProcessesQ.loading}
        name="businessProcessIds"
        register={formModal.register}
        setValue={formModal.setValue}
        label="Business Processes*"
        placeholder="Business Processes"
        options={businessProcessesOptions}
        defaultValue={businessProcessesOptions.filter(res =>
          oc(defaultValues)
            .businessProcessIds([])
            .includes(res.value)
        )}
      />
      <FormSelect
        isMulti
        isLoading={controlsQ.loading}
        name="controlIds"
        register={formModal.register}
        setValue={formModal.setValue}
        placeholder="Control"
        label="Control*"
        isDisabled={checkBp?.length ? false : true}
        options={controlsOptions}
        defaultValue={controlsOptions.filter(res =>
          oc(defaultValues)
            .controlIds([])
            .includes(res.value)
        )}
      />

      <FormSelect
        isMulti
        isLoading={risksQ.loading}
        name="riskIds"
        register={formModal.register}
        setValue={formModal.setValue}
        placeholder="Risk"
        label="Risk*"
        isDisabled={checkBp?.length ? false : true}
        options={risksOptions}
        defaultValue={risksOptions.filter(res =>
          oc(defaultValues)
            .riskIds([])
            .includes(res.value)
        )}
      />

      <div className=" d-flex justify-content-end">
        <Button
          type="button"
          className="mr-2 cancel"
          onClick={() => onCancel()}
        >
          Cancel
        </Button>

        <Button
          type="button"
          className="pwc px-4"
          onClick={formModal.handleSubmit(onSubmit)}
        >
          Save Attribute
        </Button>
      </div>
    </Form>
  );
};

// -------------------------------------------------------------------------
// Type Definitions
// -------------------------------------------------------------------------

export interface SubPolicyFormProps {
  onSubmit?: (values: SubPolicyFormValues) => void;
  defaultValues: SubPolicyFormValues;
  submitting?: boolean;
  isAdmin?: boolean;
  onSubmitDraft?: any;
  premise?: boolean;
  submittingDraft?: any;
}

export interface SubPolicyFormValues {
  parentId: string;
  title: string;
  description: string;
  referenceIds?: string[];
  resourceIds?: string[];
  businessProcessIds?: string[];
  controlIds?: string[];
  riskIds?: string[];
}

type SubPolicyModalFormValues = Pick<
  SubPolicyFormValues,
  "resourceIds" | "businessProcessIds" | "controlIds" | "riskIds"
>;
