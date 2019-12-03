import React, { useEffect } from "react";
import Input from "../../../shared/components/forms/Input";
import useForm from "react-hook-form";
import TextEditor from "../../../shared/components/forms/TextEditor";
import { Form } from "reactstrap";
import Button from "../../../shared/components/Button";
import * as yup from "yup";

const PolicyForm = ({
  onSubmit,
  defaultValues,
  submitting
}: PolicyFormProps) => {
  const { register, setValue, watch, errors, handleSubmit } = useForm<
    PolicyFormValues
  >({
    validationSchema,
    defaultValues
  });

  function onChangeEditor(event: any, editor: any) {
    const data = editor.getData();
    setValue("description", data);
  }

  useEffect(() => {
    register({ name: "description", required: true });
  }, [register]);

  function submit(values: PolicyFormValues) {
    console.log("values:", values);
    onSubmit && onSubmit(values);
  }

  return (
    <div>
      <Form onSubmit={handleSubmit(submit)}>
        <Input
          name="title"
          label="Title"
          innerRef={register({ required: true })}
        />
        <Input
          name="policyCategoryId"
          label="Policy Category"
          innerRef={register({ required: true })}
        />

        <TextEditor
          data={watch("description")}
          onChange={onChangeEditor}
          invalid={errors.description ? true : false}
        />

        <div className="d-flex justify-content-end mt-3">
          <Button
            type="submit"
            color="primary"
            loading={submitting}
            className="px-5"
          >
            {defaultValues ? "Simpan" : "Submit"}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default PolicyForm;

const validationSchema = yup.object().shape({
  title: yup.string().required(),
  description: yup.string().required(),
  policyCategoryId: yup.string().required()
});

// ---------------------------------------------------
// Type Definition
// ---------------------------------------------------

export interface PolicyFormValues {
  title: string;
  description: string;
  policyCategoryId: string;
}

export interface PolicyFormProps {
  imagePreviewUrl?: string;
  onCancel?: () => void;
  onSubmit?: (data: PolicyFormValues) => void;
  submitting?: boolean;
  defaultValues?: PolicyFormValues;
}
