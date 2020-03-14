import React, { useState } from "react";
import Helmet from "react-helmet";
import {
  AiFillEdit,
  AiOutlineClockCircle,
  AiOutlineEdit
} from "react-icons/ai";
import { FaTimes, FaTrash, FaExclamationCircle } from "react-icons/fa";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import { oc } from "ts-optchain";
import {
  UpdateResourceInput,
  useDestroyResourceMutation,
  useCreateRequestEditMutation,
  useApproveRequestEditMutation,
  useResourceQuery,
  useUpdateResourceMutation,
  useReviewResourceDraftMutation
} from "../../generated/graphql";
import BreadCrumb from "../../shared/components/BreadCrumb";
import Button from "../../shared/components/Button";
import DialogButton from "../../shared/components/DialogButton";
import HeaderWithBackButton from "../../shared/components/HeaderWithBack";
import LoadingSpinner from "../../shared/components/LoadingSpinner";
import {
  notifyGraphQLErrors,
  notifySuccess,
  notifyInfo
} from "../../shared/utils/notif";
import ResourceBox from "./components/ResourceBox";
import ResourceForm, { ResourceFormValues } from "./components/ResourceForm";
import { toLabelValue } from "../../shared/formatter";
import EmptyAttribute from "../../shared/components/EmptyAttribute";
import useEditState from "../../shared/hooks/useEditState";
import Tooltip from "../../shared/components/Tooltip";

const Resource = ({ match, history }: RouteComponentProps) => {
  // Delete handlers
  const [deleteMutation, deleteInfo] = useDestroyResourceMutation({
    onCompleted: () => {
      notifySuccess("Resource Deleted");
      history.push("/resource");
    },
    onError: notifyGraphQLErrors,
    awaitRefetchQueries: true,
    refetchQueries: ["resource"]
  });
  function handleDelete() {
    deleteMutation({ variables: { id } });
  }

  // Review handlers
  const [reviewResource, reviewResourceM] = useReviewResourceDraftMutation({
    refetchQueries: ["resource"]
  });
  async function review({ publish }: { publish: boolean }) {
    try {
      await reviewResource({ variables: { id, publish } });
      notifySuccess(publish ? "Changes Approved" : "Changes Rejected");
    } catch (error) {
      notifyGraphQLErrors(error);
    }
  }

  // Request Edit handlers
  const id = match.params && (match.params as any).id;

  const [
    requestEditMutation,
    requestEditMutationInfo
  ] = useCreateRequestEditMutation({
    variables: { id, type: "Resource" },
    onError: notifyGraphQLErrors,
    onCompleted: () => notifyInfo("Edit access requested"),
    refetchQueries: ["resource"]
  });

  // Approve and Reject handlers
  const [
    approveEditMutation,
    approveEditMutationResult
  ] = useApproveRequestEditMutation({
    refetchQueries: ["resource"],
    onError: notifyGraphQLErrors
  });

  const [inEditMode, setInEditMode] = useState(false);
  const toggleEditMode = () => setInEditMode(prev => !prev);

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
  const { data, loading } = useResourceQuery({
    variables: { id },
    fetchPolicy: "network-only"
  });
  const draft = data?.resource?.draft?.objectResult;
  const hasEditAccess = data?.resource?.hasEditAccess || false;
  const requestStatus = data?.resource?.requestStatus;
  const requestEditState = data?.resource?.requestEdit?.state;
  const premise = useEditState({
    draft,
    hasEditAccess,
    requestStatus,
    requestEditState
  });
  const [updateResource, updateResourceM] = useUpdateResourceMutation({
    refetchQueries: ["resources", "resource"],
    awaitRefetchQueries: true
  });

  const name = data?.resource?.name || "";

  async function handleSubmit(data: ResourceFormValues) {
    const input: UpdateResourceInput = {
      id: id,
      category: data.category?.value,
      name: data.name,
      policyIds: data.policyIds?.map(a => a.value),
      controlIds: data.controlIds?.map(a => a.value),
      businessProcessId: data.businessProcessId?.value,
      resuploadLink: data.resuploadLink,
      ...(data.resuploadBase64 && {
        resuploadBase64: data.resuploadBase64
      })
    };
    try {
      await updateResource({ variables: { input } });
      toggleEditMode();
      notifySuccess("Resource Updated");
    } catch (error) {
      notifyGraphQLErrors(error);
    }
  }
  const defaultValues: ResourceFormValues = {
    name,
    category: {
      label: data?.resource?.category || "",
      value: data?.resource?.category || ""
    },
    businessProcessId: toLabelValue(data?.resource?.businessProcess || {}),
    controlIds:
      data?.resource?.controls
        ?.map(({ id, description }) => ({ id, name: description }))
        .map(toLabelValue) || [],
    policyIds: data?.resource?.policies?.map(toLabelValue) || [],
    resuploadUrl: data?.resource?.resuploadUrl || ""
  };

  async function handleErase() {
    const input = {
      id: id,
      resuploadBase64: ""
    };
    try {
      await updateResource({ variables: { input } });
      notifySuccess("File Removed");
    } catch (error) {
      notifyGraphQLErrors(error);
    }
  }

  if (loading) {
    return <LoadingSpinner centered size={30} />;
  }

  const policies = data?.resource?.policies || [];
  const controls = data?.resource?.controls || [];

  const renderResourceInEditMode = () => {
    return (
      <ResourceForm
        isDraft={draft ? true : false}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        submitting={updateResourceM.loading}
      />
    );
  };

  const renderResource = () => {
    return (
      <div className="d-flex">
        <ResourceBox
          id={id}
          name={name}
          rating={oc(data).resource.rating(0)}
          totalRating={oc(data).resource.totalRating(0)}
          views={oc(data).resource.visit(0)}
          resuploadUrl={oc(data).resource.resuploadUrl("")}
          handleErase={handleErase}
        />
        <div className="ml-3">
          <h5>
            Category:&nbsp;
            <span className="text-orange">{data?.resource?.category}</span>
          </h5>

          {data?.resource?.category === "Flowchart" ? (
            <>
              <h5 className="mt-5">Business Process:</h5>
              {data.resource.businessProcess?.name}
            </>
          ) : (
            <>
              <div>
                <h5 className="mt-5">Related Controls:</h5>
                {controls.length ? (
                  <ul>
                    {controls.map(control => (
                      <li key={control.id}>
                        <Link to={`/control/${control.id}`}>
                          {control.description}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyAttribute centered={false} />
                )}
              </div>
              <div>
                <h5 className="mt-5">Related Policies:</h5>
                {policies.length ? (
                  <ul>
                    {policies.map(policy => (
                      <li key={policy.id}>
                        <Link to={`/policy/${policy.id}`}>{policy.title}</Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyAttribute centered={false} />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderResourceAction = () => {
    if (premise === 6) {
      return (
        <Tooltip description="Accept edit request">
          <DialogButton
            title={`Accept request to edit?`}
            message={`Request by ${data?.resource?.requestEdit?.user?.name}`}
            className="soft red mr-2"
            data={data?.resource?.requestEdit?.id}
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
            message={`Delete Resource "${name}"?`}
            className="soft red mr-2"
          >
            <FaTrash />
          </DialogButton>
          <Tooltip description="Edit Resource">
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
            loading={reviewResourceM.loading}
          >
            Reject
          </DialogButton>
          <DialogButton
            color="primary"
            className="pwc"
            onConfirm={() => review({ publish: true })}
            loading={reviewResourceM.loading}
          >
            Approve
          </DialogButton>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <Helmet>
        <title>{name} - Resource - PricewaterhouseCoopers</title>
      </Helmet>
      <BreadCrumb
        crumbs={[
          ["/resources", "Resources"],
          ["/resources/" + id, name]
        ]}
      />
      <div className="d-flex justify-content-between align-items-center">
        <HeaderWithBackButton heading={name} draft={!!draft} />
        {renderResourceAction()}
      </div>
      {inEditMode ? renderResourceInEditMode() : renderResource()}
    </div>
  );
};

export default Resource;
