import { capitalCase } from "capital-case";
import React, { useEffect, useState } from "react";
import useForm from "react-hook-form";
import { Form } from "reactstrap";
import { oc } from "ts-optchain";
import {
  Status,
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
import { prepDefaultValue, toLabelValue } from "../../../shared/formatter";
import Modal from "../../../shared/components/Modal";

const SubPolicyForm = ({
  onSubmit,
  defaultValues,
  submitting,
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
    register({ name: "status", required: true });
  }, [register]);

  function handleReferenceChange(multiSelect: any) {
    if (multiSelect) {
      setValue(
        "referenceIds",
        multiSelect.map((a: any) => a.value)
      );
    }
  }

  function handleChange(name: string) {
    return function(value: any) {
      if (value) {
        setValue(name, value.value);
      }
    };
  }

  function handleEditorChange(data: string) {
    setValue("description", data);
  }

  function submit(values: SubPolicyFormValues) {
    onSubmit && onSubmit({ ...values, ...attr });
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
  const status = oc(defaultValues).status();

  return (
    <div>
      <Form>
        <Input
          name="title"
          label="Sub-Policy Title"
          innerRef={register({ required: true })}
          error={errors.title && errors.title.message}
        />
        <div className="mb-3">
          <label>Policy Description</label>
          <TextEditor
            data={watch("description")}
            onChange={handleEditorChange}
            invalid={errors.description ? true : false}
          />
        </div>
        <Select
          label="Sub-Policy Reference"
          onChange={handleReferenceChange}
          options={references}
          isMulti
          defaultValue={defaultReference}
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
          <Button
            type="button"
            onClick={() => setShowAttrs(true)}
            className="pwc mr-2"
          >
            Insert Attributes
          </Button>
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

  const controlsQ = useControlsQuery();
  const controlsOptions = oc(controlsQ.data)
    .controls.collection([])
    .map(({ id, description }) => ({ label: description || "", value: id }));

  const risksQ = useRisksQuery();
  const risksOptions = oc(risksQ.data)
    .risks.collection([])
    .map(toLabelValue);

  if (
    resourceQ.loading ||
    businessProcessesQ.loading ||
    controlsQ.loading ||
    risksQ.loading
  ) {
    return <LoadingSpinner centered size={30} />;
  }

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
        label="Business Processes"
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
        label="Control"
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
        label="Risk"
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
// Construct Options
// -------------------------------------------------------------------------

const statuses = Object.entries(Status).map(([label, value]) => ({
  label: capitalCase(value),
  value
}));

// -------------------------------------------------------------------------
// Type Definitions
// -------------------------------------------------------------------------

export interface SubPolicyFormProps {
  onSubmit?: (values: SubPolicyFormValues) => void;
  defaultValues: SubPolicyFormValues;
  submitting?: boolean;
  isAdmin?: boolean;
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
  status: Status;
}

type SubPolicyModalFormValues = Pick<
  SubPolicyFormValues,
  "resourceIds" | "businessProcessIds" | "controlIds" | "riskIds"
>;
