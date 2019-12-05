import React from "react";
import { RouteComponentProps } from "react-router";
import { toast } from "react-toastify";
import { useCreateControlMutation } from "../../generated/graphql";
import HeaderWithBackButton from "../../shared/components/HeaderWithBack";
import ControlForm, { CreateControlFormValues } from "./components/ControlForm";

const CreateControl = ({ history }: RouteComponentProps) => {
  const [create] = useCreateControlMutation({
    onCompleted: () => {
      toast.success("Create Success");
      history.push("/control");
    },
    onError: () => toast.error("Create Failed"),
    refetchQueries: ["controls"],
    awaitRefetchQueries: true
  });
  const submit = (values: CreateControlFormValues) => {
    create({
      variables: {
        input: {
          controlOwner: values.controlOwner,
          typeOfControl: values.typeOfControl,
          assertion: values.assertion,
          frequency: values.frequency,
          ipo: values.ipo,
          nature: values.nature,
          description: values.description
        }
      }
    });
  };

  return (
    <div>
      <HeaderWithBackButton heading="Create Control" />
      <ControlForm onSubmit={submit} />
    </div>
  );
};

export default CreateControl;
