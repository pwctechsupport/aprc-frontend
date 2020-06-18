import React from "react";
import { toast } from "react-toastify";
import { useCreateBusinessProcessMutation } from "../../generated/graphql";
import BusinessProcessForm from "./components/BusinessProcessForm";

const CreateBusinessProcess = ({ createBpModal }: any) => {
  const [createBP] = useCreateBusinessProcessMutation({
    onCompleted: () => {
      toast.success("Create Success");
      createBpModal(false);
    },
    onError: () => toast.error("Create Failed"),
    refetchQueries: [
      "businessProcesses",
      "businessProcessTree",
      "adminBusinessProcessTree",
    ],
  });
  const submit = async (values: CreateBPFormValues, { reset }: any) => {
    try {
      await createBP({ variables: { input: { name: values.name } } });
      reset();
    } catch (error) {}
  };
  return <BusinessProcessForm onSubmit={submit} />;
};

export default CreateBusinessProcess;

interface CreateBPFormValues {
  name: string;
}
