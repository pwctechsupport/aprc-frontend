import React from "react";
import ControlForm, { CreateControlFormValues } from "./components/ControlForm";
import {
  useControlQuery,
  useUpdateControlMutation,
  TypeOfControl,
  Nature,
  Frequency,
  Status
} from "../../generated/graphql";
import { RouteComponentProps } from "react-router";
import get from "lodash/get";
import { toast } from "react-toastify";
import { oc } from "ts-optchain";
import HeaderWithBackButton from "../../shared/components/HeaderWithBack";
import BreadCrumb from "../../shared/components/BreadCrumb";

const Control = ({ match }: RouteComponentProps) => {
  const id = get(match, "params.id", "");
  const { loading, data } = useControlQuery({ variables: { id } });
  const [update, updateState] = useUpdateControlMutation({
    onCompleted: () => {
      toast.success("Update Success");
    },
    onError: () => toast.error("Update Failed"),
    refetchQueries: ["control"],
    awaitRefetchQueries: true
  });

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

  const controlOwner = oc(data).control.controlOwner("");
  const description = oc(data).control.description("");
  const assertion = oc(data).control.assertion([]);
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
      <HeaderWithBackButton heading={id} />
      <ControlForm
        onSubmit={handleUpdate}
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
