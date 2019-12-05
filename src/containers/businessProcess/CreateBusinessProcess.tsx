import React from "react";
import { toast } from "react-toastify";
import {
  BusinessProcessesDocument,
  useCreateBusinessProcessMutation
} from "../../generated/graphql";
import BusinessProcessForm from "./components/BusinessProcessForm";

const CreateBusinessProcess = () => {
  const [createBP] = useCreateBusinessProcessMutation({
    onCompleted: () => {
      toast.success("Create Success");
    },
    onError: () => toast.error("Create Failed"),
    refetchQueries: [
      { query: BusinessProcessesDocument, variables: { filter: {} } }
    ]
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
