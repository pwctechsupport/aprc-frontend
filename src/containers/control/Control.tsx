import get from "lodash/get";
import React from "react";
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
import DialogButton from "../../shared/components/DialogButton";
import HeaderWithBackButton from "../../shared/components/HeaderWithBack";
import useAccessRights from "../../shared/hooks/useAccessRights";
import { notifyGraphQLErrors, notifySuccess } from "../../shared/utils/notif";
import ControlForm, { CreateControlFormValues } from "./components/ControlForm";

const Control = ({ match }: RouteComponentProps) => {
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
  const renderControlAction = () => {
    if (draft && isAdmin) {
      return (
        <div>
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
        </div>
      );
    }
    if (draft && !isAdmin) return null;
  };
  const handleUpdate = (values: CreateControlFormValues) => {
    update({
      variables: {
        input: {
          id,
          ...values
        }
      }
    });
  };
  const controlOwner = data?.control?.controlOwner || "";
  let description = data?.control?.description || "";
  description = draft ? `[Draft] ${description}` : description;
  const assertion = data?.control?.assertion || [];
  const frequency = oc(data).control.frequency("");
  const ipo = oc(data).control.ipo([]);
  const nature = oc(data).control.nature("");
  const typeOfControl = oc(data).control.typeOfControl("");
  const status = oc(data).control.status("");
  const riskIds = oc(data)
    .control.risks([])
    .map(risk => risk.id);
  const businessProcessIds = oc(data)
    .control.businessProcesses([])
    .map(bp => bp.id);
  const keyControl = oc(data).control.keyControl(false);

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
          keyControl
        }}
        submitting={updateState.loading}
      />
    </div>
  );
};

export default Control;
