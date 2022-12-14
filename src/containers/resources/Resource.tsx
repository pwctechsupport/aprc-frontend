import React, { useEffect, useState } from "react";
import Helmet from "react-helmet";
import { AiOutlineClockCircle } from "react-icons/ai";
import { FaExclamationCircle } from "react-icons/fa";
import { RouteComponentProps } from "react-router";
import { Col, Row } from "reactstrap";
import PickIcon from "../../assets/Icons/PickIcon";
import {
  UpdateResourceInput,
  useApproveRequestEditMutation,
  useCreateRequestEditMutation,
  useResourceQuery,
  useResourceRatingsQuery,
  useReviewResourceDraftMutation,
  useUpdateResourceMutation,
} from "../../generated/graphql";
import { APP_ROOT_URL } from "../../settings";
import BreadCrumb from "../../shared/components/BreadCrumb";
import Button from "../../shared/components/Button";
import DialogButton from "../../shared/components/DialogButton";
import EmptyAttribute from "../../shared/components/EmptyAttribute";
import HeaderWithBackButton from "../../shared/components/Header";
import TangerineLink from "../../shared/components/Link";
import LoadingSpinner from "../../shared/components/LoadingSpinner";
import Tooltip from "../../shared/components/Tooltip";
import { toLabelValue } from "../../shared/formatter";
import useEditState from "../../shared/hooks/useEditState";
import { useSelector } from "../../shared/hooks/useSelector";
import {
  notifyGraphQLErrors,
  notifyInfo,
  notifySuccess,
  notifyReject,
} from "../../shared/utils/notif";
import ResourceBox from "./components/ResourceBox";
import ResourceForm, { ResourceFormValues } from "./components/ResourceForm";

type TParams = { id: string };

export default function Resource({
  match,
  history,
  location,
}: RouteComponentProps<TParams>) {
  const [inEditMode, setInEditMode] = useState(false);
  const toggleEditMode = () => setInEditMode((prev) => !prev);
  useEffect(() => {
    setInEditMode((prevState) => (prevState ? false : prevState));
  }, [location.pathname]);

  const { id } = match.params;
  const userId = useSelector((state) => state.auth.user)?.id;

  //Queries

  const { data, loading } = useResourceQuery({
    variables: { id },
    fetchPolicy: "no-cache",
  });
  let category = data?.resource?.category;

  const { data: dataRating } = useResourceRatingsQuery({
    skip: category === "Flowchart",
    variables: { filter: { user_id_eq: userId, resource_id_eq: id } },
    fetchPolicy: "no-cache",
  });
  const name = data?.resource?.name || "";
  const totalRating = data?.resource?.totalRating || 0;
  const visit = data?.resource?.visit || 0;
  const resourceFileType = data?.resource?.resourceFileType;
  // const businessProcess = data?.resource?.businessProcess;
  let businessProcessName = data?.resource?.businessProcess?.name;
  let businessProcessId = data?.resource?.businessProcess?.id;
  const resuploadUrl = data?.resource?.resuploadUrl;
  const resuploadLink = data?.resource?.resuploadLink;
  let policies = data?.resource?.policies || [];
  const bps = data?.resource?.businessProcess;
  const draft = data?.resource?.draft?.objectResult;
  const hasEditAccess = data?.resource?.hasEditAccess || false;
  const requestStatus = data?.resource?.requestStatus;
  const requestEditState = data?.resource?.requestEdit?.state;
  const base64File = data?.resource?.base64File;
  const premise = useEditState({
    draft,
    hasEditAccess,
    requestStatus,
    requestEditState,
  });

if (draft) {
  const draftData: any = draft || {};
  category = draftData.category
  policies = draftData.policies
  businessProcessName = draftData.businessProcess.name
  businessProcessId = draftData.businessProcess.id
}

  const rating =
    dataRating?.resourceRatings?.collection.map((a) => a.rating).pop() || 0;
  const imagePreviewUrl = resuploadLink
    ? resuploadLink
    : resuploadUrl && !resuploadLink?.includes("original/missing.png")
    ? `${APP_ROOT_URL}${resuploadUrl}`
    : undefined;

  const filteredNames = (names: any) =>
    names.filter((v: any, i: any) => names.indexOf(v) === i);
  // Delete handlers
  // const [deleteMutation, deleteInfo] = useDestroyResourceMutation({
  //   onCompleted: () => {
  //     notifySuccess("Resource Deleted");
  //     history.push("/resource");
  //   },
  //   onError: notifyGraphQLErrors,
  //   awaitRefetchQueries: true,
  //   refetchQueries: ["resource"],
  // });
  // function handleDelete() {
  //   deleteMutation({ variables: { id } });
  // }

  // Review handlers
  const [reviewResource, reviewResourceM] = useReviewResourceDraftMutation({
    refetchQueries: ["resource"],
  });
  async function review({ publish }: { publish: boolean }) {
    try {
      await reviewResource({ variables: { id, publish } });
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
    variables: { id, type: "Resource" },
    onError: notifyGraphQLErrors,
    onCompleted: () => notifyInfo("Edit access requested"),
    refetchQueries: ["resource"],
  });

  // Approve and Reject handlers
  const [
    approveEditMutation,
    approveEditMutationResult,
  ] = useApproveRequestEditMutation({
    refetchQueries: ["resource"],
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

  const [updateResource, updateResourceM] = useUpdateResourceMutation({
    refetchQueries: [
      "resources",
      "resource",
      "recentResources",
      "reviewerResourcesStatus",
    ],
    awaitRefetchQueries: true,
  });

  async function handleSubmit(data: ResourceFormValues) {
    const input: UpdateResourceInput = {
      id: id,
      category: data.category?.value,
      name: data.name,
      policyIds: data.policyIds?.map((a) => a.value),
      controlIds: data.controlIds?.map((a) => a.value),
      businessProcessId: data.businessProcessId?.value,
      resuploadLink: data.resuploadLink,
      ...(data.resupload && {
        resupload: data.resupload,
      }),
      tagsAttributes: data.tagsAttributes?.map((tag) => {
        const { id, risk, control, yCoordinates, xCoordinates, ...rest } = tag;
        return {
          ...rest,
          risk_id: risk?.id,
          control_id: control?.id,
          business_process_id: data.businessProcessId?.value,
          x_coordinates: xCoordinates,
          y_coordinates: yCoordinates,
        };
      }),
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
      label: category || "",
      value: category || "",
    },
    businessProcessId: toLabelValue(data?.resource?.businessProcess || {}),
    controlIds:
      data?.resource?.controls
        ?.map(({ id, description }) => ({ id, name: description }))
        .map(toLabelValue) || [],
    policyIds: data?.resource?.policies?.map(toLabelValue) || [],
    resuploadUrl: data?.resource?.resuploadUrl || "",
    resuploadLink: data?.resource?.resuploadLink || "",
    resuploadBase64: data?.resource?.base64File || "",
    tagsAttributes: data?.resource?.tags || [],
  };
  if (loading) {
    return <LoadingSpinner centered size={30} />;
  }
  const renderResourceInEditMode = () => {
    return (
      <ResourceForm
        base64File={base64File}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        submitting={updateResourceM.loading}
        toggleEditMode={toggleEditMode}
      />
    );
  };

  const renderResource = () => {
    return (
      <div>
        <Row>
          <Col xs={12} lg={5}>
            <ResourceBox
              base64File={base64File}
              flowchart={category === "Flowchart"}
              id={id}
              name={name}
              rating={rating}
              totalRating={totalRating}
              views={visit}
              imagePreviewUrl={imagePreviewUrl}
              resourceFileType={resourceFileType}
            />
          </Col>
          <Col xs={12} lg={7}>
            <div className="mt-5 mt-lg-0">
              <h5>
                Category:&nbsp;
                <span className="text-orange">
                  {category}
                </span>
              </h5>
              {category === "Flowchart" ? (
                <>
                  <h5 className="mt-5">Business Process:</h5>
                  <TangerineLink
                    to={`/business-process/${businessProcessId}`}
                  >
                    {businessProcessName}
                  </TangerineLink>
                </>
              ) : (
                <>
                  <div>
                    <h5 className="mt-5">Related Business Process:</h5>
                    {bps ? (
                      <ul>
                        {
                          <li>
                            <TangerineLink to={`/risk-and-control/${businessProcessId}`}>
                              {businessProcessName}
                            </TangerineLink>
                          </li>
                        }
                      </ul>
                    ) : (
                      <EmptyAttribute centered={false} />
                    )}
                  </div>
                  <div>
                    <h5 className="mt-5">Related Policies:</h5>
                    {policies.length ? (
                      <ul>
                        {filteredNames(policies).map((policy: any) => (
                          <li key={policy.id}>
                            <TangerineLink to={`/policy/${policy.id}`}>
                              {policy.title}
                            </TangerineLink>
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
          </Col>
        </Row>
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
            <PickIcon name="pencilO" />
          </DialogButton>
        </Tooltip>
      );
    }
    if (premise === 3) {
      if (inEditMode) {
        return null;
        // <Button onClick={toggleEditMode} color="">
        //   <FaTimes size={22} className="mr-2" />
        //   Cancel Edit
        // </Button>
      }
      return (
        <div className="d-flex">
          {/* <DialogButton
            onConfirm={handleDelete}
            loading={deleteInfo.loading}
            message={`Delete Resource "${name}"?`}
            className="soft red mr-2"
          >
            <FaTrash />
          </DialogButton> */}
          <Tooltip description="Edit Resource">
            <Button onClick={toggleEditMode} color="" className="soft orange">
              <PickIcon name="pencilFill" style={{ width: "15px" }} />
            </Button>
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
          ["/resources/" + id, name],
        ]}
      />
      <Row>
        <Col>
          <HeaderWithBackButton heading={name} draft={!!draft} />
        </Col>
        <Col>
          <div className="d-flex justify-content-end mb-3">
            {renderResourceAction()}
          </div>
        </Col>
      </Row>
      {inEditMode ? renderResourceInEditMode() : renderResource()}
    </div>
  );
}
