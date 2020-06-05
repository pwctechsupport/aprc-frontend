import React, { useState } from "react";
import Helmet from "react-helmet";
import { Col, Container, Row } from "reactstrap";
import Button from "../../shared/components/Button";
import Input from "../../shared/components/forms/Input";
import Table from "../../shared/components/Table";
import UserRow from "./components/UserRow";
import { NavLink } from "react-router-dom";
import { useUsersQuery } from "../../generated/graphql";
import { NetworkStatus } from "apollo-boost";
import { oc } from "ts-optchain";
import { useDebounce } from "use-debounce/lib";
import useAccessRights from "../../shared/hooks/useAccessRights";
import Tooltip from "../../shared/components/Tooltip";

const Users = () => {
  const [isAdmin, isAdminPreparer, isAdminReviewer] = useAccessRights([
    "admin",
    "admin_preparer",
    "admin_reviewer",
  ]);
  const admins = isAdmin || isAdminPreparer || isAdminReviewer;
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 400);
  const { data, networkStatus } = useUsersQuery({
    variables: {
      filter: {
        name_or_draft_object_cont: debouncedSearch,
      },
    },
    fetchPolicy: "no-cache",
  });

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
  }
  return (
    <div>
      <Helmet>
        <title>Users - PricewaterhouseCoopers</title>
      </Helmet>

      <Container fluid className="p-0 pt-3 px-4">
        <h2>User Management</h2>

        <Row>
          <Col lg={4}>
            <Input placeholder="Search Users..." onChange={handleSearch} />
          </Col>
          {admins ? (
            <Col className="text-right">
              <NavLink to="/user/department">
                <Button outline color="pwc" className="pwc mb-5 mr-2">
                  <Tooltip description="Go to departments page">
                    Departments
                  </Tooltip>
                </Button>
              </NavLink>
              {(isAdmin || isAdminPreparer) && (
                <NavLink to="/user/create">
                  <Button className="pwc mb-5">+ Add User</Button>
                </NavLink>
              )}
            </Col>
          ) : null}
        </Row>

        <div className="table-responsive">
          <Table
            loading={networkStatus === NetworkStatus.loading}
            reloading={networkStatus === NetworkStatus.setVariables}
          >
            <thead>
              <tr>
                <th style={admins ? { width: "17.5%" } : { width: "19.2%" }}>
                  Name
                </th>
                <th style={admins ? { width: "5%" } : { width: "5%" }}>ID</th>
                <th style={admins ? { width: "12.5%" } : { width: "14.2%" }}>
                  User Group
                </th>
                <th style={admins ? { width: "17%" } : { width: "17%" }}>
                  Policy Category
                </th>
                <th style={admins ? { width: "10%" } : { width: "14.2%" }}>
                  Department
                </th>
                <th style={admins ? { width: "10%" } : { width: "14.2%" }}>
                  Status
                </th>
                <th style={admins ? { width: "12.5%" } : { width: "14.2%" }}>
                  Created At
                </th>
                <th style={admins ? { width: "12.5%" } : { width: "14.2%" }}>
                  Last Updated
                </th>

                {admins ? <th>Action</th> : <th></th>}
              </tr>
            </thead>
            <tbody>
              {oc(data)
                .users.collection([])
                .map((user) => {
                  return (
                    <UserRow
                      key={user.id}
                      user={user}
                      policyCategories={user.policyCategory}
                    />
                  );
                })}
            </tbody>
          </Table>
        </div>
      </Container>
    </div>
  );
};

export default Users;
