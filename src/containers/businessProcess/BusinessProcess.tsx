import get from "lodash/get";
import React, { useEffect, useState } from "react";
import Helmet from "react-helmet";
import { Route, RouteComponentProps } from "react-router";
import { toast } from "react-toastify";
import { oc } from "ts-optchain";
import PickIcon from "../../assets/Icons/PickIcon";
import {
  BusinessProcessDocument,
  useBusinessProcessQuery,
  useDestroyBusinessProcessMutation,
  useUpdateBusinessProcessMutation,
} from "../../generated/graphql";
import BreadCrumb, { CrumbItem } from "../../shared/components/BreadCrumb";
import Button from "../../shared/components/Button";
import DialogButton from "../../shared/components/DialogButton";
import HeaderWithBackButton from "../../shared/components/Header";
import Table from "../../shared/components/Table";
import useAccessRights from "../../shared/hooks/useAccessRights";
import BusinessProcessForm, {
  BusinessProcessFormValues,
} from "./components/BusinessProcessForm";
import CreateSubBusinessProcess from "./CreateSubBusinessProcess";

export default function BusinessProcess({
  match,
  history,
  location,
}: RouteComponentProps) {
  const [isAdmin, isAdminReviewer, isAdminPreparer] = useAccessRights([
    "admin",
    "admin_reviewer",
    "admin_preparer",
  ]);

  const [inEditMode, setInEditMode] = useState(false);
  useEffect(() => {
    setInEditMode((p) => (p ? false : p));
  }, [location.pathname]);

  const id = get(match, "params.id", "");
  const { data, loading } = useBusinessProcessQuery({ variables: { id } });
  const childs = oc(data).businessProcess.children([]);
  const parentId = oc(data).businessProcess.parentId("");
  const ancestors = data?.businessProcess?.ancestors || [];

  const breadcrumb = ancestors.map((a: any) => [
    "/business-process/" + a.id,
    a.name,
  ]) as CrumbItem[];
  const [destroy, destroyM] = useDestroyBusinessProcessMutation({
    onCompleted: () => {
      toast.success("Delete Success");
    },
    onError: () => toast.error("Delete Failed"),
    refetchQueries: ["businessProcess"],
    awaitRefetchQueries: true,
  });
  const [destroyMain, destroyMainM] = useDestroyBusinessProcessMutation({
    onCompleted: () => {
      toast.success("Delete Success");
      history.goBack();
    },
    onError: () => toast.error("Delete Failed"),
    refetchQueries: [
      { query: BusinessProcessDocument, variables: { id: parentId } },
    ],
    awaitRefetchQueries: true,
  });
  const [update] = useUpdateBusinessProcessMutation({
    onCompleted: () => {
      toast.success("Update Success");
      toggleEdit();
    },
    onError: () => toast.error("Update Failed"),
    refetchQueries: ["businessProcess"],
    awaitRefetchQueries: true,
  });

  const toggleEdit = () => {
    setInEditMode(!inEditMode);
  };

  const handleDelete = (id: string) => {
    destroy({ variables: { input: { id } } });
  };

  const handleDeleteMain = async (id: string) => {
    try {
      await destroyMain({ variables: { input: { id } } });
    } catch (error) {}
  };

  const handleUpdate = (values: BusinessProcessFormValues) => {
    update({ variables: { input: { id, name: values.name } } });
  };

  const name = oc(data).businessProcess.name("");
  const ancest = oc(data).businessProcess.ancestry("");
  const isLimitMax = ancest.includes("/");

  return (
    <div>
      <Helmet>
        <title>{name} - Business Process - PricewaterhouseCoopers</title>
      </Helmet>
      <BreadCrumb
        crumbs={[
          ["/business-process", "Business processes"],
          ...breadcrumb,
          ["/business-process/" + id, name],
        ]}
      />
      <HeaderWithBackButton heading="" />
      {inEditMode ? (
        <div className="mt-3">
          <BusinessProcessForm
            onSubmit={handleUpdate}
            onCancel={toggleEdit}
            defaultValues={{ name }}
            submitButtonName="Save"
          />
        </div>
      ) : (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <h4 style={{overflow: "hidden", overflowWrap: "break-word"}}>{name}</h4>
          <div>
            {isAdmin || isAdminPreparer ? (
              <Button
                onClick={toggleEdit}
                className="soft orange mr-3"
                color=""
              >
                <PickIcon name="pencilFill" />
              </Button>
            ) : null}
            {isAdminReviewer ? (
              <DialogButton
                onConfirm={() => handleDeleteMain(id)}
                loading={destroyMainM.loading}
                message={`Delete Business Process "${name}"?`}
                className="soft red"
              >
                <PickIcon name="trash" />
              </DialogButton>
            ) : null}
          </div>
        </div>
      )}
      {inEditMode ? <h6 className="mt-2">Business ID: {id}</h6> : <h6>Business ID: {id}</h6>}
      {isAdmin || isAdminPreparer ? (
        <div className="mt-5">
          {isLimitMax ? null : <Route component={CreateSubBusinessProcess} />}
        </div>
      ) : null}

      <Table reloading={loading} className="mt-5">
        <thead>
          <tr>
            <th>Business process</th>
            <th>Business process Id</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {childs.length ? (
            childs.map((child) => {
              return (
                <tr
                  key={child.id}
                  onClick={() => history.push(`/business-process/${child.id}`)}
                >
                  <td>{child.name}</td>
                  <td>{child.id}</td>
                  {isAdmin || isAdminReviewer ? (
                    <td className="action">
                      <DialogButton
                        onConfirm={() => handleDelete(child.id)}
                        loading={destroyM.loading}
                        message={`Delete Business Process "${child.name}"?`}
                        className="soft orange"
                        color=""
                      >
                        <PickIcon name="trash" />
                      </DialogButton>
                    </td>
                  ) : (
                    <td></td>
                  )}
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={3}>
                <div className="text-center">No Sub-Business Process</div>
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}
