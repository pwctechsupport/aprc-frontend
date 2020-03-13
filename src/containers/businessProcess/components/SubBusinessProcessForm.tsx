import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Form, Input } from "reactstrap";
import { useCreateSubBusinessProcessMutation } from "../../../generated/graphql";
import DialogButton from "../../../shared/components/DialogButton";

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
      <DialogButton
        type="button"
        onConfirm={handleSubmit(submit)}
        className="soft orange ml-3"
        color=""
        message="Add sub business process?"
      >
        Add
      </DialogButton>
    </Form>
  );
};

export default SubBusinessProcessForm;

interface SubBusinessProcessFormProps {
  parentId: string;
}
