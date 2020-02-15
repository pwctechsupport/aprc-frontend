import React from "react";
import PolicyCategoryForm, {
  PolicyCategoryFormValues
} from "./components/PolicyCategoryForm";
import { useCreatePolicyCategoryMutation } from "../../generated/graphql";
import Helmet from "react-helmet";
import { notifySuccess, notifyGraphQLErrors } from "../../shared/utils/notif";

const CreatePolicyCategory = () => {
  const [mutation, { loading }] = useCreatePolicyCategoryMutation({
    onCompleted: () => notifySuccess("Policy Category Created"),
    onError: notifyGraphQLErrors,
    awaitRefetchQueries: true,
    refetchQueries: ["policyCategories"]
  });
  function handleCreate(values: PolicyCategoryFormValues) {
    mutation({ variables: { input: values } });
  }
  return (
    <div>
      <Helmet>
        <title>Create - Policy Category - PricewaterhouseCoopers</title>
      </Helmet>
      <h4>Create Policy Category</h4>
      <PolicyCategoryForm onSubmit={handleCreate} submitting={loading} />
    </div>
  );
};

export default CreatePolicyCategory;
