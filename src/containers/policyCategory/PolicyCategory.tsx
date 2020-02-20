import get from "lodash/get";
import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { oc } from "ts-optchain";
import {
  usePolicyCategoryQuery,
  useUpdatePolicyCategoryMutation,
  useDestroyPolicyCategoryMutation,
  useReviewPolicyCategoryDraftMutation
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
import useAccessRights from "../../shared/hooks/useAccessRights";

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
  const [isAdmin] = useAccessRights(["admin"]);
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
  const draft = oc(data).policyCategory.draft.objectResult();
  const [
    reviewPolicyCategory,
    reviewPolicyCategoryM
  ] = useReviewPolicyCategoryDraftMutation({
    refetchQueries: ["policyCategory"]
  });
  if (loading) return <LoadingSpinner size={30} centered />;

  let name = oc(data).policyCategory.name("");
  name = draft ? `[Draft] ${name}` : name;
  const policies = oc(data).policyCategory.policies([]);

  const defaultValues = {
    name,
    policies: policies.map(toLabelValue)
  };

  async function review({ publish }: { publish: boolean }) {
    try {
      await reviewPolicyCategory({ variables: { id, publish } });
      notifySuccess(publish ? "Changes Approved" : "Changes Rejected");
    } catch (error) {
      notifyGraphQLErrors(error);
    }
  }
  const renderPolicyCategoryAction = () => {
    if (draft && isAdmin) {
      return (
        <div>
          <DialogButton
            color="danger"
            className="mr-2"
            onConfirm={() => review({ publish: false })}
            loading={reviewPolicyCategoryM.loading}
          >
            Reject
          </DialogButton>
          <DialogButton
            color="primary"
            className="pwc"
            onConfirm={() => review({ publish: true })}
            loading={reviewPolicyCategoryM.loading}
          >
            Approve
          </DialogButton>
        </div>
      );
    }
    if (draft && !isAdmin) return null;
    if (!draft) {
      return (
        <DialogButton
          onConfirm={handleDelete}
          loading={deleteInfo.loading}
          message={`Delete Policy Category "${name}"?`}
          className="soft red"
        >
          <FaTrash className="clickable" />
        </DialogButton>
      );
    }
  };

  return (
    <div>
      <Helmet>
        <title>{name} - Policy Category - PricewaterhouseCoopers</title>
      </Helmet>

      <div className="d-flex justify-content-between align-items-center">
        <h1>{name}</h1>
        {renderPolicyCategoryAction()}
        {/* <DialogButton
          onConfirm={handleDelete}
          loading={deleteInfo.loading}
          message={`Delete Policy Category "${name}"?`}
          className="soft red"
        >
          <FaTrash className="clickable" />
        </DialogButton> */}
      </div>
      <PolicyCategoryForm
        onSubmit={handleUpdate}
        submitting={updateInfo.loading}
        defaultValues={defaultValues}
        isDraft={draft ? true : false}
      />
    </div>
  );
};

export default PolicyCategory;
