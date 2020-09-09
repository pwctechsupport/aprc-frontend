import { capitalCase } from "capital-case";
import get from "lodash/get";
import React, { Fragment, useEffect, useState } from "react";
import {
  AiFillEdit,
  AiOutlineClockCircle,
  AiOutlineEdit,
} from "react-icons/ai";
import { FaExclamationCircle } from "react-icons/fa";
import { IoMdOpen } from "react-icons/io";
import { RouteComponentProps } from "react-router";
import { Col, Row } from "reactstrap";
import {
  Frequency,
  Nature,
  TypeOfControl,
  useApproveRequestEditMutation,
  useControlQuery,
  useCreateRequestEditMutation,
  useReviewControlDraftMutation,
  useUpdateControlMutation,
  useBusinessProcessesQuery,
} from "../../generated/graphql";
import { APP_ROOT_URL } from "../../settings";
import BreadCrumb from "../../shared/components/BreadCrumb";
import Button from "../../shared/components/Button";
import DialogButton from "../../shared/components/DialogButton";
import EmptyAttribute from "../../shared/components/EmptyAttribute";
import HeaderWithBackButton from "../../shared/components/Header";
import LoadingSpinner from "../../shared/components/LoadingSpinner";
import Table from "../../shared/components/Table";
import Tooltip from "../../shared/components/Tooltip";
import useEditState from "../../shared/hooks/useEditState";
import {
  notifyGraphQLErrors,
  notifyInfo,
  notifySuccess,
} from "../../shared/utils/notif";
import ControlForm, { CreateControlFormValues } from "./components/ControlForm";
import CheckBox from "../../shared/components/forms/CheckBox";
// import { takeValue } from "../../shared/formatter";

const Control = ({ match, history, location }: RouteComponentProps) => {
  const [inEditMode, setInEditMode] = useState<boolean>(false);
  function toggleEditMode() {
    setInEditMode((p) => !p);
  }
  useEffect(() => {
    setInEditMode((p) => (p ? false : p));
  }, [location.pathname]);

  const id = get(match, "params.id", "");
  const { loading, data } = useControlQuery({
    fetchPolicy: "network-only",
    variables: { id },
  });
  const draft = data?.control?.draft?.objectResult;
  const hasEditAccess = data?.control?.hasEditAccess || false;
  const requestStatus = data?.control?.requestStatus;
  const requestEditState = data?.control?.requestEdit?.state;
  const premise = useEditState({
    draft,
    hasEditAccess,
    requestStatus,
    requestEditState,
  });

  // Review handlers
  const [reviewMutation, reviewMutationInfo] = useReviewControlDraftMutation({
    refetchQueries: ["control"],
    awaitRefetchQueries: true,
  });
  async function review({ publish }: { publish: boolean }) {
    try {
      await reviewMutation({ variables: { id, publish } });
      notifySuccess(publish ? "Changes Approved" : "Changes Rejected");
    } catch (error) {
      notifyGraphQLErrors(error);
    }
  }

  // Update handlers
  const [update, updateState] = useUpdateControlMutation({
    onCompleted: () => {
      notifySuccess("Update Success");
      setInEditMode(false);
    },
    onError: notifyGraphQLErrors,
    refetchQueries: ["control"],
    awaitRefetchQueries: true,
  });
  function handleUpdate(values: CreateControlFormValues) {
    update({
      variables: {
        input: {
          id,
          ...values,
        },
      },
    });
  }

  // Delete handlers
  // const [destoryControl, destoryControlInfo] = useDestroyControlMutation({
  //   onCompleted: () => {
  //     notifySuccess("Delete Success");
  //     history.push("/control");
  //   },
  //   onError: notifyGraphQLErrors,
  //   refetchQueries: ["controls", "adminControls", "reviewerControlsStatus"],
  //   awaitRefetchQueries: true,
  // });

  // Request Edit handlers
  const [
    requestEditMutation,
    requestEditMutationInfo,
  ] = useCreateRequestEditMutation({
    variables: { id, type: "Control" },
    onError: notifyGraphQLErrors,
    onCompleted: () => notifyInfo("Edit access requested"),
    refetchQueries: ["control"],
  });

  // Approve and Reject Request Edit handlers
  const [
    approveEditMutation,
    approveEditMutationResult,
  ] = useApproveRequestEditMutation({
    refetchQueries: ["control"],
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
  const { data: dataBps, loading: loadingBps } = useBusinessProcessesQuery({
    variables: {
      filter: {
        risks_controls_id_eq: id,
      },
    },
  });
  if (loading) return <LoadingSpinner centered size={30} />;

  const description = draft
    ? get(data, "control.draft.objectResult.description", "")
    : data?.control?.description || "";
  const updatedAt = draft
    ? get(data, "control.draft.objectResult.updatedAt", "")
    : data?.control?.updatedAt?.split(" ")[0] || "";

  const lastUpdatedBy = draft
    ? get(data, "control.draft.objectResult.lastUpdatedBy", "")
    : data?.control?.lastUpdatedBy || "";
  const createdBy = draft
    ? get(data, "control.draft.objectResult.createdBy", "")
    : data?.control?.createdBy || "";
  const controlOwnerId = data?.control?.departments?.map((a) => a.id) || [];
  const assertion = draft
    ? get(data, "control.draft.objectResult.assertion", [])
    : data?.control?.assertion || [];
  const frequency = draft
    ? get(data, "control.draft.objectResult.frequency", "")
    : data?.control?.frequency || "";
  const ipo = draft
    ? get(data, "control.draft.objectResult.ipo", [])
    : data?.control?.ipo || [];
  const nature = draft
    ? get(data, "control.draft.objectResult.nature", "")
    : data?.control?.nature || "";
  const typeOfControl = draft
    ? get(data, "control.draft.objectResult.typeOfControl", "")
    : data?.control?.typeOfControl || "";
  // const status = draft
  //   ? get(data, "control.draft.objectResult.status", "")
  //   : data?.control?.status || "";
  const keyControl = draft
    ? get(data, "control.draft.objectResult.keyControl", false)
    : data?.control?.keyControl || false;
  const risks = data?.control?.risks || [];
  const riskIds = risks.map((a) => a.id);

  const businessProcesses =
    dataBps?.navigatorBusinessProcesses?.collection || [];
  const businessProcessIds = businessProcesses.map((bp) => bp.id);
  const activityControls = data?.control?.activityControls || [];
  const createdAt = draft
    ? get(data, "control.draft.objectResult.createdAt", "")
    : data?.control?.createdAt || "";
  const controlOwners = draft
    ? get(data, "control.draft.objectResult.controlOwner", [])
    : data?.control?.controlOwner || [];

  const filteredNames = (names: any) =>
    names.filter((v: any, i: any) => names.indexOf(v) === i);
  const renderControlAction = () => {
    if (premise === 6) {
      return (
        <Tooltip description="Accept edit request">
          <DialogButton
            title={`Accept request to edit?`}
            message={`Request by ${data?.control?.requestEdit?.user?.name}`}
            className="soft red mr-2"
            data={data?.control?.requestEdit?.id}
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
          {/* <DialogButton
            onConfirm={() => destoryControl({ variables: { id } })}
            loading={destoryControlInfo.loading}
            message={`Delete Control "${description}"?`}
            className="soft red mr-2"
          >
            <FaTrash />
          </DialogButton> */}
          <Tooltip description="Edit Control">
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

  const renderControlNonEditable = () => {
    const details = [
      { label: "Control id", value: id },
      { label: "Description", value: description },

      {
        label: "Control owner",
        value: controlOwners.join(", "),
      },
      {
        label: "Key control",
        value: <CheckBox checked={keyControl} />,
      },
      { label: "Type of control", value: capitalCase(typeOfControl) },
      {
        label: "Assertion",
        value: assertion.map((x: any) => capitalCase(x)).join(", "),
      },
      {
        label: "IPO",
        value: ipo.map((x: any) => capitalCase(x)).join(", "),
      },
      { label: "Frequency", value: capitalCase(frequency) },
      // { label: "Status", value: capitalCase(status) },
      { label: "Last updated", value: updatedAt },
      { label: "Last updated by", value: lastUpdatedBy },
      { label: "Created at", value: createdAt.split(" ")[0] },
      { label: "Created by", value: createdBy },
    ];
    return (
      <Row>
        <Col xs={6}>
          <dl>
            {details.slice(0, Math.ceil(details.length / 2)).map((item) => (
              <Fragment key={item.label}>
                <dt>{item.label}</dt>
                <dd>{item.value || "-"}</dd>
              </Fragment>
            ))}
            <dt>Risks</dt>
            {risks.length ? (
              filteredNames(risks).map((risk: any) => (
                <dd key={risk.id}>{risk.name}</dd>
              ))
            ) : (
              <EmptyAttribute />
            )}
            <dt>Business processes</dt>
            {loadingBps ? (
              <LoadingSpinner centered size={20} />
            ) : businessProcesses.length ? (
              filteredNames(businessProcesses).map((bp: any) => (
                <li key={bp.id}>{bp.name}</li>
              ))
            ) : (
              <EmptyAttribute />
            )}
          </dl>
        </Col>
        <Col xs={6}>
          <dl>
            {details
              .slice(Math.ceil(details.length / 2), details.length)
              .map((item) => (
                <Fragment key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value || "-"}</dd>
                </Fragment>
              ))}
          </dl>
        </Col>

        {activityControls.length > 0 ? (
          <Col xs={7} className="mt-2">
            <dt className="mb-1">Control activities</dt>
            <Table>
              <thead>
                <tr>
                  <th style={{ fontSize: "13px", fontWeight: "normal" }}>
                    Control activity
                  </th>
                  <th style={{ fontSize: "13px", fontWeight: "normal" }}>
                    Guidance
                  </th>
                </tr>
              </thead>
              <tbody>
                {activityControls.map((activity) => (
                  <tr key={"Row" + activity.id}>
                    <td style={{ fontSize: "13px", fontWeight: "normal" }}>
                      {activity.activity}
                    </td>
                    <td style={{ fontSize: "13px", fontWeight: "normal" }}>
                      {activity.guidance ? (
                        activity.guidance
                      ) : activity.guidanceFileName ? (
                        <div className="d-flex align-items-center ">
                          <Button color="" className="soft orange">
                            <a
                              href={`${APP_ROOT_URL}${activity.guidanceResuploadUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              download={`Pwc-ActivityControl ${activity.guidanceFileName}`}
                              className="text-orange"
                            >
                              <span className="mr-2">
                                {activity.guidanceFileName}
                              </span>
                              <IoMdOpen />
                            </a>
                          </Button>
                        </div>
                      ) : (
                        "N/A"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Col>
        ) : null}
      </Row>
    );
  };

  const renderControlEditable = () => {
    return (
      <ControlForm
        onSubmit={handleUpdate}
        isDraft={draft ? true : false}
        defaultValues={{
          controlOwner: controlOwnerId,
          description,
          assertion: assertion as CreateControlFormValues["assertion"],
          frequency: (frequency as Frequency) || Frequency.Annually,
          ipo: ipo as CreateControlFormValues["ipo"],
          nature: (nature as Nature) || Nature.Corrective,
          typeOfControl:
            (typeOfControl as TypeOfControl) || TypeOfControl.Automatic,
          riskIds,
          businessProcessIds,
          keyControl,
          activityControls,
        }}
        toggleEditMode={toggleEditMode}
        submitting={updateState.loading}
      />
    );
  };

  return (
    <div>
      <BreadCrumb
        crumbs={[
          ["/control", "Controls"],
          ["/control/" + id, description],
        ]}
      />
      <div className="d-flex justify-content-between align-items-center">
        <HeaderWithBackButton heading={description} draft={!!draft} />
        {renderControlAction()}
      </div>
      {inEditMode ? renderControlEditable() : renderControlNonEditable()}
    </div>
  );
};

export default Control;
