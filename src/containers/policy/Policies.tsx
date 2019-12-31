import { capitalCase } from "capital-case";
import React, { useState } from "react";
import Helmet from "react-helmet";
import { FaTrash } from "react-icons/fa";
import { Link, RouteComponentProps } from "react-router-dom";
import { toast } from "react-toastify";
import styled from "styled-components";
import { oc } from "ts-optchain";
import { useDebounce } from "use-debounce/lib";
import {
  useDestroyPolicyMutation,
  usePoliciesQuery
} from "../../generated/graphql";
import Button from "../../shared/components/Button";
import DialogButton from "../../shared/components/DialogButton";

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
      <Input
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
                <PolicyTr
                  key={policy.id}
                  onClick={() => history.push(`/policy/${policy.id}`)}
                >
                  <td>{policy.title}</td>
                  <td>{oc(policy).policyCategory.name("")}</td>
                  <td>{capitalCase(policy.status || "")}</td>
                  <PolicyActionTd>
                    <DialogButton onConfirm={() => handleDelete(policy.id)}>
                      <FaTrash />
                    </DialogButton>
                  </PolicyActionTd>
                </PolicyTr>
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

const Input = styled.input`
  width: 100%;
  margin-bottom: 20px;
  ::placeholder {
    color: grey;
  }
  padding: 16px 16px 16px 60px;
  border: none;
  background: rgba(0, 0, 0, 0.003);
  box-shadow: inset 0 -2px 1px rgba(0, 0, 0, 0.03);
  font-style: italic;
  font-weight: 300;
  font-size: 15px;
  &::-webkit-input-placeholder {
    color: "red";
  }
`;

const PolicyTr = styled.tr`
  background: white;
  box-shadow: inset 0 -1px 0 0 rgba(0, 0, 0, 0.08);
  cursor: pointer;
  height: 60px;
  color: inherit;
  &:hover {
    background: rgba(0, 0, 0, 0.08);
    text-decoration: none;
    color: inherit;
  }
`;

const PolicyActionTd = styled.td`
  visibility: hidden;
  &:hover {
    visibility: visible;
  }
  ${PolicyTr}:hover & {
    visibility: visible;
  }
`;

const EmptyTd = styled.td`
  text-align: center;
  padding: 20px 0px;
  background: rgba(0, 0, 0, 0.1);
`;
