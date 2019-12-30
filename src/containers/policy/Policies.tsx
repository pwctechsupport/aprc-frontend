import React from "react";
import { FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { oc } from "ts-optchain";
import {
  PoliciesDocument,
  useDestroyPolicyMutation,
  usePoliciesQuery
} from "../../generated/graphql";
import Button from "../../shared/components/Button";
import Table from "../../shared/components/Table";
import Helmet from "react-helmet";
import PolicyBar from "./components/PolicyBar";

const Policies = () => {
  const { loading, data } = usePoliciesQuery({
    variables: { filter: {} }
  });

  const [destroy] = useDestroyPolicyMutation({
    onCompleted: () => toast.success("Delete Success"),
    onError: () => toast.error("Delete Failed"),
    refetchQueries: [
      {
        query: PoliciesDocument,
        variables: { filter: {} }
      }
    ]
  });

  function handleDelete(id: string) {
    destroy({ variables: { id } });
  }

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
      {oc(data)
        .policies.collection([])
        .map(policy => {
          return (
            <PolicyBar
              id={policy.id}
              title={policy.title}
              status={policy.status}
              category={oc(policy).policyCategory.name("")}
              key={policy.id}
            />
          );
        })}
      {/* <Table reloading={loading}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Description</th>
            <th>Version</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {oc(data)
            .policies.collection([])
            .map(policy => {
              return (
                <tr key={policy.id}>
                  <td>
                    <Link to={`/policy/${policy.id}`}>{policy.title}</Link>
                  </td>
                  <td>{oc(policy).policyCategory.name("")}</td>
                  <td>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: policy.description ? policy.description : ""
                      }}
                    ></div>
                  </td>
                  <td>-</td>
                  <td>{policy.status}</td>
                  <td>
                    <FaTrash
                      onClick={() => handleDelete(policy.id)}
                      className="clickable"
                    />
                  </td>
                </tr>
              );
            })}
        </tbody>
      </Table> */}
    </div>
  );
};

export default Policies;
