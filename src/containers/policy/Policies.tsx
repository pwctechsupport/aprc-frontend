import { capitalCase } from "capital-case";
import React, { useState } from "react";
import Helmet from "react-helmet";
import { MdSubdirectoryArrowRight } from "react-icons/md";
import { Link, RouteComponentProps } from "react-router-dom";
import { Collapse } from "reactstrap";
import { useDebounce } from "use-debounce/lib";
import PickIcon from "../../assets/Icons/PickIcon";
import {
  Policy,
  useDestroyPolicyMutation,
  usePreparerPoliciesQuery,
  useReviewerPoliciesQuery,
} from "../../generated/graphql";
import BreadCrumb from "../../shared/components/BreadCrumb";
import Button from "../../shared/components/Button";
import DateHover from "../../shared/components/DateHover";
import DialogButton from "../../shared/components/DialogButton";
import OpacityButton from "../../shared/components/OpacityButton";
import Pagination from "../../shared/components/Pagination";
import SearchBar from "../../shared/components/SearchBar";
import Table from "../../shared/components/Table";
import Tooltip from "../../shared/components/Tooltip";
import useAccessRights from "../../shared/hooks/useAccessRights";
import useListState from "../../shared/hooks/useList";
import { notifyGraphQLErrors, notifySuccess } from "../../shared/utils/notif";
import AllPolicyDashboard from "./components/AllPolicyDashboard";

export default function Policies({ history }: RouteComponentProps) {
  const [isAdmin, isAdminPreparer, isAdminReviewer] = useAccessRights([
    "admin",
    "admin_preparer",
    "admin_reviewer",
  ]);

  const isUser = !(isAdmin || isAdminPreparer || isAdminReviewer);

  const [showDashboard, setShowDashboard] = useState(false);
  function toggleShowDashboard() {
    setShowDashboard((p) => !p);
  }
  const { limit, handlePageChange, page } = useListState({ limit: 10 });
  const [search, setSearch] = useState("");
  const [searchQuery] = useDebounce(search, 400);

  const isTree = !searchQuery;

  //false means true. Because true means it will be skipped

  //Query bar

  const {
    data: dataPreparer,
    loading: loadingPreparer,
  } = usePreparerPoliciesQuery({
    fetchPolicy: "network-only",
    skip: isAdminReviewer,
    variables: {
      isTree,
      filter: isUser
        ? {
            ...(isTree && { ancestry_null: true }),
            //title_or_policy_category_name_cont
            title_or_policy_category_name_or_status_cont: searchQuery,
            status_eq: "release",
          }
        : {
            ...(isTree && { ancestry_null: true }),
            title_or_policy_category_name_or_status_cont: searchQuery,
          },
      limit,
      page,
    },
  });

  const {
    data: dataReviewer,
    loading: loadingReviewer,
  } = useReviewerPoliciesQuery({
    skip: isAdminPreparer || isUser,
    fetchPolicy: "network-only",
    variables: {
      isTree,
      filter: {
        ...(isTree && { ancestry_null: true }),
        title_cont: searchQuery,
        status_not_eq: "draft",
      },
      limit,
      page,
    },
  });
  const policiesPreparer =
    dataPreparer?.preparerPolicies?.collection ||
    dataReviewer?.reviewerPoliciesStatus?.collection ||
    [];
  const totalCountPreparer =
    dataPreparer?.preparerPolicies?.metadata.totalCount ||
    dataReviewer?.reviewerPoliciesStatus?.metadata.totalCount ||
    0;

  const [destroy] = useDestroyPolicyMutation({
    onCompleted: () => notifySuccess("Delete Success"),
    onError: notifyGraphQLErrors,
    refetchQueries: ["preparerPolicies", "reviewerPolicies"],
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
        <OpacityButton isActive={showDashboard} onClick={toggleShowDashboard}>
          {showDashboard ? " Hide" : "Show"} Dashboard
        </OpacityButton>
        {(isAdmin || isAdminPreparer) && (
          <Button to="/policy/create" tag={Link} className="pwc">
            + Add policy
          </Button>
        )}
      </div>
      <Collapse isOpen={showDashboard}>
        <div>
          <AllPolicyDashboard />
        </div>
      </Collapse>
      <div>
        <h4 style={{ fontSize: "23px" }} className="mt-4">
          List of Policy
        </h4>
      </div>
      <SearchBar
        search={search}
        setSearch={setSearch}
        placeholder="Search policies"
        loading={loadingPreparer || loadingReviewer}
      />
      <Table reloading={loadingPreparer || loadingReviewer} responsive>
        <thead>
          <tr>
            <th className="w-40">Title</th>
            <th>Category</th>
            <th>Status</th>
            <th>Last updated</th>
            <th>Last updated by</th>
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
        totalCount={totalCountPreparer}
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
                  <PickIcon name="trash" className="clickable" />
                </DialogButton>
              </Tooltip>
            </td>
          ) : (
            <td></td>
          )}
        </tr>
      )}
      {/* when admin */}
      {isAdminPreparer && (
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
          <td>
            {policy.status === "waiting_for_review" &&
            !policy.isSubmitted &&
            policy.draft
              ? "Draft"
              : policy.status === "draft"
              ? "Draft"
              : policy.isSubmitted ||
                (policy.draft && policy.isSubmitted) ||
                false
              ? "Waiting for review"
              : !policy.requestStatus ||
                (policy.requestStatus === "rejected" && !policy.draft)
              ? "Release"
              : capitalCase(policy.status || "")}
          </td>
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
                  <PickIcon name="trash" className="clickable" />
                </DialogButton>
              </Tooltip>
            </td>
          ) : (
            <td></td>
          )}
        </tr>
      )}
      {isAdminReviewer && (
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
          <td>
            {policy.status === "waiting_for_review" &&
            !policy.isSubmitted &&
            policy.draft
              ? "Draft"
              : policy.status === "waiting_for_review" && !policy.isSubmitted
              ? "Release"
              : capitalCase(policy.status || "")}
          </td>
          <td>
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
                  <PickIcon name="trash" />
                </DialogButton>
              </Tooltip>
            </td>
          ) : (
            <td></td>
          )}
        </tr>
      )}

      {isAdminReviewer
        ? childs.filter((a) => a.status !== "draft").length
          ? childs
              .filter((a) => a.status !== "draft")
              .map((childPol) => (
                <PolicyTableRow
                  key={childPol.id}
                  policy={childPol}
                  status={childPol.status}
                  onClick={onClick}
                  onDelete={onDelete}
                  level={level + 1}
                />
              ))
          : null
        : childs.length
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
