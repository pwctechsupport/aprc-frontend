import get from "lodash/get";
import React, { useState } from "react";
import Helmet from "react-helmet";
import {
  AiFillEdit,
  AiOutlineClockCircle,
  AiOutlineEdit
} from "react-icons/ai";
import { FaExclamationCircle, FaTimes, FaTrash } from "react-icons/fa";
import { RouteComponentProps, Link } from "react-router-dom";
import {
  useApproveRequestEditMutation,
  useCreateRequestEditMutation,
  useDestroyPolicyCategoryMutation,
  usePolicyCategoryQuery,
  useReviewPolicyCategoryDraftMutation,
  useUpdatePolicyCategoryMutation
} from "../../generated/graphql";
import Button from "../../shared/components/Button";
import DialogButton from "../../shared/components/DialogButton";
import LoadingSpinner from "../../shared/components/LoadingSpinner";
import Tooltip from "../../shared/components/Tooltip";
import { toLabelValue } from "../../shared/formatter";
import useEditState from "../../shared/hooks/useEditState";
import {
  notifyGraphQLErrors,
  notifyInfo,
  notifySuccess
} from "../../shared/utils/notif";
import PolicyCategoryForm, {
  PolicyCategoryFormValues
} from "./components/PolicyCategoryForm";
import BreadCrumb from "../../shared/components/BreadCrumb";
import HeaderWithBackButton from "../../shared/components/HeaderWithBack";

const PolicyCategory = ({ match, history }: RouteComponentProps) => {
  const [inEditMode, setInEditMode] = useState<boolean>(false);
  function toggleEditMode() {
    setInEditMode(p => !p);
  }
  const id = get(match, "params.id", "");
  const { data, loading } = usePolicyCategoryQuery({
    variables: {
      id
    },
    fetchPolicy: "network-only"
  });

  const draft = data?.policyCategory?.draft?.objectResult;
  const hasEditAccess = data?.policyCategory?.hasEditAccess || false;
  const requestStatus = data?.policyCategory?.requestStatus;
  const requestEditState = data?.policyCategory?.requestEdit?.state;
  const premise = useEditState({
    draft,
    hasEditAccess,
    requestStatus,
    requestEditState
  });

  // Update handlers
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
          name: values.name || "",
          policyIds: values.policyIds?.map(a => a.value)
        }
      }
    });
  }

  // Delete handlers
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

  // Review handlers
  const [
    reviewPolicyCategory,
    reviewPolicyCategoryM
  ] = useReviewPolicyCategoryDraftMutation({
    refetchQueries: ["policyCategory"]
  });
  async function review({ publish }: { publish: boolean }) {
    try {
      await reviewPolicyCategory({ variables: { id, publish } });
      notifySuccess(publish ? "Changes Approved" : "Changes Rejected");
    } catch (error) {
      notifyGraphQLErrors(error);
    }
  }

  // Request Edit handlers
  const [
    requestEditMutation,
    requestEditMutationInfo
  ] = useCreateRequestEditMutation({
    variables: { id, type: "PolicyCategory" },
    onError: notifyGraphQLErrors,
    onCompleted: () => notifyInfo("Edit access requested"),
    awaitRefetchQueries: true,
    refetchQueries: ["policyCategory"]
  });

  // Approve and Reject handlers
  const [
    approveEditMutation,
    approveEditMutationResult
  ] = useApproveRequestEditMutation({
    awaitRefetchQueries: true,
    refetchQueries: ["policyCategory"],
    onError: notifyGraphQLErrors
  });
  async function handleApproveRequest(id: string) {
    try {
      await approveEditMutation({ variables: { id, approve: true } });
      notifySuccess("You Gave Permission");
    } catch (error) {
      notifyGraphQLErrors(error);
    }
  }
  async function handleRejectRequest(id: string) {
    try {
      await approveEditMutation({ variables: { id, approve: false } });
      notifySuccess("You Restrict Permission");
    } catch (error) {
      notifyGraphQLErrors(error);
    }
  }

  if (loading) return <LoadingSpinner size={30} centered />;

  let name = data?.policyCategory?.name || "";
  // name = draft ? `[Draft] ${name}` : name;
  const policies = data?.policyCategory?.policies || [];

  const defaultValues = {
    name,
    policies: policies.map(toLabelValue)
  };

  const renderPolicyCategoryAction = () => {
    if (premise === 6) {
      return (
        <Tooltip description="Accept edit request">
          <DialogButton
            title={`Accept request to edit?`}
            message={`Request by ${data?.policyCategory?.requestEdit?.user?.name}`}
            className="soft red mr-2"
            data={data?.policyCategory?.requestEdit?.id}
            onConfirm={handleApproveRequest}
            onReject={handleRejectRequest}
            actions={{ no: "Reject", yes: "Approve" }}
            loading={approveEditMutationResult.loading}
          >
            <FaExclamationCircle />
          </DialogButton>
        </Tooltip>
      );
    }
    if (premise === 5) {
      return (
        <Tooltip
          description="Waiting approval"
          subtitle="You will be able to edit as soon as Admin gave you permission"
        >
          <Button disabled className="soft orange mr-2">
            <AiOutlineClockCircle />
          </Button>
        </Tooltip>
      );
    }
    if (premise === 4) {
      return (
        <Tooltip description="Request edit access">
          <DialogButton
            title="Request access to edit?"
            onConfirm={() => requestEditMutation()}
            loading={requestEditMutationInfo.loading}
            className="soft red mr-2"
            disabled={requestStatus === "requested"}
          >
            <AiOutlineEdit />
          </DialogButton>
        </Tooltip>
      );
    }
    if (premise === 3) {
      if (inEditMode) {
        return (
          <Button onClick={toggleEditMode} color="">
            <FaTimes size={22} className="mr-2" />
            Cancel Edit
          </Button>
        );
      }
      return (
        <div className="d-flex">
          <DialogButton
            onConfirm={handleDelete}
            loading={deleteInfo.loading}
            message={`Delete Policy Category "${name}"?`}
            className="soft red mr-2"
          >
            <FaTrash />
          </DialogButton>
          <Tooltip description="Edit Policy Category">
            <Button onClick={toggleEditMode} color="" className="soft orange">
              <AiFillEdit />
            </Button>
          </Tooltip>
        </div>
      );
    }
    if (premise === 2) {
      return (
        <div className="d-flex">
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
    return null;
  };

  const renderPolicyCategory = () => {
    return (
      <div>
        <h6 className="mt-4">Related Policies</h6>
        <ul>
          {policies.map(policy => (
            <li key={policy.id}>
              <Link to={`/policy/${policy.id}`}>{policy.title}</Link>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div>
      <Helmet>
        <title>{name} - Policy Category - PricewaterhouseCoopers</title>
      </Helmet>
      <BreadCrumb
        crumbs={[
          ["/policy-category", "Policy Category"],
          ["/policy-category/" + id, name]
        ]}
      />
      <div className="d-flex justify-content-between align-items-center">
        <HeaderWithBackButton draft={!!draft}>{name}</HeaderWithBackButton>
        {renderPolicyCategoryAction()}
      </div>
      {inEditMode ? (
        <PolicyCategoryForm
          onSubmit={handleUpdate}
          submitting={updateInfo.loading}
          defaultValues={defaultValues}
          isDraft={draft ? true : false}
        />
      ) : (
        renderPolicyCategory()
      )}
    </div>
  );
};

export default PolicyCategory;
