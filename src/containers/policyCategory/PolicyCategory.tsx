import get from "lodash/get";
import React, { Fragment, useEffect, useState } from "react";
import Helmet from "react-helmet";
import { AiOutlineClockCircle } from "react-icons/ai";
import { FaExclamationCircle } from "react-icons/fa";
import { Link, RouteComponentProps } from "react-router-dom";
import PickIcon from "../../assets/Icons/PickIcon";
import {
  useApproveRequestEditMutation,
  useCreateRequestEditMutation,
  usePolicyCategoryQuery,
  usePreparerPoliciesQuery,
  useReviewPolicyCategoryDraftMutation,
  useUpdatePolicyCategoryMutation,
} from "../../generated/graphql";
import BreadCrumb from "../../shared/components/BreadCrumb";
import Button from "../../shared/components/Button";
import DialogButton from "../../shared/components/DialogButton";
import HeaderWithBackButton from "../../shared/components/Header";
import LoadingSpinner from "../../shared/components/LoadingSpinner";
import Tooltip from "../../shared/components/Tooltip";
import { toLabelValue } from "../../shared/formatter";
import useEditState from "../../shared/hooks/useEditState";
import {
  notifyGraphQLErrors,
  notifyInfo,
  notifySuccess,
  notifyReject,
} from "../../shared/utils/notif";
import PolicyCategoryForm, {
  PolicyCategoryFormValues,
} from "./components/PolicyCategoryForm";
import { Row, Col } from "reactstrap";

const PolicyCategory = ({ match, history, location }: RouteComponentProps) => {
  const [inEditMode, setInEditMode] = useState<boolean>(false);
  function toggleEditMode() {
    setInEditMode((p) => !p);
  }
  useEffect(() => {
    setInEditMode((p) => (p ? false : p));
  }, [location.pathname]);

  const id = get(match, "params.id", "");
  const { data, loading } = usePolicyCategoryQuery({
    variables: {
      id,
    },
    fetchPolicy: "network-only",
  });
  const policiesReal = data?.policyCategory?.policy || [];
  const policiesDataRaw = usePreparerPoliciesQuery({
    skip: policiesReal.length ? false : true,
    variables: {
      isTree: false,
      filter: { title_matches_any: policiesReal },
      limit: 1000,
    },
  });
  const policiesData = policiesDataRaw.data?.preparerPolicies?.collection || [];
  const createdAt = data?.policyCategory?.createdAt.split(" ")[0];
  const createdBy = data?.policyCategory?.createdBy;
  const lastUpdatedBy = data?.policyCategory?.lastUpdatedBy;
  const draft = data?.policyCategory?.draft?.objectResult;
  const hasEditAccess = data?.policyCategory?.hasEditAccess || false;
  const requestStatus = data?.policyCategory?.requestStatus;
  const requestEditState = data?.policyCategory?.requestEdit?.state;
  const premise = useEditState({
    draft,
    hasEditAccess,
    requestStatus,
    requestEditState,
  });
  // Update handlers
  const [updateMutation, updateInfo] = useUpdatePolicyCategoryMutation({
    onCompleted: () => notifySuccess("Policy category updated"),
    onError: notifyGraphQLErrors,
    awaitRefetchQueries: true,
    refetchQueries: ["policyCategory"],
  });
  function handleUpdate(values: PolicyCategoryFormValues) {
    updateMutation({
      variables: {
        input: {
          id,
          name: values.name || "",
          policyIds: values.policyIds?.map((a) => a.value),
        },
      },
    });
    toggleEditMode();
  }

  // Delete handlers
  // const [deleteMutation, deleteInfo] = useDestroyPolicyCategoryMutation({
  //   onCompleted: () => {
  //     notifySuccess("Policy Category Deleted");
  //     history.push("/policy-category");
  //   },
  //   onError: notifyGraphQLErrors,
  //   awaitRefetchQueries: true,
  //   refetchQueries: ["policyCategory"],
  // });
  // function handleDelete() {
  //   deleteMutation({ variables: { id } });
  // }

  // Review handlers
  const [
    reviewPolicyCategory,
    reviewPolicyCategoryM,
  ] = useReviewPolicyCategoryDraftMutation({
    refetchQueries: ["policyCategory"],
  });
  async function review({ publish }: { publish: boolean }) {
    try {
      await reviewPolicyCategory({ variables: { id, publish } });
      publish ? notifySuccess("Changes Approved") : notifyReject('Changes Rejected')
    } catch (error) {
      notifyGraphQLErrors(error);
    }
  }

  // Request Edit handlers
  const [
    requestEditMutation,
    requestEditMutationInfo,
  ] = useCreateRequestEditMutation({
    variables: { id, type: "PolicyCategory" },
    onError: notifyGraphQLErrors,
    onCompleted: () => notifyInfo("Edit access requested"),
    awaitRefetchQueries: true,
    refetchQueries: ["policyCategory"],
  });

  // Approve and Reject handlers
  const [
    approveEditMutation,
    approveEditMutationResult,
  ] = useApproveRequestEditMutation({
    awaitRefetchQueries: true,
    refetchQueries: ["policyCategory"],
    onError: notifyGraphQLErrors,
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

  const defaultValues = {
    name,
    policies: policiesData.map(toLabelValue),
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
            <PickIcon name="pencilO" style={{ width: "18px" }} />
          </DialogButton>
        </Tooltip>
      );
    }
    if (premise === 3) {
      if (inEditMode) {
        return null;
        // <Button onClick={toggleEditMode} color="">
        // <FaTimes size={22} className="mr-2" />
        // Cancel Edit
        // </Button>
      }
      return (
        <div className="d-flex">
          {/* <DialogButton
            onConfirm={handleDelete}
            loading={deleteInfo.loading}
            message={`Delete Policy Category "${name}"?`}
            className="soft red mr-2"
          >
            <FaTrash />
          </DialogButton> */}
          <Tooltip description="Edit policy category">
            {policiesDataRaw.loading ? (
              <LoadingSpinner size={10} centered />
            ) : (
              <Button onClick={toggleEditMode} color="" className="soft orange">
                <PickIcon name="pencilFill" style={{ width: "15px" }} />
              </Button>
            )}
          </Tooltip>
        </div>
      );
    }
    if (premise === 2) {
      return (
        <div className="d-flex">
          <DialogButton
            className="mr-2 button cancel"
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
        <Fragment>
          <dt>Created at</dt>
          <dd>{createdAt}</dd>
        </Fragment>
        <Fragment>
          <dt>Created by</dt>
          <dd> {createdBy ? createdBy : "-"}</dd>
        </Fragment>
        <Fragment>
          <dt>Last updated by</dt>
          <dd> {lastUpdatedBy ? lastUpdatedBy : "-"}</dd>
        </Fragment>
        {/* <h6 className="mt-4"> </h6> */}
        <Fragment>
          <dt>Related policies</dt>
          {policiesData.length ? (
            <ul>
              {policiesData.map((policy) => (
                <li key={policy.id}>
                  <Link to={`/policy/${policy.id}`}>{policy.title}</Link>
                </li>
              ))}
            </ul>
          ) : (
            <dd>-</dd>
          )}
        </Fragment>
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
          ["/policy-category", "Policy category"],
          ["/policy-category/" + id, name],
        ]}
      />
      <Row>
        <Col>
          <HeaderWithBackButton draft={!!draft}>{name}</HeaderWithBackButton>
        </Col>
        <Col>
          <div className="d-flex justify-content-end mb-3">
            {renderPolicyCategoryAction()}
          </div>
        </Col>
      </Row>
      {inEditMode ? (
        <PolicyCategoryForm
          onSubmit={handleUpdate}
          submitting={updateInfo.loading}
          defaultValues={defaultValues}
          toggleEditMode={toggleEditMode}
          isDraft={draft ? true : false}
        />
      ) : (
        renderPolicyCategory()
      )}
    </div>
  );
};

export default PolicyCategory;
