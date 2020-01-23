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

  // Fetch parent policy
  const { data } = usePolicyQuery({
    variables: { id },
    fetchPolicy: "network-only"
  });

  // Create sub-policy handler
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
    create({ variables: { input: values } });
  }

  // Extract necessary variables for UI
  const title = oc(data).policy.title("");

  // Extract defaultValues for Form
  const defaultValues = {
    parentId: id,
    title: "",
    description: "",
    referenceIds: [],
    resourceIds: [],
    businessProcessIds: [],
    controlIds: [],
    riskIds: [],
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
