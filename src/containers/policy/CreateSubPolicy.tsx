import get from "lodash/get";
import React from "react";
import { RouteComponentProps } from "react-router";
import { toast } from "react-toastify";
import {
  Status,
  useCreateSubPolicyMutation,
  usePolicyQuery,
} from "../../generated/graphql";
import HeaderWithBackButton from "../../shared/components/Header";
import SubPolicyForm, { SubPolicyFormValues } from "./components/SubPolicyForm";
import BreadCrumb from "../../shared/components/BreadCrumb";
import { oc } from "ts-optchain";

const CreateSubPolicy = ({ match, history, location }: RouteComponentProps) => {
  const id = get(match, "params.id", "");

  // Fetch parent policy
  const { data } = usePolicyQuery({
    variables: { id },
    fetchPolicy: "network-only",
  });

  // Create sub-policy handler
  const [create] = useCreateSubPolicyMutation({
    onCompleted: () => {
      toast.success("Berhasil");
      history.goBack();
      // window.location.reload();
    },
    onError: () => toast.error("Gagal"),
    // refetchQueries: [{ query: PreparerPoliciesDocument, variables: { id } }],
    refetchQueries: ["sideboxPolicy", "references", "adminReferences"],
    awaitRefetchQueries: true,
  });
  function createSubPolicy(values: SubPolicyFormValues) {
    create({
      variables: {
        input: {
          ...values,
          businessProcessIds: values.businessProcessIds || [],
          controlIds: values.controlIds || [],
          riskIds: values.riskIds || [],
        },
      },
    });
  }
  function submitSubPolicy(values: SubPolicyFormValues) {
    create({
      variables: {
        input: {
          ...values,
          isSubmitted: true,
          businessProcessIds: values.businessProcessIds || [],
          controlIds: values.controlIds || [],
          riskIds: values.riskIds || [],
        },
      },
    });
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
    status: Status.Draft,
  };

  const isAdmin = location.pathname.split("/")[1] === "policy-admin";

  return (
    <div>
      <BreadCrumb
        crumbs={
          isAdmin
            ? [
                ["/policy-admin", "Policies"],
                ["/policy-admin/" + id, title],
                [
                  "/policy-admin/" + id + "/create-sub-policy",
                  "Create Sub-Policy",
                ],
              ]
            : [
                ["/policy", "Policies"],
                ["/policy/" + id, title],
                ["/policy/" + id + "/create-sub-policy", "Create Sub-Policy"],
              ]
        }
      />
      <HeaderWithBackButton heading="Create Sub-Policy" />
      <SubPolicyForm
        saveAsDraftFirst={createSubPolicy}
        submitFirst={submitSubPolicy}
        defaultValues={defaultValues}
        history={history}
        isCreate
      />
    </div>
  );
};

export default CreateSubPolicy;
