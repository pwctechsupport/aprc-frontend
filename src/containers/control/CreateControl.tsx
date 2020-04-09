import React from "react";
import { RouteComponentProps } from "react-router";
import { toast } from "react-toastify";
import { oc } from "ts-optchain";
import { useCreateControlMutation } from "../../generated/graphql";
import HeaderWithBackButton from "../../shared/components/Header";
import ControlForm, { CreateControlFormValues } from "./components/ControlForm";
import BreadCrumb from "../../shared/components/BreadCrumb";

const CreateControl = ({ history }: RouteComponentProps) => {
  const [create, { loading }] = useCreateControlMutation({
    onCompleted: (res) => {
      toast.success("Create Success");
      history.push("/control");
      const id = oc(res).createControl.control.id("");
      history.replace(`/control/${id}`);
    },
    onError: () => toast.error("Create Failed"),
    refetchQueries: ["controls"],
    awaitRefetchQueries: true,
  });
  const submit = (values: CreateControlFormValues) => {
    create({
      variables: {
        input: {
          ...values,
          controlOwner: values.controlOwner || [],
          description: values.description || "",
          typeOfControl: values.typeOfControl || "",
          activityControlsAttributes: values.activityControlsAttributes || [],
          frequency: values.frequency || "",
          nature: values.nature || "",
          assertion: values.assertion || [],
          ipo: values.ipo || [],
        },
      },
    });
  };

  return (
    <div>
      <BreadCrumb
        crumbs={[
          ["/control", "Controls"],
          ["/control/create", "Create Control"],
        ]}
      />
      <HeaderWithBackButton heading="Create Control" />
      <ControlForm onSubmit={submit} submitting={loading} />
    </div>
  );
};

export default CreateControl;
