import { capitalCase } from "capital-case";
import React, { useState } from "react";
import Helmet from "react-helmet";
import { FaTrash } from "react-icons/fa";
import { Link, RouteComponentProps } from "react-router-dom";
import { toast } from "react-toastify";
import { oc } from "ts-optchain";
import { useDebounce } from "use-debounce/lib";
import {
  useDestroyPolicyMutation,
  usePoliciesQuery
} from "../../generated/graphql";
import Button from "../../shared/components/Button";
import DialogButton from "../../shared/components/DialogButton";
import SearchBar from "../../shared/components/SearchBar";
import { ActionTd, EmptyTd, Tr } from "../../shared/components/Table";

const Policies = ({ history }: RouteComponentProps) => {
  const [search, setSearch] = useState("");
  const [searchQuery] = useDebounce(search, 400);
  const { data } = usePoliciesQuery({
    variables: {
      filter: {
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
      <div className="d-flex justify-content-between align-items-center">
        <h1>Policies</h1>
        <Link to="/policy/create">
          <Button className="pwc">+ Add Policy</Button>
        </Link>
      </div>
      <SearchBar
        value={search}
        onChange={handleChange}
        placeholder="Search Policies"
      />
      <table className="w-100">
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
            policies.map(policy => {
              return (
                <Tr
                  key={policy.id}
                  onClick={() => history.push(`/policy/${policy.id}`)}
                >
                  <td>{policy.title}</td>
                  <td>{oc(policy).policyCategory.name("")}</td>
                  <td>{capitalCase(policy.status || "")}</td>
                  <ActionTd>
                    <DialogButton onConfirm={() => handleDelete(policy.id)}>
                      <FaTrash />
                    </DialogButton>
                  </ActionTd>
                </Tr>
              );
            })
          ) : (
            <tr>
              <EmptyTd colSpan={4}>
                No item{search ? ` for search "${search}"` : ""}
              </EmptyTd>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Policies;
