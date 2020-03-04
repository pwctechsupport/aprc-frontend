import { capitalCase } from "capital-case";
import get from "lodash/get";
import React, { Fragment, useState } from "react";
import {
  AiFillEdit,
  AiOutlineEdit,
  AiOutlineClockCircle
} from "react-icons/ai";
import { FaTimes, FaTrash, FaExclamationCircle } from "react-icons/fa";
import { RouteComponentProps } from "react-router";
import { Col, Row } from "reactstrap";
import {
  Frequency,
  Nature,
  Status,
  TypeOfControl,
  useControlQuery,
  useReviewControlDraftMutation,
  useUpdateControlMutation,
  useDestroyControlMutation,
  useCreateRequestEditMutation,
  useApproveRequestEditMutation
} from "../../generated/graphql";
import BreadCrumb from "../../shared/components/BreadCrumb";
import Button from "../../shared/components/Button";
import DialogButton from "../../shared/components/DialogButton";
import EmptyAttribute from "../../shared/components/EmptyAttribute";
import HeaderWithBackButton from "../../shared/components/HeaderWithBack";
import Tooltip from "../../shared/components/Tooltip";
import {
  notifyGraphQLErrors,
  notifySuccess,
  notifyInfo
} from "../../shared/utils/notif";
import ControlForm, { CreateControlFormValues } from "./components/ControlForm";
import useEditState from "../../shared/hooks/useEditState";
import LoadingSpinner from "../../shared/components/LoadingSpinner";
import Table from "../../shared/components/Table";
import { IoMdOpen } from "react-icons/io";

const Control = ({ match, history }: RouteComponentProps) => {
  const [inEditMode, setInEditMode] = useState<boolean>(false);
  function toggleEditMode() {
    setInEditMode(p => !p);
  }

  const id = get(match, "params.id", "");
  const { loading, data } = useControlQuery({ variables: { id } });

  const draft = data?.control?.draft?.objectResult;
  const hasEditAccess = data?.control?.hasEditAccess || false;
  const requestStatus = data?.control?.requestStatus;
  const requestEditState = data?.control?.requestEdit?.state;
  const premise = useEditState({
    draft,
    hasEditAccess,
    requestStatus,
    requestEditState
  });

  // Review handlers
  const [reviewMutation, reviewMutationInfo] = useReviewControlDraftMutation({
    refetchQueries: ["control"]
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
    awaitRefetchQueries: true
  });
  function handleUpdate(values: CreateControlFormValues) {
    update({
      variables: {
        input: {
          id,
          ...values
        }
      }
    });
  }

  // Delete handlers
  const [destoryControl, destoryControlInfo] = useDestroyControlMutation({
    onCompleted: () => {
      notifySuccess("Delete Success");
      history.push("/control");
    },
    onError: notifyGraphQLErrors,
    refetchQueries: ["controls"],
    awaitRefetchQueries: true
  });

  // Request Edit handlers
  const [
    requestEditMutation,
    requestEditMutationInfo
  ] = useCreateRequestEditMutation({
    variables: { id, type: "Control" },
    onError: notifyGraphQLErrors,
    onCompleted: () => notifyInfo("Edit access requested"),
    refetchQueries: ["control"]
  });

  // Approve and Reject Request Edit handlers
  const [
    approveEditMutation,
    approveEditMutationResult
  ] = useApproveRequestEditMutation({
    refetchQueries: ["control"],
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

  if (loading) return <LoadingSpinner centered size={30} />;

  let description = data?.control?.description || "";
  description = draft ? `[Draft] ${description}` : description;
  const controlOwner = data?.control?.controlOwner || "";
  const assertion = data?.control?.assertion || [];
  const frequency = data?.control?.frequency || "";
  const ipo = data?.control?.ipo || [];
  const nature = data?.control?.nature || "";
  const typeOfControl = data?.control?.typeOfControl || "";
  const status = data?.control?.status || "";
  const keyControl = data?.control?.keyControl || false;
  const risks = data?.control?.risks || [];
  const riskIds = risks.map(a => a.id);
  const businessProcesses = data?.control?.businessProcesses || [];
  const businessProcessIds = businessProcesses.map(bp => bp.id);
  const activityControls = data?.control?.activityControls || [];

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
            onConfirm={() => destoryControl({ variables: { id } })}
            loading={destoryControlInfo.loading}
            message={`Delete Control "${description}"?`}
            className="soft red mr-2"
          >
            <FaTrash />
          </DialogButton>
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

  const renderControlNonEditable = () => {
    const details = [
      { label: "Control Owner", value: controlOwner },
      {
        label: "Key Control",
        value: (
          <input type="checkbox" checked={keyControl} onChange={() => {}} />
        )
      },
      { label: "Type of Control", value: capitalCase(typeOfControl) },
      {
        label: "Assertion",
        value: assertion.map(x => capitalCase(x)).join(", ")
      },
      {
        label: "IPO",
        value: ipo.map(x => capitalCase(x)).join(", ")
      },
      { label: "Frequency", value: capitalCase(frequency) },
      { label: "Status", value: capitalCase(status) }
    ];
    return (
      <Row>
        <Col xs={6}>
          <dl>
            {details.slice(0, Math.ceil(details.length / 2)).map(item => (
              <Fragment key={item.label}>
                <dt>{item.label}</dt>
                <dd>{item.value || "-"}</dd>
              </Fragment>
            ))}
          </dl>
        </Col>
        <Col xs={6}>
          <dl>
            {details
              .slice(Math.ceil(details.length / 2), details.length)
              .map(item => (
                <Fragment key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value || "-"}</dd>
                </Fragment>
              ))}
          </dl>
        </Col>

        <Col xs={12} className="mt-3">
          <h5>Risks</h5>
          {risks.length ? (
            risks.map(risk => <p key={risk.id}>{risk.name}</p>)
          ) : (
            <EmptyAttribute />
          )}
          <h5 className="mt-2">Business Processes</h5>
          {businessProcesses.length ? (
            businessProcesses.map(bp => <p key={bp.id}>{bp.name}</p>)
          ) : (
            <EmptyAttribute />
          )}
        </Col>

        {activityControls.length > 0 ? (
          <Col xs={7} className="mt-2">
            <h5>Activity Controls</h5>
            <Table>
              <thead>
                <tr>
                  <th>Activity</th>
                  <th>Guidance</th>
                </tr>
              </thead>
              <tbody>
                {activityControls.map(activity => (
                  <tr key={"Row" + activity.id}>
                    <td>{activity.activity}</td>
                    <td>
                      {activity.guidance ? (
                        activity.guidance
                      ) : (
                        <div className="d-flex align-items-center ">
                          <Button color="" className="soft orange">
                            <a
                              href={`http://mandalorian.rubyh.co${activity.guidanceResuploadUrl}`}
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
          controlOwner,
          description,
          assertion: assertion as CreateControlFormValues["assertion"],
          frequency: (frequency as Frequency) || Frequency.Annually,
          ipo: ipo as CreateControlFormValues["ipo"],
          nature: (nature as Nature) || Nature.Corrective,
          typeOfControl:
            (typeOfControl as TypeOfControl) || TypeOfControl.Automatic,
          status: (status as Status) || Status.Draft,
          riskIds,
          businessProcessIds,
          keyControl,
          activityControls
        }}
        submitting={updateState.loading}
      />
    );
  };

  return (
    <div>
      <BreadCrumb
        crumbs={[
          ["/control", "Controls"],
          ["/control/" + id, description]
        ]}
      />
      <div className="d-flex justify-content-between align-items-center">
        <HeaderWithBackButton heading={description} />
        {renderControlAction()}
      </div>
      {inEditMode ? renderControlEditable() : renderControlNonEditable()}
    </div>
  );
};

export default Control;
