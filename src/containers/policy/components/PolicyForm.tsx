import React, { useEffect } from "react";
import useForm from "react-hook-form";
import { Form } from "reactstrap";
import { oc } from "ts-optchain";
import * as yup from "yup";
import { usePolicyCategoriesQuery, Status } from "../../../generated/graphql";
import Button from "../../../shared/components/Button";
import Input from "../../../shared/components/forms/Input";
import Select from "../../../shared/components/forms/Select";
import TextEditor from "../../../shared/components/forms/TextEditor";

const PolicyForm = ({
  onSubmit,
  defaultValues,
  submitting
}: PolicyFormProps) => {
  const policyCategoriesState = usePolicyCategoriesQuery({
    variables: { filter: {} }
  });
  const { register, setValue, watch, errors, handleSubmit } = useForm<
    PolicyFormValues
  >({
    validationSchema,
    defaultValues
  });

  useEffect(() => {
    register({ name: "policyCategoryId", required: true });
    register({ name: "referenceId" });
    register({ name: "description", required: true });
  }, [register]);

  function onChangeEditor(event: any, editor: any) {
    const data = editor.getData();
    setValue("description", data);
  }

  function handleCategoryChange(e: any) {
    const { value } = e;
    setValue("policyCategoryId", value);
  }

  function submit(values: PolicyFormValues) {
    onSubmit && onSubmit(values);
  }

  const options = oc(policyCategoriesState)
    .data.policyCategories.collection([])
    .map(toLabelValue);
  const policyCategoryId = oc(defaultValues).policyCategoryId("");

  return (
    <div>
      <Form onSubmit={handleSubmit(submit)}>
        <Input
          name="title"
          label="Title"
          innerRef={register({ required: true })}
        />
        <Select
          name="policyCategoryId"
          label="Policy Category"
          options={options}
          innerRef={register({ required: true })}
          onChange={handleCategoryChange}
          defaultValue={options.find(
            option => option.value === policyCategoryId
          )}
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
            className="pwc px-5"
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

const toLabelValue = ({ id, name }: ToLabelValueValues) => ({
  label: name,
  value: id
});

// ---------------------------------------------------
// Type Definition
// ---------------------------------------------------

export interface PolicyFormValues {
  title: string;
  description: string;
  policyCategoryId: string;
  status: Status;
}

export interface PolicyFormProps {
  imagePreviewUrl?: string;
  onCancel?: () => void;
  onSubmit?: (data: PolicyFormValues) => void;
  submitting?: boolean;
  defaultValues?: PolicyFormValues;
  isSubPolicy?: boolean;
}

interface ToLabelValueValues {
  id: string;
  name: string;
}
