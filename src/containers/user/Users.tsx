import React, { useState } from "react";
import Helmet from "react-helmet";
import { Col, Container, Row } from "reactstrap";
import Input from "../../shared/components/forms/Input";
import Table from "../../shared/components/Table";
import UserRow from "./components/UserRow";
import Button from "../../shared/components/Button";

const Users = () => {
  const [addedUsers, setAddedUsers] = useState<Array<any>>([]);

  function handleAdd() {
    setAddedUsers(addedUsers.concat([{}]));
  }

  return (
    <div>
      <Helmet>
        <title>Users - PricewaterhouseCoopers</title>
      </Helmet>

      <Container>
        <h2>User Management</h2>

        <Row>
          <Col lg={4}>
            <Input placeholder="Search Users..." />
          </Col>
        </Row>

        <div className="table-responsive">
          <Table loading={false} reloading={false}>
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
              <UserRow />
              {addedUsers.map((user, index) => {
                return <UserRow key={`added_${index}`} isEdit={true} />;
              })}
            </tbody>
          </Table>
        </div>

        <div className="text-center">
          <Button outline color="pwc" className="pwc" onClick={handleAdd}>
            Add User
          </Button>
        </div>
      </Container>
    </div>
  );
};

export default Users;
