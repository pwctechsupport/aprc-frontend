import React from "react";
import ResourceForm, { ResourceFormValues } from "./components/ResourceForm";
import {
  useCreateResourceMutation,
  CreateResourceInput
} from "../../generated/graphql";
import { RouteComponentProps } from "react-router";
import HeaderWithBackButton from "../../shared/components/Header";
import BreadCrumb from "../../shared/components/BreadCrumb";
import { notifyGraphQLErrors, notifySuccess } from "../../shared/utils/notif";
import Helmet from "react-helmet";

const CreateResource = ({ history }: RouteComponentProps) => {
  const [createResource, createResourceM] = useCreateResourceMutation({
    refetchQueries: ["resources"],
    onCompleted: ({ createResource }) => {
      notifySuccess("Resource Created");
      history.replace(`/resources/${createResource?.resource?.id}`);
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
      businessProcessId: data.businessProcessId?.value,
      resuploadLink: data.resuploadLink,
      tagsAttributes: data.tagsAttributes?.map(tag => {
        const { id, risk, control, ...rest } = tag;
        return { ...rest, riskId: risk?.id, control: control?.id };
      })
    };

    createResource({ variables: { input } });
  }

  return (
    <div>
      <Helmet>
        <title>Create Resource - PricewaterhouseCoopers</title>
      </Helmet>
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
