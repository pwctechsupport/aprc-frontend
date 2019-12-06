import React, { useEffect } from "react";
import useForm from "react-hook-form";
import { Form } from "reactstrap";
import { oc } from "ts-optchain";
import { useReferencesQuery } from "../../../generated/graphql";
import Button from "../../../shared/components/Button";
import Input from "../../../shared/components/forms/Input";
import Select from "../../../shared/components/forms/Select";
import TextEditor from "../../../shared/components/forms/TextEditor";
import { toLabelValue } from "../../../shared/formatter";

const SubPolicyForm = ({ onSubmit, defaultValues }: SubPolicyFormProps) => {
  const { register, handleSubmit, setValue, errors } = useForm<
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
  }

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
        />
        <TextEditor onChange={handleEditorChange} />

        <div className="d-flex justify-content-end mt-3">
          <Button type="submit" className="pwc">
            Simpan
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default SubPolicyForm;

export interface SubPolicyFormProps {
  onSubmit?: (values: SubPolicyFormValues) => void;
  defaultValues: SubPolicyFormValues;
}

export interface SubPolicyFormValues {
  parentId: string;
  title: string;
  description: string;
  referenceIds?: string[];
}
