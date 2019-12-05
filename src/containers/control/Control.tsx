import React from "react";
import ControlForm, { CreateControlFormValues } from "./components/ControlForm";
import {
  useControlQuery,
  useUpdateControlMutation,
  Assertion,
  TypeOfControl,
  Nature,
  Ipo,
  Frequency
} from "../../generated/graphql";
import { RouteComponentProps } from "react-router";
import get from "lodash/get";
import { toast } from "react-toastify";
import { oc } from "ts-optchain";

const Control = ({ match }: RouteComponentProps) => {
  const id = get(match, "params.id", "");
  const { loading, data } = useControlQuery({ variables: { id } });
  const [update] = useUpdateControlMutation({
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
          controlOwner: values.controlOwner,
          typeOfControl: values.typeOfControl,
          assertion: values.assertion,
          frequency: values.frequency,
          ipo: values.ipo,
          nature: values.nature
        }
      }
    });
  };

  const assertion = oc(data).control.assertion("");
  const controlOwner = oc(data).control.controlOwner("");
  const frequency = oc(data).control.frequency("");
  const ipo = oc(data).control.ipo("");
  const nature = oc(data).control.nature("");
  const typeOfControl = oc(data).control.typeOfControl("");

  if (loading) return null;

  const assertionValue = Object.entries(Assertion).find(
    ([l, v]) => v === assertion
  );

  return (
    <div>
      <ControlForm
        onSubmit={handleUpdate}
        // defaultValues={{
        //   assertion: assertionValue ? assertionValue[0] : '',
        //   controlOwner,
        //   frequency: Frequency.Annually,
        //   ipo: Ipo.Accuracy,
        //   nature: Nature.Corrective,
        //   typeOfControl: TypeOfControl.Automatic
        // }}
      />
    </div>
  );
};

export default Control;

type MyEnum = Assertion | Frequency | Ipo | Nature | TypeOfControl;
