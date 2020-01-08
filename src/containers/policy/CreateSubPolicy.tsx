import get from "lodash/get";
import React from "react";
import { RouteComponentProps } from "react-router";
import { toast } from "react-toastify";
import {
  PolicyDocument,
  Status,
  useCreateSubPolicyMutation,
  usePolicyQuery
} from "../../generated/graphql";
import HeaderWithBackButton from "../../shared/components/HeaderWithBack";
import SubPolicyForm, { SubPolicyFormValues } from "./components/SubPolicyForm";
import BreadCrumb from "../../shared/components/BreadCrumb";
import { oc } from "ts-optchain";

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

  const { loading, data } = usePolicyQuery({
    variables: { id },
    fetchPolicy: "network-only"
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

  const title = oc(data).policy.title("");
  const defaultValues = {
    parentId: id,
    title: "",
    description: "",
    referenceIds: [],
    status: Status.Draft
  };

  return (
    <div>
      <BreadCrumb
        crumbs={[
          ["/policy", "Policies"],
          ["/policy/" + id, title],
          ["/policy/" + id + "/create-sub-policy", "Create Sub-Policy"]
        ]}
      />
      <HeaderWithBackButton heading="Create Sub-Policy" />
      <SubPolicyForm onSubmit={createSubPolicy} defaultValues={defaultValues} />
    </div>
  );
};

export default CreateSubPolicy;
