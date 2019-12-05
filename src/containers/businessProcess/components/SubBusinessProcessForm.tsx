import React from "react";
import { useCreateSubBusinessProcessMutation } from "../../../generated/graphql";
import { toast } from "react-toastify";
import { Form, Input } from "reactstrap";
import Button from "../../../shared/components/Button";
import useForm from "react-hook-form";

const SubBusinessProcessForm = ({ parentId }: SubBusinessProcessFormProps) => {
  const { register, handleSubmit, reset } = useForm();
  const [createSubBusinessProcess] = useCreateSubBusinessProcessMutation({
    onCompleted: () => {
      toast.success("Berhasil");
      reset();
    },
    onError: error => {
      toast.error("Gagal");
    },
    refetchQueries: ["businessProcess", "businessProcesses"]
  });

  function submit(values: any) {
    createSubBusinessProcess({
      variables: {
        input: {
          name: values.name,
          parentId
        }
      }
    });
  }
  return (
    <Form
      onSubmit={handleSubmit(submit)}
      className="d-flex align-items-center mb-4"
    >
      <Input
        name="name"
        placeholder="Sub Business Process Name"
        innerRef={register}
        required
      />
      <Button type="submit" className="pwc ml-3">
        Add
      </Button>
    </Form>
  );
};

export default SubBusinessProcessForm;

interface SubBusinessProcessFormProps {
  parentId: string;
}
