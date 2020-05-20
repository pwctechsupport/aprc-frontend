import { capitalCase } from "capital-case";
import React, { useState, useEffect } from "react";
import Helmet from "react-helmet";
import { FaTrash } from "react-icons/fa";
import { MdSubdirectoryArrowRight } from "react-icons/md";
import { Link, RouteComponentProps } from "react-router-dom";
import { useDebounce } from "use-debounce/lib";
import {
  Policy,
  useDestroyPolicyMutation,
  usePreparerPoliciesQuery,
  useSideboxPolicyQuery,
} from "../../generated/graphql";
import BreadCrumb from "../../shared/components/BreadCrumb";
import Button from "../../shared/components/Button";
import DialogButton from "../../shared/components/DialogButton";
import SearchBar from "../../shared/components/SearchBar";
import Table from "../../shared/components/Table";
import { notifyGraphQLErrors, notifySuccess } from "../../shared/utils/notif";
import useListState from "../../shared/hooks/useList";
import Pagination from "../../shared/components/Pagination";
import OpacityButton from "../../shared/components/OpacityButton";
import { Collapse } from "reactstrap";
import AllPolicyDashboard from "./components/AllPolicyDashboard";
import useAccessRights from "../../shared/hooks/useAccessRights";
import Tooltip from "../../shared/components/Tooltip";
import DateHover from "../../shared/components/DateHover";

export default function Policies({ history }: RouteComponentProps) {
  const [isAdmin, isAdminPreparer, isAdminReviewer] = useAccessRights([
    "admin",
    "admin_preparer",
    "admin_reviewer",
  ]);

  //false means true. Because true means it will be skipped
  const [isPreparer, setIsPreparer] = useState(true);
  const [User, setUser] = useState(true);
  const isUser = !(isAdmin || isAdminPreparer || isAdminReviewer);

  useEffect(() => {
    if (isAdminPreparer || isAdminReviewer) {
      setIsPreparer(false);
      setUser(true);
    }
    if (isUser) {
      setIsPreparer(true);
      setUser(false);
    }
  }, [isAdminPreparer, isAdminReviewer, isUser]);

  const [showDashboard, setShowDashboard] = useState(false);
  function toggleShowDashboard() {
    setShowDashboard((p) => !p);
  }
  const { limit, handlePageChange, page } = useListState({ limit: 10 });
  const [search, setSearch] = useState("");
  const [searchQuery] = useDebounce(search, 400);

  const isTree = !searchQuery;
  const {
    data: dataPreparer,
    loading: loadingPreparer,
  } = usePreparerPoliciesQuery({
    fetchPolicy: "network-only",
    skip: isPreparer,
    variables: {
      isTree,
      filter: isAdminReviewer
        ? {
            ...(isTree && { ancestry_null: true }),
            title_or_status_or_policy_category_name_cont: searchQuery,
            status_eq: "draft",
          }
        : {
            ...(isTree && { ancestry_null: true }),
            title_or_status_or_policy_category_name_cont: searchQuery,
          },
      limit,
      page,
    },
  });
  const { data: dataUser, loading: loadingUser } = useSideboxPolicyQuery({
    fetchPolicy: "network-only",
    skip: User,
    variables: {
      isTree,
      filter: isUser
        ? {
            ...(isTree && { ancestry_null: true }),
            title_or_status_or_policy_category_name_cont: searchQuery,
            status_eq: "release",
          }
        : {
            ...(isTree && { ancestry_null: true }),
            title_or_status_or_policy_category_name_cont: searchQuery,
          },
      limit,
      page,
    },
  });
  const policiesPreparer = dataPreparer?.preparerPolicies?.collection || [];
  const policiesUser = dataUser?.sidebarPolicies?.collection || [];

  const totalCountPreparer =
    dataPreparer?.preparerPolicies?.metadata.totalCount || 0;
  const totalCountUser = dataUser?.sidebarPolicies?.metadata.totalCount || 0;

  const [destroy] = useDestroyPolicyMutation({
    onCompleted: () => notifySuccess("Delete Success"),
    onError: notifyGraphQLErrors,
    refetchQueries: ["policies", "preparerPolicies"],
    awaitRefetchQueries: true,
  });
  function handleDelete(id: string) {
    destroy({ variables: { id } });
  }

  return (
    <div>
      <Helmet>
        <title>Policies - PricewaterhouseCoopers</title>
      </Helmet>
      <BreadCrumb crumbs={[["/policy", "Policies"]]} />
      <div className="d-flex justify-content-between align-items-center">
        <OpacityButton onClick={toggleShowDashboard}>
          {showDashboard ? " Hide" : "Show"} Dashboard
        </OpacityButton>
        {(isAdmin || isAdminPreparer) && (
          <Button to="/policy/create" tag={Link} className="pwc">
            + Add Policy
          </Button>
        )}
      </div>
      <Collapse isOpen={showDashboard}>
        <div>
          <AllPolicyDashboard />
        </div>
      </Collapse>
      <div>
        <h4 className="mt-4">Policy</h4>
      </div>
      <SearchBar
        search={search}
        setSearch={setSearch}
        placeholder="Search Policies"
        loading={loadingPreparer || loadingUser}
      />
      <Table reloading={loadingPreparer || loadingUser} responsive>
        <thead>
          <tr>
            <th className="w-40">Title</th>
            <th>Category</th>
            <th>Status</th>
            <th>Last Updated</th>
            <th>Last Updated By</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {policiesPreparer.length ? (
            policiesPreparer.map((policy) => (
              <PolicyTableRow
                key={policy.id}
                policy={policy}
                onClick={(id) => history.push(`/policy/${id}`)}
                onDelete={handleDelete}
                status={policy.status}
                level={0}
              />
            ))
          ) : policiesUser.length ? (
            policiesUser.map((policy) => (
              <PolicyTableRow
                key={policy.id}
                policy={policy}
                onClick={(id) => history.push(`/policy/${id}`)}
                onDelete={handleDelete}
                status={policy.status}
                level={0}
              />
            ))
          ) : (
            <tr>
              <td className="empty text-grey" colSpan={4}>
                No item{search ? ` for search "${search}"` : ""}
              </td>
            </tr>
          )}
        </tbody>
      </Table>
      <Pagination
        totalCount={totalCountPreparer || totalCountUser}
        perPage={limit}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

const PolicyTableRow = ({
  policy,
  onClick,
  onDelete,
  level = 0,
  status,
}: {
  policy: Omit<Policy, "createdAt" | "updatedAt" | "visit">;
  onClick: (value: any) => void;
  onDelete: (value: any) => void;
  level?: number;
  status?: any;
}) => {
  const childs = policy.children || [];
  const [isAdmin, isAdminPreparer, isAdminReviewer] = useAccessRights([
    "admin",
    "admin_preparer",
    "admin_reviewer",
  ]);
  const isUser = !(isAdmin || isAdminPreparer || isAdminReviewer);
  const isAdmins = isAdmin || isAdminPreparer || isAdminReviewer;
  return (
    <>
      {/* when user */}
      {isUser && status === "release" && (
        <tr key={policy.id} onClick={() => onClick(policy.id)}>
          <td>
            <div
              style={level ? { marginLeft: level * 10 } : {}}
              className="d-flex align-items-center"
            >
              {level > 0 && (
                <MdSubdirectoryArrowRight color="grey" className="mr-1" />
              )}
              {policy.title}
            </div>
          </td>
          <td>{policy.policyCategory?.name || ""}</td>
          <td>{capitalCase(policy.status || "")}</td>
          <td>
            {" "}
            <DateHover>{policy?.lastUpdatedAt}</DateHover>
          </td>
          <td>{policy?.lastUpdatedBy}</td>
          {isAdminReviewer ? (
            <td className="action">
              <Tooltip description="Delete Policy">
                <DialogButton
                  message={`Are you sure to delete ${policy.title}`}
                  onConfirm={() => onDelete(policy.id)}
                  className="soft red"
                  color=""
                >
                  <FaTrash />
                </DialogButton>
              </Tooltip>
            </td>
          ) : (
            <td></td>
          )}
        </tr>
      )}
      {/* when admin */}
      {isAdmins && (
        <tr key={policy.id} onClick={() => onClick(policy.id)}>
          <td>
            <div
              style={level ? { marginLeft: level * 10 } : {}}
              className="d-flex align-items-center"
            >
              {level > 0 && (
                <MdSubdirectoryArrowRight color="grey" className="mr-1" />
              )}
              {policy.title}
            </div>
          </td>
          <td>{policy.policyCategory?.name || ""}</td>
          <td>{capitalCase(policy.status || "")}</td>
          <td>
            {" "}
            <DateHover>{policy?.lastUpdatedAt}</DateHover>
          </td>
          <td>{policy?.lastUpdatedBy}</td>
          {isAdminReviewer ? (
            <td className="action">
              <Tooltip description="Delete Policy">
                <DialogButton
                  message={`Are you sure to delete ${policy.title}`}
                  onConfirm={() => onDelete(policy.id)}
                  className="soft red"
                  color=""
                >
                  <FaTrash />
                </DialogButton>
              </Tooltip>
            </td>
          ) : (
            <td></td>
          )}
        </tr>
      )}

      {childs.length
        ? childs.map((childPol) => (
            <PolicyTableRow
              key={childPol.id}
              policy={childPol}
              status={childPol.status}
              onClick={onClick}
              onDelete={onDelete}
              level={level + 1}
            />
          ))
        : null}
    </>
  );
};
