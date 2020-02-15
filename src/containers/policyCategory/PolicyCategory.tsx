import get from "lodash/get";
import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { oc } from "ts-optchain";
import {
  usePolicyCategoryQuery,
  useUpdatePolicyCategoryMutation,
  useDestroyPolicyCategoryMutation
} from "../../generated/graphql";
import LoadingSpinner from "../../shared/components/LoadingSpinner";
import PolicyCategoryForm, {
  PolicyCategoryFormValues
} from "./components/PolicyCategoryForm";
import { notifySuccess, notifyGraphQLErrors } from "../../shared/utils/notif";
import Helmet from "react-helmet";
import { toLabelValue } from "../../shared/formatter";
import DialogButton from "../../shared/components/DialogButton";
import { FaTrash } from "react-icons/fa";

const PolicyCategory = ({ match, history }: RouteComponentProps) => {
  const id = get(match, "params.id", "");
  const { data, loading } = usePolicyCategoryQuery({
    variables: {
      id
    },
    fetchPolicy: "network-only"
  });
  const [updateMutation, updateInfo] = useUpdatePolicyCategoryMutation({
    onCompleted: () => notifySuccess("Policy Category Updated"),
    onError: notifyGraphQLErrors,
    awaitRefetchQueries: true,
    refetchQueries: ["policyCategory"]
  });
  function handleUpdate(values: PolicyCategoryFormValues) {
    updateMutation({
      variables: {
        input: {
          id,
          ...values
        }
      }
    });
  }

  const [deleteMutation, deleteInfo] = useDestroyPolicyCategoryMutation({
    onCompleted: () => {
      notifySuccess("Policy Category Deleted");
      history.push("/policy-category");
    },
    onError: notifyGraphQLErrors,
    awaitRefetchQueries: true,
    refetchQueries: ["policyCategory"]
  });
  function handleDelete() {
    deleteMutation({ variables: { id } });
  }

  if (loading) return <LoadingSpinner size={30} centered />;

  const name = oc(data).policyCategory.name("");
  const policies = oc(data).policyCategory.policies([]);

  const defaultValues = {
    name,
    policies: policies.map(toLabelValue)
  };
  return (
    <div>
      <Helmet>
        <title>{name} - Policy Category - PricewaterhouseCoopers</title>
      </Helmet>
      <div className="d-flex justify-content-between align-items-center">
        <h1>{name}</h1>
        <DialogButton
          onConfirm={handleDelete}
          loading={deleteInfo.loading}
          message={`Delete Policy Category "${name}"?`}
          className="soft red"
        >
          <FaTrash className="clickable" />
        </DialogButton>
      </div>
      <PolicyCategoryForm
        onSubmit={handleUpdate}
        submitting={updateInfo.loading}
        defaultValues={defaultValues}
      />
    </div>
  );
};

export default PolicyCategory;
