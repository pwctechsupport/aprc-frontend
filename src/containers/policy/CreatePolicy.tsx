import React from "react";
import Helmet from "react-helmet";
import { RouteComponentProps } from "react-router";
import { useCreatePolicyMutation } from "../../generated/graphql";
import BreadCrumb from "../../shared/components/BreadCrumb";
import HeaderWithBackButton from "../../shared/components/Header";
import { notifyGraphQLErrors, notifySuccess } from "../../shared/utils/notif";
import PolicyForm, { PolicyFormValues } from "./components/PolicyForm";

const CreatePolicy = ({ history, location }: RouteComponentProps) => {
  const [createPolicy, { loading }] = useCreatePolicyMutation({
    onCompleted: (res) => {
      notifySuccess("Create Success");
      const id = res.createPolicy?.policy?.id || "";
      history.replace(`/policy/${id}/details`);
      window.location.reload();
    },
    onError: notifyGraphQLErrors,
    refetchQueries: ["sideboxPolicy"],
    awaitRefetchQueries: true,
  });
  function handleSubmit(values: PolicyFormValues) {
    createPolicy({
      variables: {
        input: { ...values, status: "draft" },
      },
    });
  }
  function handleSubmitToReviewer(values: PolicyFormValues) {
    createPolicy({
      variables: {
        input: { isSubmitted: true, ...values, status: "waiting_for_review" },
      },
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
                ["/policy-admin/create", "Create policy"],
              ]
            : [
                ["/policy", "Policies"],
                ["/policy/create", "Create policy"],
              ]
        }
      />
      <HeaderWithBackButton heading="Create policy" />
      <PolicyForm
        onSubmit={handleSubmit}
        handleSubmitToReviewer={handleSubmitToReviewer}
        submitting={loading}
        history={history}
        isCreate
      />
    </div>
  );
};

export default CreatePolicy;
