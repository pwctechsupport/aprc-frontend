import React from "react";
import { RouteComponentProps } from "react-router";
import PolicyCategoryForm, {
  PolicyCategoryFormValues,
} from "./components/PolicyCategoryForm";
import { useCreatePolicyCategoryMutation } from "../../generated/graphql";
import Helmet from "react-helmet";
import { notifySuccess, notifyGraphQLErrors } from "../../shared/utils/notif";
import { oc } from "ts-optchain";
import BreadCrumb from "../../shared/components/BreadCrumb";

const CreatePolicyCategory = ({ history }: RouteComponentProps) => {
  const [mutation, { loading }] = useCreatePolicyCategoryMutation({
    onCompleted: (res) => {
      notifySuccess("Policy Category Created");
      const id = oc(res).createPolicyCategory.policyCategory.id("");
      history.replace(`/policy-category/${id}`);
    },
    onError: notifyGraphQLErrors,
    awaitRefetchQueries: true,
    refetchQueries: ["policyCategories", "adminPolicyCategories"],
  });
  function handleCreate(values: PolicyCategoryFormValues) {
    mutation({
      variables: {
        input: {
          name: values.name || "",
          policyIds: values.policyIds?.map((a) => a.value),
        },
      },
    });
  }
  return (
    <div>
      <Helmet>
        <title>Create - Policy Category - PricewaterhouseCoopers</title>
      </Helmet>
      <BreadCrumb
        crumbs={[
          ["/policy-category", "Policy Category"],
          ["/policy-category/create", "Create policy category"],
        ]}
      />
      <h4 className="mb-3">Create policy category</h4>
      <PolicyCategoryForm
        onSubmit={handleCreate}
        submitting={loading}
        history={history}
        isCreate={history.location.pathname === "/policy-category/create"}
      />
    </div>
  );
};

export default CreatePolicyCategory;
