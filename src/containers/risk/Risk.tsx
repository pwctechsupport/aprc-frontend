import startCase from "lodash/startCase";
import React, { Fragment, useEffect, useState } from "react";
import Helmet from "react-helmet";
import {
  AiFillEdit,
  AiOutlineClockCircle,
  AiOutlineEdit,
} from "react-icons/ai";
import { FaExclamationCircle, FaTrash } from "react-icons/fa";
import { RouteComponentProps } from "react-router";
import { Badge, Col, Row } from "reactstrap";
import {
  LevelOfRisk,
  TypeOfRisk,
  useApproveRequestEditMutation,
  useCreateRequestEditMutation,
  useDestroyRiskMutation,
  useReviewRiskDraftMutation,
  useRiskQuery,
  useUpdateRiskMutation,
} from "../../generated/graphql";
import BreadCrumb from "../../shared/components/BreadCrumb";
import Button from "../../shared/components/Button";
import DialogButton from "../../shared/components/DialogButton";
import HeaderWithBackButton from "../../shared/components/Header";
import LoadingSpinner from "../../shared/components/LoadingSpinner";
import Tooltip from "../../shared/components/Tooltip";
import { toLabelValue } from "../../shared/formatter";
import useEditState from "../../shared/hooks/useEditState";
import getRiskColor from "../../shared/utils/getRiskColor";
import {
  notifyGraphQLErrors,
  notifyInfo,
  notifySuccess,
} from "../../shared/utils/notif";
import RiskForm, { RiskFormValues } from "./components/RiskForm";
// import styled from "styled-components";

export default function Risk({
  match,
  history,
  location,
}: RouteComponentProps) {
  const [inEditMode, setInEditMode] = useState<boolean>(false);
  function toggleEditMode() {
    setInEditMode((p) => !p);
  }
  useEffect(() => {
    setInEditMode((p) => (p ? false : p));
  }, [location.pathname]);

  const id = match.params && (match.params as any).id;
  const { data, loading } = useRiskQuery({
    variables: { id },
    fetchPolicy: "network-only",
  });
  const draft = data?.risk?.draft?.objectResult;
  const name = data?.risk?.name || "";
  const levelOfRisk = data?.risk?.levelOfRisk || "";
  const typeOfRisk = data?.risk?.typeOfRisk || "";
  const bps = data?.risk?.businessProcesses || [];
  const updatedAt = data?.risk?.updatedAt;
  const updatedBy = data?.risk?.lastUpdatedBy;
  const createdBy = data?.risk?.createdBy;
  const createdAt = data?.risk?.createdAt;
  const hasEditAccess = data?.risk?.hasEditAccess || false;
  const requestStatus = data?.risk?.requestStatus;
  const requestEditState = data?.risk?.requestEdit?.state;
  const premise = useEditState({
    draft,
    hasEditAccess,
    requestStatus,
    requestEditState,
  });
  const defaultValues: RiskFormValues = {
    name,
    businessProcessIds: data?.risk?.businessProcesses?.map(toLabelValue) || [],
    levelOfRisk: levelOfRisk as LevelOfRisk,
    typeOfRisk: typeOfRisk as TypeOfRisk,
  };

  // Update handlers
  const [update, updateRiskMutation] = useUpdateRiskMutation({
    onCompleted: () => {
      notifySuccess("Update Success");
      setInEditMode(false);
    },
    onError: notifyGraphQLErrors,
    refetchQueries: ["risks", "risk", "adminRisks", "reviewerRisksStatus"],
    awaitRefetchQueries: true,
  });
  function handleUpdate(values: RiskFormValues) {
    update({
      variables: {
        input: {
          id,
          name: values.name,
          businessProcessIds: values.businessProcessIds?.map((a) => a.value),
          levelOfRisk: values.levelOfRisk,
          typeOfRisk: values.typeOfRisk,
        },
      },
    });
  }

  // Delete hanlders
  const [destoryRisk, destoryRiskInfo] = useDestroyRiskMutation({
    onCompleted: () => {
      notifySuccess("Delete Success");
      history.push("/risk");
    },
    onError: notifyGraphQLErrors,
    refetchQueries: ["risks", "adminRisks", "reviewerRisksStatus"],
    awaitRefetchQueries: true,
  });

  // Review handlers
  const [reviewMutation, reviewMutationInfo] = useReviewRiskDraftMutation({
    refetchQueries: ["risk"],
  });
  async function review({ publish }: { publish: boolean }) {
    try {
      await reviewMutation({ variables: { id, publish } });
      notifySuccess(publish ? "Changes Approved" : "Changes Rejected");
    } catch (error) {
      notifyGraphQLErrors(error);
    }
  }

  // Request Edit handlers
  const [
    requestEditMutation,
    requestEditMutationInfo,
  ] = useCreateRequestEditMutation({
    variables: { id, type: "Risk" },
    onError: notifyGraphQLErrors,
    onCompleted: () => notifyInfo("Edit access requested"),
    refetchQueries: ["risk"],
  });

  // Approve and Reject handlers
  const [
    approveEditMutation,
    approveEditMutationResult,
  ] = useApproveRequestEditMutation({
    refetchQueries: ["risk"],
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

  if (loading) return <LoadingSpinner centered size={30} />;

  const renderRiskAction = () => {
    if (premise === 6) {
      return (
        <Tooltip description="Accept edit request">
          <DialogButton
            title={`Accept request to edit?`}
            message={`Request by ${data?.risk?.requestEdit?.user?.name}`}
            className="soft red mr-2"
            data={data?.risk?.requestEdit?.id}
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
        return null;
        // <Button onClick={toggleEditMode} color="">
        // <FaTimes size={22} className="mr-2" />
        // Cancel Edit
        // </Button>
      }
      return (
        <div className="d-flex">
          <DialogButton
            onConfirm={() => destoryRisk({ variables: { id } })}
            loading={destoryRiskInfo.loading}
            message={`Delete Risk "${name}"?`}
            className="soft red mr-2"
          >
            <FaTrash />
          </DialogButton>
          <Tooltip description="Edit Risk">
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
            loading={reviewMutationInfo.loading}
          >
            Reject
          </DialogButton>
          <DialogButton
            color="primary"
            className="pwc"
            onConfirm={() => review({ publish: true })}
            loading={reviewMutationInfo.loading}
          >
            Approve
          </DialogButton>
        </div>
      );
    }
    return null;
  };

  const renderRisk = () => {
    const details1 = [
      { label: "Risk Id", value: id },
      { label: "Name", value: name },
      {
        label: "Business Process",
        value: bps.length ? bps?.map((a) => a.name).join(", ") : "",
      },
      {
        label: "Level of Risk",
        value: (
          <Badge color={getRiskColor(levelOfRisk)}>
            {startCase(levelOfRisk)}
          </Badge>
        ),
      },
      {
        label: "Type of Risk",
        value: <Badge color="secondary">{startCase(typeOfRisk)}</Badge>,
      },
    ];
    const details2 = [
      {
        label: "Last Updated",
        value: draft ? updatedAt?.split("T")[0] : updatedAt?.split(" ")[0],
      },
      {
        label: "Updated By",
        value: updatedBy,
      },
      {
        label: "Created At",
        value: draft ? createdAt?.split("T")[0] : createdAt?.split(" ")[0],
      },
      {
        label: "Created By",
        value: createdBy,
      },
      {
        label: "Status",
        value: draft ? "Waiting for review" : "Release",
      },
    ];
    return (
      <Row>
        <Col xs={6}>
          <dl>
            {details1.map((item) => (
              <Fragment key={item.label}>
                <dt>{item.label}</dt>
                <dd>{item.value || "-"}</dd>
              </Fragment>
            ))}
          </dl>
        </Col>
        <Col xs={6}>
          {details2.map((item) => (
            <Fragment key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value || "-"}</dd>
            </Fragment>
          ))}
        </Col>
      </Row>
    );
  };

  return (
    <div>
      <Helmet>
        <title>{name} - Risk - PricewaterhouseCoopers</title>
      </Helmet>
      <BreadCrumb
        crumbs={[
          ["/risk", "Risks"],
          ["/risk/" + id, name],
        ]}
      />
      <div className="d-flex justify-content-between align-items-center">
        <HeaderWithBackButton heading={name} draft={!!draft} />
        {renderRiskAction()}
      </div>
      {inEditMode ? (
        <RiskForm
          defaultValues={defaultValues}
          onSubmit={handleUpdate}
          submitting={updateRiskMutation.loading}
          toggleEditMode={toggleEditMode}
        />
      ) : (
        renderRisk()
      )}
    </div>
  );
}
