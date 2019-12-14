import get from "lodash/get";
import React from "react";
import { RouteComponentProps } from "react-router";
import { toast } from "react-toastify";
import {
  PolicyDocument,
  Status,
  useCreateSubPolicyMutation
} from "../../generated/graphql";
import HeaderWithBackButton from "../../shared/components/HeaderWithBack";
import SubPolicyForm, { SubPolicyFormValues } from "./components/SubPolicyForm";

const CreateSubPolicy = ({ match, history }: RouteComponentProps) => {
  const id = get(match, "params.id", "");
  const [create] = useCreateSubPolicyMutation({
    onCompleted: () => {
      toast.success("Berhasil");
      history.goBack();
    },
    onError: () => toast.error("Gagal"),
    refetchQueries: [{ query: PolicyDocument, variables: { id } }],
    awaitRefetchQueries: true
  });

  function createSubPolicy(values: SubPolicyFormValues) {
    create({
      variables: {
        input: {
          parentId: values.parentId,
          title: values.title,
          description: values.description,
          referenceIds: values.referenceIds,
          status: values.status
        }
      }
    });
  }

  const defaultValues = {
    parentId: id,
    title: "",
    description: "",
    referenceIds: [],
    status: Status.Draft
  };

  return (
    <div>
      <HeaderWithBackButton heading="Create Sub-Policy" />
      <SubPolicyForm onSubmit={createSubPolicy} defaultValues={defaultValues} />
    </div>
  );
};

export default CreateSubPolicy;
