import React, { useEffect, useState } from "react";
import useForm from "react-hook-form";
import { Form, Modal, ModalBody, ModalHeader } from "reactstrap";
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
import Input from "../../../shared/components/forms/Input";
import Select, { FormSelect } from "../../../shared/components/forms/Select";
import TextEditor from "../../../shared/components/forms/TextEditor";
import LoadingSpinner from "../../../shared/components/LoadingSpinner";
import { toLabelValue, prepDefaultValue } from "../../../shared/formatter";
import { capitalCase } from "capital-case";

const SubPolicyForm = ({
  onSubmit,
  defaultValues,
  submitting,
  isAdmin = true
}: SubPolicyFormProps) => {
  const { register, handleSubmit, setValue, errors, watch } = useForm<
    SubPolicyFormValues
  >({
    defaultValues
  });
  const [showAttrs, setShowAttrs] = useState(false);
  const referenceData = useReferencesQuery({ variables: { filter: {} } });

  const references = oc(referenceData)
    .data.references.collection([])
    .map(toLabelValue);

  const resourceQ = useResourcesQuery();
  const resourceOptions = oc(resourceQ.data)
    .resources.collection([])
    .map(toLabelValue);

  // const itSystemsQ = useItSystemsQuery();
  // const itSystemsOptions = oc(itSystemsQ.data)
  //   .itSystems.collection([])
  //   .map(toLabelValue);

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

  useEffect(() => {
    register({ name: "parentId" });
    register({ name: "referenceIds" });
    register({ name: "description", required: true });
    register({ name: "status", required: true });
  }, [register]);

  function handleReferenceChange(multiSelect: any) {
    // console.log("ha", multiSelect);
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

  function handleEditorChange(event: any, editor: any) {
    const data = editor.getData();
    setValue("description", data);
  }

  function submit(values: SubPolicyFormValues) {
    onSubmit && onSubmit(values);
    setShowAttrs(false);
  }

  if (resourceQ.loading || referenceData.loading) {
    return <LoadingSpinner centered size={30} />;
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
      <Form onSubmit={handleSubmit(submit)}>
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
          <Button type="submit" className="pwc px-5" loading={submitting}>
            Simpan
          </Button>
        </div>
      </Form>

      <Modal
        isOpen={showAttrs}
        size="xl"
        toggle={() => setShowAttrs(!showAttrs)}
      >
        <ModalHeader toggle={() => setShowAttrs(!showAttrs)}>
          Insert Attributes
        </ModalHeader>
        <ModalBody>
          <FormSelect
            isMulti
            isLoading={resourceQ.loading}
            name="resourceIds"
            register={register}
            setValue={setValue}
            label="Resources"
            options={resourceOptions}
            defaultValue={resourceOptions.filter(res =>
              oc(defaultValues)
                .resourceIds([])
                .includes(res.value)
            )}
          />

          {/* <FormSelect
            isMulti
            isLoading={itSystemsQ.loading}
            name="itSystemIds"
            register={register}
            setValue={setValue}
            label="IT Systems"
            options={itSystemsOptions}
            defaultValue={itSystemsOptions.filter(res =>
              oc(defaultValues)
                .itSystemIds([])
                .includes(res.value)
            )}
          /> */}

          <FormSelect
            isMulti
            isLoading={businessProcessesQ.loading}
            name="businessProcessIds"
            register={register}
            setValue={setValue}
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
            register={register}
            setValue={setValue}
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
            register={register}
            setValue={setValue}
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
              onClick={() => setShowAttrs(false)}
            >
              Cancel
            </Button>

            <Button
              type="button"
              className="pwc px-4"
              onClick={handleSubmit(submit)}
            >
              Simpan
            </Button>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default SubPolicyForm;

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
  itSystemIds?: string[];
  businessProcessIds?: string[];
  controlIds?: string[];
  riskIds?: string[];
  status: Status;
}
