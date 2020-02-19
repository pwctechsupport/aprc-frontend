import React from "react";
import Helmet from "react-helmet";
import { RouteComponentProps } from "react-router";
import { toast } from "react-toastify";
import { oc } from "ts-optchain";
import { useCreatePolicyMutation } from "../../generated/graphql";
import HeaderWithBackButton from "../../shared/components/HeaderWithBack";
import PolicyForm, { PolicyFormValues } from "./components/PolicyForm";
import BreadCrumb from "../../shared/components/BreadCrumb";

const CreatePolicy = ({ history, location }: RouteComponentProps) => {
  const [createPolicy, { loading }] = useCreatePolicyMutation({
    onCompleted: res => {
      toast.success("Create Success");
      const id = oc(res).createPolicy.policy.id("");
      history.replace(`/policy/${id}`);
    },
    onError: () => toast.error("Create Failed"),
    refetchQueries: ["policies"],
    awaitRefetchQueries: true
  });
  function handleSubmit(values: PolicyFormValues) {
    createPolicy({
      variables: {
        input: {
          title: values.title,
          policyCategoryId: values.policyCategoryId,
          description: values.description,
          status: values.status
        }
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
            : [["/policy", "Policies"], ["/policy/create", "Create Policy"]]
        }
      />
      <HeaderWithBackButton heading="Create Policy" />
      <PolicyForm onSubmit={handleSubmit} submitting={loading} />
    </div>
  );
};

export default CreatePolicy;
