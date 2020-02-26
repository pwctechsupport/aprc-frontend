import { capitalCase } from "capital-case";
import get from "lodash/get";
import React, { useState, Fragment } from "react";
import { AiFillEdit } from "react-icons/ai";
import { FaTimes } from "react-icons/fa";
import { RouteComponentProps } from "react-router";
import { toast } from "react-toastify";
import { oc } from "ts-optchain";
import {
  Frequency,
  Nature,
  Status,
  TypeOfControl,
  useControlQuery,
  useReviewControlDraftMutation,
  useUpdateControlMutation
} from "../../generated/graphql";
import BreadCrumb from "../../shared/components/BreadCrumb";
import Button from "../../shared/components/Button";
import DialogButton from "../../shared/components/DialogButton";
import EmptyAttribute from "../../shared/components/EmptyAttribute";
import HeaderWithBackButton from "../../shared/components/HeaderWithBack";
import useAccessRights from "../../shared/hooks/useAccessRights";
import { notifyGraphQLErrors, notifySuccess } from "../../shared/utils/notif";
import ControlForm, { CreateControlFormValues } from "./components/ControlForm";
import { Row, Col } from "reactstrap";
import Tooltip from "../../shared/components/Tooltip";

const Control = ({ match }: RouteComponentProps) => {
  const [inEditMode, setInEditMode] = useState(false);
  const id = get(match, "params.id", "");
  const { loading, data } = useControlQuery({ variables: { id } });
  const draft = data?.control?.draft?.objectResult;
  const [reviewControl, reviewControlM] = useReviewControlDraftMutation({
    refetchQueries: ["control"]
  });
  async function review({ publish }: { publish: boolean }) {
    try {
      await reviewControl({ variables: { id, publish } });
      notifySuccess(publish ? "Changes Approved" : "Changes Rejected");
    } catch (error) {
      notifyGraphQLErrors(error);
    }
  }
  const [isAdmin] = useAccessRights(["admin"]);
  const [update, updateState] = useUpdateControlMutation({
    onCompleted: () => {
      toast.success("Update Success");
    },
    onError: () => toast.error("Update Failed"),
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

  const controlOwner = data?.control?.controlOwner || "";
  let description = data?.control?.description || "";
  description = draft ? `[Draft] ${description}` : description;
  const assertion = data?.control?.assertion || [];
  const frequency = oc(data).control.frequency("");
  const ipo = oc(data).control.ipo([]);
  const nature = oc(data).control.nature("");
  const typeOfControl = oc(data).control.typeOfControl("");
  const status = data?.control?.status || "";
  const keyControl = data?.control?.keyControl || false;
  const risks = data?.control?.risks || [];
  const riskIds = risks.map(a => a.id);
  const businessProcesses = data?.control?.businessProcesses || [];
  const businessProcessIds = businessProcesses.map(bp => bp.id);
  const activityControls = data?.control?.activityControls || [];

  const renderControlAction = () => {
    if (!inEditMode) {
      return (
        <div>
          {draft && isAdmin ? (
            <>
              <DialogButton
                color="danger"
                className="mr-2"
                onConfirm={() => review({ publish: false })}
                loading={reviewControlM.loading}
              >
                Reject
              </DialogButton>
              <DialogButton
                color="primary"
                className="pwc"
                onConfirm={() => review({ publish: true })}
                loading={reviewControlM.loading}
              >
                Approve
              </DialogButton>
            </>
          ) : (
            <Tooltip description="Edit Control">
              <Button className="soft red" onClick={() => setInEditMode(true)}>
                <AiFillEdit />
              </Button>
            </Tooltip>
          )}
        </div>
      );
    }
    return (
      <div>
        <Button onClick={() => setInEditMode(false)}>
          <FaTimes />
        </Button>
      </div>
    );
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

  if (loading) return null;

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
