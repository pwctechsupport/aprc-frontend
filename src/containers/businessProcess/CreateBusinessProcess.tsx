import React from "react";
import useForm from "react-hook-form";
import { Form, Input } from "reactstrap";
import Button from "../../shared/components/Button";
import {
  useCreateBusinessProcessMutation,
  BusinessProcessesDocument
} from "../../generated/graphql";
import { toast } from "react-toastify";

const CreateBusinessProcess = () => {
  const { register, handleSubmit, reset } = useForm<CreateBPFormValues>();
  const [createBP] = useCreateBusinessProcessMutation({
    onCompleted: () => {
      toast.success("Create Success");
      reset();
    },
    onError: () => toast.error("Create Failed"),
    refetchQueries: [
      { query: BusinessProcessesDocument, variables: { filter: {} } }
    ]
  });
  const submit = (values: CreateBPFormValues) => {
    createBP({ variables: { input: { name: values.name } } });
  };
  return (
    <Form
      onSubmit={handleSubmit(submit)}
      className="d-flex align-items-center mb-4"
    >
      <Input
        name="name"
        placeholder="Business Process Name"
        innerRef={register}
        required
      />
      <Button type="submit" className="pwc ml-3">
        Add
      </Button>
    </Form>
  );
};

export default CreateBusinessProcess;

interface CreateBPFormValues {
  name: string;
}
