import React from "react";
import { RouteComponentProps } from "react-router";
import { toast } from "react-toastify";
import { oc } from "ts-optchain";
import { useCreateControlMutation } from "../../generated/graphql";
import HeaderWithBackButton from "../../shared/components/Header";
import ControlForm, { CreateControlFormValues } from "./components/ControlForm";
import BreadCrumb from "../../shared/components/BreadCrumb";
import { notifyGraphQLErrors } from "../../shared/utils/notif";

const CreateControl = ({ history }: RouteComponentProps) => {
  const [create, { loading }] = useCreateControlMutation({
    onCompleted: (res) => {
      toast.success("Create Success");
      history.push("/control");
      const id = oc(res).createControl.control.id("");
      history.replace(`/control/${id}`);
    },
    onError: notifyGraphQLErrors,
    refetchQueries: ["controls", "adminControls"],
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
          ["/control/create", "Create control"],
        ]}
      />
      <HeaderWithBackButton heading="Create control" />
      <ControlForm
        onSubmit={submit}
        submitting={loading}
        history={history}
        isCreate={history.location.pathname === "/control/create"}
      />
    </div>
  );
};

export default CreateControl;
