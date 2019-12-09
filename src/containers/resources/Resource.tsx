import React from "react";
import { RouteComponentProps } from "react-router";
import { toast } from "react-toastify";
import {
  UpdateResourceInput,
  useUpdateResourceMutation,
  useResourceQuery,
  Category
} from "../../generated/graphql";
import ResourceForm, { ResourceFormValues } from "./components/ResourceForm";
import LoadingSpinner from "../../shared/components/LoadingSpinner";
import { oc } from "ts-optchain";
import HeaderWithBackButton from "../../shared/components/HeaderWithBack";

const Resource = ({ match }: RouteComponentProps) => {
  const id = match.params && (match.params as any).id;
  const { data, loading } = useResourceQuery({
    variables: { id },
    fetchPolicy: "network-only"
  });

  const [updateResource, updateResourceM] = useUpdateResourceMutation({
    refetchQueries: ["resources", "resource"],
    onCompleted: _ => toast.success("Updated")
  });

  const defaultValues: ResourceFormValues = {
    name: oc(data).resource.name(""),
    category: oc(data).resource.category(Category.References) as Category,
    businessProcessId: oc(data).resource.businessProcess.id(""),
    controlId: oc(data)
      .resource.controls([])
      .map(p => p.id)
      .pop() as string,
    policyId: oc(data)
      .resource.policies([])
      .map(p => p.id)
      .pop() as string,
    resuploadUrl: oc(data).resource.resuploadUrl("")
  };

  function handleSubmit(data: ResourceFormValues) {
    const input: UpdateResourceInput = {
      id: id,
      category: data.category,
      name: data.name,
      policyIds: data.policyId ? [data.policyId] : undefined,
      controlIds: data.controlId ? [data.controlId] : undefined,
      businessProcessId: data.businessProcessId,
      resuploadBase64: data.resuploadBase64,
      resuploadFileName: data.resuploadFileName
    };

    updateResource({ variables: { input } });
  }

  if (loading) {
    return <LoadingSpinner centered size={30} />;
  }

  return (
    <div>
      <HeaderWithBackButton heading="Resource" />
      <ResourceForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        submitting={updateResourceM.loading}
      />
    </div>
  );
};

export default Resource;
