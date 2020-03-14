import get from "lodash/get";
import React, { useState } from "react";
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import { Route, RouteComponentProps } from "react-router";
import { toast } from "react-toastify";
import { oc } from "ts-optchain";
import {
  BusinessProcessDocument,
  useBusinessProcessQuery,
  useDestroyBusinessProcessMutation,
  useUpdateBusinessProcessMutation
} from "../../generated/graphql";
import Button from "../../shared/components/Button";
import DialogButton from "../../shared/components/DialogButton";
import HeaderWithBackButton from "../../shared/components/Header";
import Table from "../../shared/components/Table";
import BusinessProcessForm, {
  BusinessProcessFormValues
} from "./components/BusinessProcessForm";
import CreateSubBusinessProcess from "./CreateSubBusinessProcess";
import BreadCrumb, { CrumbItem } from "../../shared/components/BreadCrumb";
import Helmet from "react-helmet";

const BusinessProcess = ({ match, history }: RouteComponentProps) => {
  const id = get(match, "params.id", "");
  const [editMode, setEditMode] = useState(false);
  const { data, loading } = useBusinessProcessQuery({ variables: { id } });
  const childs = oc(data).businessProcess.children([]);
  const parentId = oc(data).businessProcess.parentId("");
  const ancestors = data?.businessProcess?.ancestors || [];

  const breadcrumb = ancestors.map((a: any) => [
    "/business-process/" + a.id,
    a.name
  ]) as CrumbItem[];
  const [destroy, destroyM] = useDestroyBusinessProcessMutation({
    onCompleted: () => {
      toast.success("Delete Success");
    },
    onError: () => toast.error("Delete Failed"),
    refetchQueries: ["businessProcess"],
    awaitRefetchQueries: true
  });
  const [destroyMain, destroyMainM] = useDestroyBusinessProcessMutation({
    onCompleted: () => {
      toast.success("Delete Success");
      history.goBack();
    },
    onError: () => toast.error("Delete Failed"),
    refetchQueries: [
      { query: BusinessProcessDocument, variables: { id: parentId } }
    ],
    awaitRefetchQueries: true
  });
  const [update] = useUpdateBusinessProcessMutation({
    onCompleted: () => {
      toast.success("Update Success");
      toggleEdit();
    },
    onError: () => toast.error("Update Failed"),
    refetchQueries: ["businessProcess"],
    awaitRefetchQueries: true
  });

  const toggleEdit = () => {
    setEditMode(!editMode);
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
          ["/business-process", "Business Processes"],
          ...breadcrumb,
          ["/business-process/" + id, name]
        ]}
      />
      <HeaderWithBackButton heading="" />
      {editMode ? (
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
          <h4>{name}</h4>
          <div>
            <Button onClick={toggleEdit} className="soft orange mr-3" color="">
              <FaPencilAlt />
            </Button>
            <DialogButton
              onConfirm={() => handleDeleteMain(id)}
              loading={destroyMainM.loading}
              message={`Delete Business Process "${name}"?`}
              className="soft red"
            >
              <FaTrash />
            </DialogButton>
          </div>
        </div>
      )}
      <h6>ID: {id}</h6>
      <div className="mt-5">
        {isLimitMax ? null : <Route component={CreateSubBusinessProcess} />}
      </div>
      <Table reloading={loading}>
        <thead>
          <tr>
            <th>Business Process</th>
            <th>Business Process ID</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {childs.length ? (
            childs.map(child => {
              return (
                <tr
                  key={child.id}
                  onClick={() => history.push(`/business-process/${child.id}`)}
                >
                  <td>{child.name}</td>
                  <td>{child.id}</td>
                  <td className="action">
                    <DialogButton
                      onConfirm={() => handleDelete(child.id)}
                      loading={destroyM.loading}
                      message={`Delete Business Process "${child.name}"?`}
                      className="soft orange"
                      color=""
                    >
                      <FaTrash />
                    </DialogButton>
                  </td>
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
};

export default BusinessProcess;

// import React from "react";
// import {
//   useCreateSubBusinessProcessMutation,
//   BusinessProcessesDocument
// } from "../../generated/graphql";
// import { toast } from "react-toastify";
// import { Form, Input } from "reactstrap";
// import Button from "../../shared/components/Button";
// import useForm from "react-hook-form";

// const CreateSubBusinessProcess = () => {
//   const { register, handleSubmit, reset } = useForm<CreateSBPFormValues>();
//   const [createSBP] = useCreateSubBusinessProcessMutation({
//     onCompleted: () => {
//       toast.success("Create Success");
//       reset();
//     },
//     onError: () => toast.error("Create Failed"),
//     refetchQueries: [
//       { query: BusinessProcessesDocument, variables: { filter: {} } }
//     ]
//   });
//   const submit = (values: CreateSBPFormValues) => {
//     createSBP({ variables: { input: { parentId: values.parentId,  }});
//   };
//   return (
//     <Form
//       onSubmit={handleSubmit(submit)}
//       className="d-flex align-items-center mb-4"
//     >
//       <Input
//         name="name"
//         placeholder="Sub Business Process Name"
//         innerRef={register}
//         required
//       />
//       <Button type="submit" className="pwc ml-3">
//         Add
//       </Button>
//     </Form>
//   );
// };

// export default CreateSubBusinessProcess;

// interface CreateSBPFormValues {
//   name: string;
//   parentId: string;
// }
