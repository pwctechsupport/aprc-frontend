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

const Users = () => {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 800);
  const { data, networkStatus } = useUsersQuery({
    variables: {
      filter: {
        first_name_cont: debouncedSearch
      }
    },
    fetchPolicy: "no-cache"
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
        </Row>

        <div className="table-responsive">
          <Table
            loading={networkStatus === NetworkStatus.loading}
            reloading={networkStatus === NetworkStatus.setVariables}
          >
            <thead>
              <tr>
                <th style={{ width: "20%" }}>Username</th>
                <th style={{ width: "20%" }}>User ID</th>
                <th style={{ width: "20%" }}>User Group</th>
                <th style={{ width: "20%" }}>Policy Category</th>
                <th style={{ width: "20%" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {oc(data)
                .users.collection([])
                .map(user => {
                  return <UserRow key={user.id} user={user} />;
                })}
            </tbody>
          </Table>
        </div>

        <div className="text-center">
          <NavLink to="/user/create">
            <Button outline color="pwc" className="pwc mb-5">
              Add User
            </Button>
          </NavLink>
        </div>
      </Container>
    </div>
  );
};

export default Users;
