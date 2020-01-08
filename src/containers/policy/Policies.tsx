import { capitalCase } from "capital-case";
import React, { useState } from "react";
import Helmet from "react-helmet";
import { FaTrash } from "react-icons/fa";
import { Link, RouteComponentProps } from "react-router-dom";
import { toast } from "react-toastify";
import { oc } from "ts-optchain";
import { useDebounce } from "use-debounce/lib";
import {
  Policy,
  useDestroyPolicyMutation,
  usePolicyTreeQuery
} from "../../generated/graphql";
import Button from "../../shared/components/Button";
import DialogButton from "../../shared/components/DialogButton";
import SearchBar from "../../shared/components/SearchBar";
import Table from "../../shared/components/Table";
import BreadCrumb from "../../shared/components/BreadCrumb";

const Policies = ({ history }: RouteComponentProps) => {
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
      }
    }
  });

  const handleChange = (e: any) => {
    setSearch(e.target.value);
  };

  const [destroy] = useDestroyPolicyMutation({
    onCompleted: () => toast.success("Delete Success"),
    onError: () => toast.error("Delete Failed"),
    refetchQueries: ["policies"]
  });

  function handleDelete(id: string) {
    destroy({ variables: { id } });
  }

  const policies = oc(data).policies.collection([]);

  return (
    <div>
      <Helmet>
        <title>Policies - PricewaterhouseCoopers</title>
      </Helmet>
      <BreadCrumb crumbs={[["/policy", "Policies"]]} />
      <div className="d-flex justify-content-between align-items-center">
        <h4>Policies</h4>
        <Link to="/policy/create">
          <Button className="pwc">+ Add Policy</Button>
        </Link>
      </div>
      <SearchBar
        value={search}
        onChange={handleChange}
        placeholder="Search Policies"
      />
      <Table reloading={loading}>
        <thead>
          <tr>
            <th>Title</th>
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
              <td className="empty" colSpan={4}>
                No item{search ? ` for search "${search}"` : ""}
              </td>
            </tr>
          )}
        </tbody>
      </Table>
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
  const childs = oc(policy).children([]);
  return (
    <>
      <tr key={policy.id} onClick={() => onClick(policy.id)}>
        <td>
          {level ? <span style={{ marginLeft: level * 20 }} /> : null}
          {policy.title}
        </td>
        <td>{oc(policy).policyCategory.name("")}</td>
        <td>{capitalCase(policy.status || "")}</td>
        <td className="action">
          <DialogButton onConfirm={() => onDelete(policy.id)}>
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
