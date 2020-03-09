import React from "react";

import ResourceForm, { ResourceFormValues } from "./components/ResourceForm";
import {
  useCreateResourceMutation,
  CreateResourceInput
} from "../../generated/graphql";
import { RouteComponentProps } from "react-router";
import HeaderWithBackButton from "../../shared/components/HeaderWithBack";
import BreadCrumb from "../../shared/components/BreadCrumb";
import { toast } from "react-toastify";
import { notifyGraphQLErrors } from "../../shared/utils/notif";

const CreateResource = ({ history }: RouteComponentProps) => {
  const [createResource, createResourceM] = useCreateResourceMutation({
    refetchQueries: ["resources"],
    onCompleted: _ => {
      toast.success("Resource Created");
      history.push("/resources");
    },
    onError: notifyGraphQLErrors
  });

  function handleSubmit(data: ResourceFormValues) {
    const input: CreateResourceInput = {
      category: data.category?.value || "",
      name: data.name || "",
      resuploadBase64: data.resuploadBase64,
      resuploadFileName: data.resuploadFileName,
      policyIds: data.policyIds?.map(a => a.value),
      controlIds: data.controlIds?.map(a => a.value),
      businessProcessId: data.businessProcessId?.value
    };

    createResource({ variables: { input } });
  }

  return (
    <div>
      <BreadCrumb
        crumbs={[
          ["/resources", "Resources"],
          ["/resources/create", "Create Resource"]
        ]}
      />
      <HeaderWithBackButton heading="Create Resource" />
      <ResourceForm
        onSubmit={handleSubmit}
        submitting={createResourceM.loading}
      />
    </div>
  );
};

export default CreateResource;
