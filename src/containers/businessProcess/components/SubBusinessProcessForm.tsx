import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Form, FormFeedback, FormText, Input } from "reactstrap";
import { useCreateSubBusinessProcessMutation } from "../../../generated/graphql";
import DialogButton from "../../../shared/components/DialogButton";
import { notifyGraphQLErrors } from "../../../shared/utils/notif";

const SubBusinessProcessForm = ({ parentId }: SubBusinessProcessFormProps) => {
  const { register, handleSubmit, reset } = useForm();
  const [error, setError] = useState(false);
  const [createSubBusinessProcess] = useCreateSubBusinessProcessMutation({
    onCompleted: () => {
      toast.success("Create Success");
      reset();
    },
    onError: notifyGraphQLErrors,
    refetchQueries: [
      "businessProcess",
      "businessProcesses",
      "adminBusinessProcessTree",
    ],
  });

  function submit(values: any) {
    if (values.name) {
      setError(false);
      createSubBusinessProcess({
        variables: {
          input: {
            name: values.name,
            parentId,
          },
        },
      });
    } else {
      setError(true);
    }
  }
  return (
    <>
      <Form
        onSubmit={handleSubmit(submit)}
        className="d-flex align-items-center mb-4"
      >
        <Input
          name="name"
          placeholder="Sub business process name*"
          innerRef={register}
          required
          invalid={error}
        />

        <DialogButton
          type="button"
          onConfirm={handleSubmit(submit)}
          className="button pwc ml-3"
          message="Add sub business process?"
        >
          Add
        </DialogButton>
      </Form>
      <FormFeedback>{error}</FormFeedback>
      <FormText style={{ position: "relative", top: -15 }}>
        {error && "Sub Business Process is a required field"}
      </FormText>
    </>
  );
};

export default SubBusinessProcessForm;

interface SubBusinessProcessFormProps {
  parentId: string;
}
