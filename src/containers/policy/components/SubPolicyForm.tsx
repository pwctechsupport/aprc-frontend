import React, { useEffect, useState } from "react";
import useForm from "react-hook-form";
import { Form, Modal, ModalHeader, ModalBody } from "reactstrap";
import { oc } from "ts-optchain";
import {
  useReferencesQuery,
  useResourcesQuery,
  useItSystemsQuery,
  useBusinessProcessesQuery
} from "../../../generated/graphql";
import Button from "../../../shared/components/Button";
import Input from "../../../shared/components/forms/Input";
import Select, { FormSelect } from "../../../shared/components/forms/Select";
import TextEditor from "../../../shared/components/forms/TextEditor";
import { toLabelValue } from "../../../shared/formatter";
import LoadingSpinner from "../../../shared/components/LoadingSpinner";

const SubPolicyForm = ({
  onSubmit,
  defaultValues,
  submitting
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

  const itSystemsQ = useItSystemsQuery();
  const itSystemsOptions = oc(itSystemsQ.data)
    .itSystems.collection([])
    .map(toLabelValue);

  const businessProcessesQ = useBusinessProcessesQuery();
  const businessProcessesOptions = oc(businessProcessesQ.data)
    .businessProcesses.collection([])
    .map(toLabelValue);

  useEffect(() => {
    register({ name: "parentId" });
    register({ name: "referenceIds" });
    register({ name: "description", required: true });
  }, [register]);

  function handleReferenceChange(multiSelect: any) {
    console.log("ha", multiSelect);
    if (multiSelect) {
      setValue(
        "referenceIds",
        multiSelect.map((a: any) => a.value)
      );
    }
  }

  function handleEditorChange(event: any, editor: any) {
    const data = editor.getData();
    setValue("description", data);
  }

  function submit(values: SubPolicyFormValues) {
    console.log("values:", values);
    onSubmit && onSubmit(values);
    setShowAttrs(false);
  }

  if (resourceQ.loading || referenceData.loading) {
    return <LoadingSpinner centered />;
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
      <Form onSubmit={handleSubmit(submit)}>
        <Input
          name="title"
          label="Sub-Policy Title"
          innerRef={register({ required: true })}
          error={errors.title && errors.title.message}
        />
        <Select
          label="Sub-Policy Reference"
          onChange={handleReferenceChange}
          options={references}
          isMulti
          defaultValue={defaultReference}
        />
        <TextEditor
          data={watch("description")}
          onChange={handleEditorChange}
          invalid={errors.description ? true : false}
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

          <FormSelect
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
          />

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

export interface SubPolicyFormProps {
  onSubmit?: (values: SubPolicyFormValues) => void;
  defaultValues: SubPolicyFormValues;
  submitting?: boolean;
}

export interface SubPolicyFormValues {
  parentId: string;
  title: string;
  description: string;
  referenceIds?: string[];
  resourceIds?: string[];
  itSystemIds?: string[];
  businessProcessIds?: string[];
}
