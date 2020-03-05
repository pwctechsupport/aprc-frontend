import React from "react";
import Helmet from "react-helmet";
import { RouteComponentProps } from "react-router";
import { useCreatePolicyMutation } from "../../generated/graphql";
import BreadCrumb from "../../shared/components/BreadCrumb";
import HeaderWithBackButton from "../../shared/components/HeaderWithBack";
import { notifyGraphQLErrors, notifySuccess } from "../../shared/utils/notif";
import PolicyForm, { PolicyFormValues } from "./components/PolicyForm";

const CreatePolicy = ({ history, location }: RouteComponentProps) => {
  const [createPolicy, { loading }] = useCreatePolicyMutation({
    onCompleted: res => {
      notifySuccess("Create Success");
      const id = res.createPolicy?.policy?.id || "";
      history.replace(`/policy/${id}`);
    },
    onError: notifyGraphQLErrors,
    refetchQueries: ["policyTree"],
    awaitRefetchQueries: true
  });
  function handleSubmit(values: PolicyFormValues) {
    createPolicy({
      variables: {
        input: values
      }
    });
  }
  const isAdmin = location.pathname.split("/")[1] === "policy-admin";

  return (
    <div>
      <Helmet>
        <title>Create Policy - PricewaterhouseCoopers</title>
      </Helmet>
      <BreadCrumb
        crumbs={
          isAdmin
            ? [
                ["/policy-admin", "Policies"],
                ["/policy-admin/create", "Create Policy"]
              ]
            : [
                ["/policy", "Policies"],
                ["/policy/create", "Create Policy"]
              ]
        }
      />
      <HeaderWithBackButton heading="Create Policy" />
      <PolicyForm onSubmit={handleSubmit} submitting={loading} />
    </div>
  );
};

export default CreatePolicy;
