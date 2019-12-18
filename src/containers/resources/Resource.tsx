import React, { useState } from "react";
import { RouteComponentProps } from "react-router";
import { toast } from "react-toastify";
import {
  UpdateResourceInput,
  useUpdateResourceMutation,
  useResourceQuery,
  Category,
  useDestroyResourceMutation
} from "../../generated/graphql";
import ResourceForm, { ResourceFormValues } from "./components/ResourceForm";
import LoadingSpinner from "../../shared/components/LoadingSpinner";
import { oc } from "ts-optchain";
import HeaderWithBackButton from "../../shared/components/HeaderWithBack";
import { Button } from "reactstrap";
import { FaTimes, FaTrash } from "react-icons/fa";
import { MdModeEdit } from "react-icons/md";
import { Link } from "react-router-dom";
import ResourceBox from "./components/ResourceBox";

const Resource = ({ match }: RouteComponentProps) => {
  const [inEditMode, setInEditMode] = useState(false);
  const toggleEditMode = () => setInEditMode(prev => !prev);
  const id = match.params && (match.params as any).id;
  const { data, loading } = useResourceQuery({
    variables: { id },
    fetchPolicy: "network-only"
  });

  const [updateResource, updateResourceM] = useUpdateResourceMutation({
    refetchQueries: ["resources", "resource"],
    onCompleted: _ => toast.success("Updated"),
    onError: _ => toast.error("Update Failed")
  });

  const [deleteResource, deleteResourceM] = useDestroyResourceMutation({
    refetchQueries: ["resources", "resource"],
    onCompleted: _ => toast.success("Delete Success"),
    onError: _ => toast.error("Delete Failed")
  });

  const handleDeleteMain = () => {
    deleteResource({
      variables: { id }
    });
  };

  const name = oc(data).resource.name("");
  const defaultValues: ResourceFormValues = {
    name,
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

  const renderResourceInEditMode = () => {
    return (
      <ResourceForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        submitting={updateResourceM.loading}
      />
    );
  };

  const renderResource = () => {
    return (
      <div className="d-flex">
        <ResourceBox
          name={name}
          rating={oc(data).resource.rating(0)}
          views={oc(data).resource.visit(0)}
          resuploadUrl={oc(data).resource.resuploadUrl("")}
        />
        <div className="ml-3">
          <h5>
            Category:&nbsp;
            <span className="text-orange">
              {oc(data).resource.category("")}
            </span>
          </h5>
          <h5 className="mt-5">Related Controls:</h5>
          <div>
            <ul>
              {oc(data)
                .resource.controls([])
                .map(control => (
                  <li key={control.id}>
                    <Link to={`/control/${control.id}`}>
                      {control.description}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
          <h5 className="mt-5">Related Policies:</h5>
          <div>
            <ul>
              {oc(data)
                .resource.policies([])
                .map(policy => (
                  <li key={policy.id}>
                    <Link to={`/policy/${policy.id}`}>{policy.title}</Link>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const renderResourceAction = () => {
    if (inEditMode) {
      return (
        <Button onClick={toggleEditMode} color="">
          <FaTimes size={22} className="mr-2" />
          Cancel Edit
        </Button>
      );
    }
    return (
      <div>
        <MdModeEdit
          size={22}
          className="mx-3 clickable"
          onClick={toggleEditMode}
        />
        <FaTrash
          onClick={handleDeleteMain}
          className="clickable text-red mr-3"
        />
      </div>
    );
  };

  return (
    <div>
      <div className="d-flex justify-content-between">
        <HeaderWithBackButton heading={name} />
        {renderResourceAction()}
      </div>
      {inEditMode ? renderResourceInEditMode() : renderResource()}
    </div>
  );
};

export default Resource;
