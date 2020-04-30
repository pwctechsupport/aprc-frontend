import React, { useState, Fragment } from "react";
import Helmet from "react-helmet";
import { Container, Col, Row, Form } from "reactstrap";
import Input from "../../shared/components/forms/Input";
import Button from "../../shared/components/Button";
import {
  useDepartmentsQuery,
  useDestroyDepartmentMutation,
  useUpdateDepartmentMutation,
  useCreateDepartmentMutation,
} from "../../generated/graphql";
import { NetworkStatus } from "apollo-boost";
import Table from "../../shared/components/Table";
import DateHover from "../../shared/components/DateHover";
import { RouteComponentProps } from "react-router-dom";
import { useDebounce } from "use-debounce/lib";
import { notifyGraphQLErrors, notifySuccess } from "../../shared/utils/notif";
import { useForm } from "react-hook-form";
import Tooltip from "../../shared/components/Tooltip";
import { AiFillEdit } from "react-icons/ai";
import { FaTrash, FaTimes } from "react-icons/fa";
import DialogButton from "../../shared/components/DialogButton";
import * as yup from "yup";
import useAccessRights from "../../shared/hooks/useAccessRights";

const Departments = ({ history }: RouteComponentProps) => {
  const [isEdit, setIsEdit] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 400);
  const [selected, setSelected] = useState("");
  const { data, networkStatus } = useDepartmentsQuery({
    variables: {
      filter: {
        name_cont: debouncedSearch,
      },
    },
    fetchPolicy: "no-cache",
  });
  const updating = useForm({ validationSchema });
  const creating = useForm({ validationSchema });
  const departments = data?.departments?.collection;
  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
  }
  const [destroy, destroyM] = useDestroyDepartmentMutation({
    refetchQueries: ["departments"],
    onError: notifyGraphQLErrors,
  });
  const handleDelete = (id: string) => {
    destroy({ variables: { id } });
  };
  const [update, updateM] = useUpdateDepartmentMutation({
    refetchQueries: ["departments"],
    onCompleted,
    onError: notifyGraphQLErrors,
  });
  const [create, createM] = useCreateDepartmentMutation({
    refetchQueries: ["departments"],
    onError: notifyGraphQLErrors,
    onCompleted,
  });
  const toggleEdit = (id: string) => {
    setIsEdit((p) => !p);
    setSelected(id);
  };
  const handleUpdate = (values: any) => {
    update({ variables: { input: { name: values.name || "", id: selected } } });
  };
  function onCompleted() {
    notifySuccess("Department Updated");
    setIsEdit(false);
  }
  const handleCreate = (values: any) => {
    create({ variables: { input: { name: values.name } } });
    creating.reset();
  };
  const [isAdmin, isAdminReviewer, isAdminPreparer] = useAccessRights([
    "admin",
    "admin_reviewer",
    "admin_preparer"
  ]);
  return (
    <div>
      <Helmet>
        <title>Department - PricewaterhouseCoopers</title>
      </Helmet>
      <Container fluid className="p-0 pt-3 px-4">
        <h2>Department</h2>
        
        {(isAdmin|| isAdminPreparer  )&& 
          <Fragment>
          <Row style={{ position: "relative", left: "15px" }}>
            <h5> Add Department</h5>
          </Row>
          <Row>
          <Col>
            <Form
              onSubmit={creating.handleSubmit(handleCreate)}
              className="form"
            >
              <Row className="mt-2">
                <Col lg={9}>
                  <Input
                    className="p-0 m-0"
                    placeholder={"Add new Department..."}
                    name="name"
                    innerRef={creating.register}
                    setValue={creating.setValue}
                    error={creating.errors.name && "Name is a required field"}
                    type="text"
                  />
                </Col>
                <Col lg={1}>
                  <Button loading={createM.loading} className="pwc px-5">
                    Add
                  </Button>
                </Col>
                <Col lg={2} className="text-right">
                  <Button
                    outline
                    color="pwc"
                    className="pwc mb-5"
                    onClick={() => {
                      history.replace(`/user`);
                    }}
                  >
                    <Tooltip description="Back to users page">Users</Tooltip>
                  </Button>
                </Col>
              </Row>
            </Form>
          </Col>
          </Row>
        </Fragment>}
        
        <Row style={{ position: "relative", marginTop: `${isAdminReviewer? '40px': '0px'}`, bottom: "20px" }}>
          <Col lg={9}>
            <h5> Search Department</h5>
            <Input placeholder="Search Department..." onChange={handleSearch} />
          </Col>
        </Row>

        <Table
          loading={networkStatus === NetworkStatus.loading}
          reloading={networkStatus === NetworkStatus.setVariables}
        >
          <thead>
            <tr>
              <th style={{ width: "20%" }}>Department ID</th>
              <th style={{ width: "20%" }}>Name</th>
              <th>Created At</th>
              <th>Last Updated</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {departments?.map((department, index) => (
              <tr key={index}>
                <td>{department.id}</td>
                <td>
                  {isEdit && selected === department.id ? (
                    <Input
                      className="p-0 m-0"
                      name="name"
                      defaultValue={department.name || ""}
                      innerRef={updating.register}
                      setValue={updating.setValue}
                      error={updating.errors.name && "Name is a required field"}
                    />
                  ) : (
                    department.name
                  )}
                </td>
                <td>
                  <DateHover>{department.createdAt}</DateHover>
                </td>
                <td>
                  <DateHover>{department.updatedAt}</DateHover>
                </td>
                <td>
                  {isEdit && selected === department.id ? (
                    <Fragment>
                      <Button
                        className="soft orange mr-2"
                        onClick={() => toggleEdit(department.id)}
                      >
                        <Tooltip description="Cancel Edit">
                          <FaTimes />
                        </Tooltip>
                      </Button>
                      <Button
                        onClick={updating.handleSubmit(handleUpdate)}
                        className="pwc"
                        loading={updateM.loading}
                      >
                        Save
                      </Button>
                    </Fragment>
                  ) : (
                    <Fragment>
                      <Fragment>
                        <DialogButton
                          title="Delete"
                          data={department.id}
                          loading={destroyM.loading}
                          className="soft red mr-2 "
                          onConfirm={handleDelete}
                        >
                          <Tooltip description="Delete User">
                            <FaTrash />
                          </Tooltip>
                        </DialogButton>
                        {(isAdmin||isAdminPreparer)&&
                         <Button
                          onClick={() => toggleEdit(department.id)}
                          className="soft orange mr-2"
                        > 
                          <Tooltip description="Edit User">
                            <AiFillEdit />
                          </Tooltip>
                        </Button>
                        }

                       
                      </Fragment>
                    </Fragment>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>
    </div>
  );
};
export default Departments;
const validationSchema = yup
  .object()
  .shape({ name: yup.string().required("This field is required") });
