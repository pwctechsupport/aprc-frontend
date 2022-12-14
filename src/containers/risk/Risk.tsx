import startCase from "lodash/startCase";
import React, { Fragment, useEffect, useState } from "react";
import Helmet from "react-helmet";
import { AiOutlineClockCircle } from "react-icons/ai";
import { FaExclamationCircle } from "react-icons/fa";
import { RouteComponentProps } from "react-router";
import { Col, Row } from "reactstrap";
import get from "lodash/get";
import {
  LevelOfRisk,
  TypeOfRisk,
  useApproveRequestEditMutation,
  useCreateRequestEditMutation,
  useReviewRiskDraftMutation,
  useRiskQuery,
  useUpdateRiskMutation,
  useBusinessProcessesQuery,
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
  notifyReject,
} from "../../shared/utils/notif";
import RiskForm, { RiskFormValues } from "./components/RiskForm";
import PickIcon from "../../assets/Icons/PickIcon";
import { Badge } from "../../shared/components/Badge";
import { capitalCase } from "capital-case";
import DateHover from '../../shared/components/DateHover';
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
    fetchPolicy: "no-cache",
  });
  const draft: any = data?.risk?.draft?.objectResult;
  const name = data?.risk?.name || "";
  const levelOfRisk = draft?.levelOfRisk || data?.risk?.levelOfRisk || "";
  const typeOfRisk = draft?.typeOfRisk || data?.risk?.typeOfRisk || "";
  const bps = data?.risk?.businessProcess || [];
  const updatedAt = draft ? get(data, "risk.draft.objectResult.updatedAt", "") : data?.risk?.updatedAt;
  const updatedBy = data?.risk?.lastUpdatedBy;
  const createdBy = data?.risk?.createdBy;
  const createdAt = draft ? get(data, "risk.draft.objectResult.createdAt", "") : data?.risk?.createdAt;
  const hasEditAccess = data?.risk?.hasEditAccess || false;
  const requestStatus = data?.risk?.requestStatus;
  const requestEditState = data?.risk?.requestEdit?.state;
  const draftName = draft?.name
  const businessProcessesData = data?.risk?.businessProcesses

  const premise = useEditState({
    draft,
    hasEditAccess,
    requestStatus,
    requestEditState,
  });

  const businessProcesses =
    data?.risk?.businessProcesses
      ?.filter((a) => bps.includes(a.name || ""))
      .map(toLabelValue) || [];

  const globalBps = useBusinessProcessesQuery({
    skip: premise !== 3,
    variables: { filter: { ancestry_null: false } },
  });

  const getValueFormBpsData =
    globalBps.data?.navigatorBusinessProcesses?.collection || [];

  const prepareBpsDefaultValue = getValueFormBpsData.filter((a) =>
    businessProcesses.map((b: any) => b.value).includes(a.id)
  );
  const getParentOrGrandParent = prepareBpsDefaultValue.map((a) => {
    if (a.parent?.parent?.id) {
      return {
        value: a.id || "",
        label: a.name || "",
        grandParentLabel: a.parent.parent.name || "",
        grandParentValue: a.parent.parent.id || "",
        parentLabel: a.parent.name || "",
        parentValue: a.parent.id || "",
      };
    } else {
      return {
        parentValue: a.id || "",
        parentLabel: a.name || "",
        grandParentLabel: a.parent?.name || "",
        grandParentValue: a.parent?.id || "",
      };
    }
  });

  const defaultValues: RiskFormValues = {
    name,
    businessProcessIds: getParentOrGrandParent,
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
          businessProcessIds: values.businessProcessIds || [],
          levelOfRisk: values.levelOfRisk,
          typeOfRisk: values.typeOfRisk,
        },
      },
    })
  }

  // Delete hanlders
  // const [destoryRisk, destoryRiskInfo] = useDestroyRiskMutation({
  //   onCompleted: () => {
  //     notifySuccess("Delete Success");
  //     history.push("/risk");
  //   },
  //   onError: notifyGraphQLErrors,
  //   refetchQueries: ["risks", "adminRisks", "reviewerRisksStatus"],
  //   awaitRefetchQueries: true,
  // });

  // Review handlers
  const [reviewMutation, reviewMutationInfo] = useReviewRiskDraftMutation({
    refetchQueries: ["risk"],
  });
  async function review({ publish }: { publish: boolean }) {
    try {
      await reviewMutation({ variables: { id, publish } });
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

  if (loading || globalBps.loading)
    return <LoadingSpinner centered size={30} />;

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
            <PickIcon name="pencilO" />
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
            onConfirm={() => destoryRisk({ variables: { id } })}
            loading={destoryRiskInfo.loading}
            message={`Delete Risk "${name}"?`}
            className="soft red mr-2"
          >
            <FaTrash />
          </DialogButton> */}
          <Tooltip description="Edit Risk">
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
      { label: "Risk ID", value: id },
      { 
        label: "Name", 
        value: draft ? draftName : name 
      },
      {
        label: "Business process",
        value: businessProcessesData?.map(item => item.name).join(", "),
      },
      {
        label: "Level of risk",
        value: (
          <Badge color="secondary">
            {startCase(levelOfRisk)}
          </Badge>
        ),
      },
      {
        label: "Type of risk",
        value: <Badge color="secondary">{startCase(typeOfRisk)}</Badge>,
      },
    ];
    const details2 = [
      {
        label: "Last updated",
        value: draft ? <DateHover humanize={false}>{updatedAt?.split("T")[0]}</DateHover> : <DateHover humanize={false}>{updatedAt?.split(" ")[0]}</DateHover>,
      },
      {
        label: "Updated by",
        value: updatedBy,
      },
      {
        label: "Created at",
        value: draft ? <DateHover humanize={false}>{createdAt?.split("T")[0]}</DateHover> : <DateHover humanize={false}>{createdAt?.split(" ")[0]}</DateHover>,
      },
      {
        label: "Created by",
        value: createdBy,
      },
      {
        label: "Status",
        value: capitalCase(data?.risk?.status || ''),
      },
    ];
    return (
      <Row>
        <Col xs={6}>
          <dl>
            {details1.map((item) => (
              <Fragment key={item.label}>
                <dt>{item.label}</dt>
                {item.label === "Name" ? (
                  <dd style={{overflow: "hidden", overflowWrap: "break-word"}}>{item.value || "-"}</dd>
                ) : (
                  <dd>{item.value || "-"}</dd>
                )}
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
        <title>{draft ? draftName : name} - Risk - PricewaterhouseCoopers</title>
      </Helmet>
      <BreadCrumb
        crumbs={[
          ["/risk", "Risks"],
          ["/risk/" + id, (draft ? draftName : name)],
        ]}
      />
      <Row>
        <Col>
          <HeaderWithBackButton heading={draft ? draftName : name} draft={!!draft} />
        </Col>
        <Col>
          <div  className="d-flex justify-content-end mb-3">
            {renderRiskAction()}
          </div>
        </Col>
      </Row>
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
