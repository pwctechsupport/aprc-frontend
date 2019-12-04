import React, { useEffect } from "react";
import { Form } from "reactstrap";
import Input from "../../../shared/components/forms/Input";
import TextEditor from "../../../shared/components/forms/TextEditor";
import Select from "../../../shared/components/forms/Select";
import Button from "../../../shared/components/Button";
import useForm from "react-hook-form";
import {
  useReferencesQuery,
  useCreateSubPolicyMutation
} from "../../../generated/graphql";
import { oc } from "ts-optchain";
import { toLabelValue } from "../../../shared/formatter";
import { toast } from "react-toastify";

const SubPolicyForm = ({ parentId }: SubPolicyFormProps) => {
  const { register, handleSubmit, setValue } = useForm();
  const referenceData = useReferencesQuery({ variables: { filter: {} } });
  const [createSubPolicy] = useCreateSubPolicyMutation({
    onCompleted: () => toast.success("Berhasil"),
    onError: () => toast.error("Gagal")
  });

  function submit(values: any) {
    createSubPolicy({
      variables: {
        input: {
          title: values.title,
          description: values.description,
          parentId
        }
      }
    });
    console.log("values", values);
  }

  useEffect(() => {
    register({ name: "reference" });
    register({ name: "description" });
  }, [register]);

  function handleReferenceChange({ value }: any) {
    setValue("reference", value);
  }

  function handleEditorChange(event: any, editor: any) {
    const data = editor.getData();
    setValue("description", data);
  }

  const references = oc(referenceData)
    .data.references.collection([])
    .map(toLabelValue);
  console.log("references", references);

  return (
    <div>
      <Form onSubmit={handleSubmit(submit)}>
        <Input name="title" label="Sub-Policy Title" innerRef={register} />
        <Select
          label="Sub-Policy Reference"
          onChange={handleReferenceChange}
          options={references}
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

interface SubPolicyFormProps {
  parentId: string;
}
