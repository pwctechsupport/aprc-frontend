import { capitalCase } from "capital-case";
import React, { useState } from "react";
import { FaTimes, FaTrash } from "react-icons/fa";
import { MdModeEdit } from "react-icons/md";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Button } from "reactstrap";
import { oc } from "ts-optchain";
import {
  Category,
  UpdateResourceInput,
  useDestroyResourceMutation,
  useResourceQuery,
  useUpdateResourceMutation
} from "../../generated/graphql";
import DialogButton from "../../shared/components/DialogButton";
import HeaderWithBackButton from "../../shared/components/HeaderWithBack";
import LoadingSpinner from "../../shared/components/LoadingSpinner";
import ResourceBox from "./components/ResourceBox";
import ResourceForm, {
  ResourceFormValues,
  ResourceFormDefaultValues
} from "./components/ResourceForm";
import BreadCrumb from "../../shared/components/BreadCrumb";
import { notifyGraphQLErrors } from "../../shared/utils/notif";

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
    onCompleted: _ => {
      toast.success("Resource Updated");
      toggleEditMode();
    },
    onError: notifyGraphQLErrors
  });

  const [deleteResource] = useDestroyResourceMutation({
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
  const defaultValues: ResourceFormDefaultValues = {
    name,
    category: oc(data).resource.category(Category.References) as Category,
    businessProcessId: oc(data).resource.businessProcess.id(""),
    controlId: oc(data)
      .resource.controls([])
      .map(p => p.id)
      .pop() as string,
    policyIds: oc(data)
      .resource.policies([])
      .map(p => p.id),
    resuploadUrl: oc(data).resource.resuploadUrl("")
  };

  function handleSubmit(data: ResourceFormValues) {
    const input: UpdateResourceInput = {
      id: id,
      category: data.category,
      name: data.name,
      policyIds: data.policyIds,
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
          id={id}
          name={name}
          rating={oc(data).resource.rating(0)}
          totalRating={oc(data).resource.totalRating(0)}
          views={oc(data).resource.visit(0)}
          resuploadUrl={oc(data).resource.resuploadUrl("")}
        />
        <div className="ml-3">
          <h5>
            Category:&nbsp;
            <span className="text-orange">
              {capitalCase(oc(data).resource.category(""))}
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
        <Button onClick={toggleEditMode} color="">
          <MdModeEdit size={22} />
        </Button>
        <DialogButton
          onConfirm={handleDeleteMain}
          color=""
          message={`Delete resource "${name}"?`}
        >
          <FaTrash className="text-red" />
        </DialogButton>
      </div>
    );
  };

  return (
    <div>
      <BreadCrumb
        crumbs={[
          ["/resources", "Resources"],
          ["/resources/" + id, name]
        ]}
      />
      <div className="d-flex justify-content-between">
        <HeaderWithBackButton heading={name} />
        {renderResourceAction()}
      </div>
      {inEditMode ? renderResourceInEditMode() : renderResource()}
    </div>
  );
};

export default Resource;
