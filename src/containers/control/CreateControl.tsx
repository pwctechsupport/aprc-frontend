import React from "react";
import { RouteComponentProps } from "react-router";
import { toast } from "react-toastify";
import { useCreateControlMutation } from "../../generated/graphql";
import HeaderWithBackButton from "../../shared/components/HeaderWithBack";
import ControlForm, { CreateControlFormValues } from "./components/ControlForm";
import BreadCrumb from "../../shared/components/BreadCrumb";

const CreateControl = ({ history }: RouteComponentProps) => {
  const [create, { loading }] = useCreateControlMutation({
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
        input: values
      }
    });
  };

  return (
    <div>
      <BreadCrumb
        crumbs={[
          ["/control", "Controls"],
          ["/control/create", "Create Control"]
        ]}
      />
      <HeaderWithBackButton heading="Create Control" />
      <ControlForm onSubmit={submit} submitting={loading} />
    </div>
  );
};

export default CreateControl;
