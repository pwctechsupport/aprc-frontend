import React, { useState } from "react";
import Helmet from "react-helmet";
import { Col, Container, Row } from "reactstrap";
import Button from "../../shared/components/Button";
import Input from "../../shared/components/forms/Input";
import Table from "../../shared/components/Table";
import UserRow from "./components/UserRow";
import { NavLink } from "react-router-dom";
import {
  usePreparerUsersQuery,
  useReviewerUsersStatusQuery,
} from "../../generated/graphql";
import { NetworkStatus } from "apollo-boost";
import { useDebounce } from "use-debounce/lib";
import useAccessRights from "../../shared/hooks/useAccessRights";
import Tooltip from "../../shared/components/Tooltip";
import useListState from "../../shared/hooks/useList";
import Pagination from "../../shared/components/Pagination";

const Users = () => {
  const [isAdmin, isAdminPreparer, isAdminReviewer] = useAccessRights([
    "admin",
    "admin_preparer",
    "admin_reviewer",
  ]);
  const admins = isAdmin || isAdminPreparer || isAdminReviewer;
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 400);
  const { limit, handlePageChange, page } = useListState({ limit: 10 });

  const { data, networkStatus } = usePreparerUsersQuery({
    skip: isAdminReviewer,
    variables: {
      filter: {
        name_or_draft_object_cont: debouncedSearch,
      },
      limit,
      page,
    },
    fetchPolicy: "no-cache",
  });
  const magicOfSort = data?.preparerUsers?.collection.sort((a, b) =>
    b.name && a.name
      ? a.name.toLowerCase() > b.name.toLowerCase()
        ? 1
        : b.name.toLowerCase() > a.name.toLowerCase()
        ? -1
        : 0
      : 0
  );
  const {
    data: dataReviewer,
    networkStatus: networkStatusreviewer,
  } = useReviewerUsersStatusQuery({
    skip: isAdminPreparer || isAdmin,
    variables: {
      filter: {
        name_or_draft_object_cont: debouncedSearch,
      },
      limit,
      page,
    },
    fetchPolicy: "no-cache",
  });
  const totalCount =
    data?.preparerUsers?.metadata.totalCount ||
    dataReviewer?.reviewerUsersStatus?.metadata.totalCount ||
    0;
  const userData =
    magicOfSort || dataReviewer?.reviewerUsersStatus?.collection || [];
  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
  }
  return (
    <div>
      <Helmet>
        <title>Users - PricewaterhouseCoopers</title>
      </Helmet>

      <Container fluid className="p-0 pt-3 px-4">
        <h2 style={{ fontSize: "23px" }} className="mt-2">
          User management
        </h2>

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
            loading={
              networkStatus === NetworkStatus.loading ||
              networkStatusreviewer === NetworkStatus.loading
            }
            reloading={
              networkStatus === NetworkStatus.setVariables ||
              networkStatusreviewer === NetworkStatus.setVariables
            }
          >
            <thead>
              <tr>
                <th style={admins ? { width: "6%" } : { width: "6%" }}>
                  User ID
                </th>
                <th style={admins ? { width: "17.5%" } : { width: "19.2%" }}>
                  Username
                </th>
                <th style={admins ? { width: "12.5%" } : { width: "14.2%" }}>
                  User group
                </th>
                <th style={admins ? { width: "17%" } : { width: "17%" }}>
                  Policy category
                </th>
                <th style={admins ? { width: "10%" } : { width: "14.2%" }}>
                  Department
                </th>
                <th style={admins ? { width: "10%" } : { width: "14.2%" }}>
                  Status
                </th>
                <th style={admins ? { width: "12.5%" } : { width: "14.2%" }}>
                  Created at
                </th>
                <th style={admins ? { width: "12.5%" } : { width: "14.2%" }}>
                  Last updated
                </th>
                {admins ? <th>Action</th> : <th></th>}
              </tr>
            </thead>
            <tbody>
              {userData.map((user) => {
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
          <Pagination
            totalCount={totalCount}
            perPage={limit}
            onPageChange={handlePageChange}
          />
        </div>
      </Container>
    </div>
  );
};

export default Users;
