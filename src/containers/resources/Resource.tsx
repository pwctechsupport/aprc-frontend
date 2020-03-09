import { capitalCase } from "capital-case";
import React, { useState } from "react";
import Helmet from "react-helmet";
import { AiFillEdit } from "react-icons/ai";
import { FaTimes, FaTrash } from "react-icons/fa";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { oc } from "ts-optchain";
import {
  // Category,
  UpdateResourceInput,
  useDestroyResourceMutation,
  useResourceQuery,
  useUpdateResourceMutation
} from "../../generated/graphql";
import BreadCrumb from "../../shared/components/BreadCrumb";
import Button from "../../shared/components/Button";
import DialogButton from "../../shared/components/DialogButton";
import HeaderWithBackButton from "../../shared/components/HeaderWithBack";
import LoadingSpinner from "../../shared/components/LoadingSpinner";
import { notifyGraphQLErrors, notifySuccess } from "../../shared/utils/notif";
import ResourceBox from "./components/ResourceBox";
import ResourceForm, {
  // ResourceFormValues,
  ResourceFormValues
} from "./components/ResourceForm";
import { toLabelValue } from "../../shared/formatter";
import EmptyAttribute from "../../shared/components/EmptyAttribute";

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
    awaitRefetchQueries: true
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

  async function handleSubmit(data: ResourceFormValues) {
    const input: UpdateResourceInput = {
      id: id,
      category: data.category?.value,
      name: data.name,
      policyIds: data.policyIds?.map(a => a.value),
      controlIds: data.controlIds?.map(a => a.value),
      businessProcessId: data.businessProcessId?.value,
      ...(data.resuploadBase64 && {
        resuploadBase64: data.resuploadBase64,
        resuploadFileName: data.resuploadFileName
      })
    };
    try {
      await updateResource({ variables: { input } });
      toggleEditMode();
      notifySuccess("Resource Updated");
    } catch (error) {
      notifyGraphQLErrors(error);
    }
  }
  const defaultValues: ResourceFormValues = {
    name,
    category: {
      label: data?.resource?.category || "",
      value: data?.resource?.category || ""
    },
    businessProcessId: toLabelValue(data?.resource?.businessProcess || {}),
    controlIds:
      data?.resource?.controls
        ?.map(({ id, description }) => ({ id, name: description }))
        .map(toLabelValue) || [],
    policyIds: data?.resource?.policies?.map(toLabelValue) || [],
    resuploadUrl: oc(data).resource.resuploadUrl("")
  };

  async function handleErase() {
    const input = {
      id: id,
      resuploadBase64: "",
      resuploadFileName: ""
    };
    try {
      await updateResource({ variables: { input } });
      notifySuccess("File Removed");
    } catch (error) {
      notifyGraphQLErrors(error);
    }
  }

  if (loading) {
    return <LoadingSpinner centered size={30} />;
  }

  const policies = data?.resource?.policies || [];
  const controls = data?.resource?.controls || [];

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
          handleErase={handleErase}
        />
        <div className="ml-3">
          <h5>
            Category:&nbsp;
            <span className="text-orange">{data?.resource?.category}</span>
          </h5>

          {data?.resource?.category === "Flowchart" ? (
            <>
              <h5 className="mt-5">Business Process:</h5>
              {data.resource.businessProcess?.name}
            </>
          ) : (
            <>
              <div>
                <h5 className="mt-5">Related Controls:</h5>
                {controls.length ? (
                  <ul>
                    {controls.map(control => (
                      <li key={control.id}>
                        <Link to={`/control/${control.id}`}>
                          {control.description}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyAttribute centered={false} />
                )}
              </div>
              <div>
                <h5 className="mt-5">Related Policies:</h5>
                {policies.length ? (
                  <ul>
                    {policies.map(policy => (
                      <li key={policy.id}>
                        <Link to={`/policy/${policy.id}`}>{policy.title}</Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyAttribute centered={false} />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderResourceAction = () => {
    if (inEditMode) {
      return (
        <Button onClick={toggleEditMode} className="soft orange" color="">
          <FaTimes className="mr-2" />
          Cancel Edit
        </Button>
      );
    }
    return (
      <div>
        <Button onClick={toggleEditMode} className="soft orange mr-2" color="">
          <AiFillEdit />
        </Button>
        <DialogButton
          onConfirm={handleDeleteMain}
          color=""
          message={`Delete resource "${name}"?`}
          className="soft red"
        >
          <FaTrash className="text-red" />
        </DialogButton>
      </div>
    );
  };

  return (
    <div>
      <Helmet>
        <title>{name} - Resource - PricewaterhouseCoopers</title>
      </Helmet>
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
