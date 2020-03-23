import { capitalCase } from "capital-case";
import React, { useState } from "react";
import Helmet from "react-helmet";
import { FaTrash } from "react-icons/fa";
import { MdSubdirectoryArrowRight } from "react-icons/md";
import { Link, RouteComponentProps } from "react-router-dom";
import { useDebounce } from "use-debounce/lib";
import {
  Policy,
  useDestroyPolicyMutation,
  usePolicyTreeQuery
} from "../../generated/graphql";
import BreadCrumb from "../../shared/components/BreadCrumb";
import Button from "../../shared/components/Button";
import DialogButton from "../../shared/components/DialogButton";
import SearchBar from "../../shared/components/SearchBar";
import Table from "../../shared/components/Table";
import { notifyGraphQLErrors, notifySuccess } from "../../shared/utils/notif";
import useListState from "../../shared/hooks/useList";
import Pagination from "../../shared/components/Pagination";

const Policies = ({ history }: RouteComponentProps) => {
  const { limit, handlePageChange, page } = useListState({ limit: 10 });
  const [search, setSearch] = useState("");
  const [searchQuery] = useDebounce(search, 400);

  const isTree = !searchQuery;
  const { data, loading } = usePolicyTreeQuery({
    fetchPolicy: "network-only",
    variables: {
      isTree,
      filter: {
        ...(isTree && { ancestry_null: true }),
        title_cont: searchQuery
      },
      limit,
      page
    }
  });
  const policies = data?.policies?.collection || [];
  const totalCount = data?.policies?.metadata.totalCount || 0;

  const [destroy] = useDestroyPolicyMutation({
    onCompleted: () => notifySuccess("Delete Success"),
    onError: notifyGraphQLErrors,
    refetchQueries: ["policies"],
    awaitRefetchQueries: true
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
      <div className="d-flex justify-content-end align-items-center">
        <Link to="/policy/create">
          <Button className="pwc">+ Add Policy</Button>
        </Link>
      </div>
      <SearchBar
        search={search}
        setSearch={setSearch}
        placeholder="Search Policies"
        loading={loading}
      />
      <Table reloading={loading} responsive>
        <thead>
          <tr>
            <th className="w-40">Title</th>
            <th>Category</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {policies.length ? (
            policies.map(policy => (
              <PolicyTableRow
                key={policy.id}
                policy={policy}
                onClick={id => history.push(`/policy/${id}`)}
                onDelete={handleDelete}
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
        totalCount={totalCount}
        perPage={limit}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default Policies;

const PolicyTableRow = ({
  policy,
  onClick,
  onDelete,
  level = 0
}: {
  policy: Omit<Policy, "createdAt" | "updatedAt" | "visit">;
  onClick: (value: any) => void;
  onDelete: (value: any) => void;
  level?: number;
}) => {
  const childs = policy.children || [];
  return (
    <>
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
        <td className="action">
          <DialogButton
            message={`Are you sure to delete ${policy.title}`}
            onConfirm={() => onDelete(policy.id)}
          >
            <FaTrash />
          </DialogButton>
        </td>
      </tr>
      {childs.length
        ? childs.map(childPol => (
            <PolicyTableRow
              key={childPol.id}
              policy={childPol}
              onClick={onClick}
              onDelete={onDelete}
              level={level + 1}
            />
          ))
        : null}
    </>
  );
};
