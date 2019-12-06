import React from "react";
import SubPolicyForm, { SubPolicyFormValues } from "./components/SubPolicyForm";
import { RouteComponentProps } from "react-router";
import get from "lodash/get";
import HeaderWithBackButton from "../../shared/components/HeaderWithBack";
import { useCreateSubPolicyMutation } from "../../generated/graphql";
import { toast } from "react-toastify";

const CreateSubPolicy = ({ match }: RouteComponentProps) => {
  const id = get(match, "params.id", "");
  const [create] = useCreateSubPolicyMutation({
    onCompleted: () => toast.success("Berhasil"),
    onError: () => toast.error("Gagal")
  });

  function createSubPolicy(values: SubPolicyFormValues) {
    create({
      variables: {
        input: {
          parentId: values.parentId,
          title: values.title,
          description: values.description,
          referenceIds: values.referenceIds
        }
      }
    });
  }

  const defaultValues = {
    parentId: id,
    title: "",
    description: "",
    referenceIds: []
  };

  return (
    <div>
      <HeaderWithBackButton heading="Create Sub-Policy" />
      <SubPolicyForm onSubmit={createSubPolicy} defaultValues={defaultValues} />
    </div>
  );
};

export default CreateSubPolicy;
