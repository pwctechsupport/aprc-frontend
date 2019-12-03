import React from "react";
import { Link } from "react-router-dom";
import { oc } from "ts-optchain";
import { usePoliciesQuery } from "../../generated/graphql";
import Table from "../../shared/components/Table";
import Button from "../../shared/components/Button";

const Policies = () => {
  const { loading, data } = usePoliciesQuery({
    variables: { filter: {} }
  });

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center">
        <h1>Policies</h1>
        <Link to="/policy/create">
          <Button>+ Add Policy</Button>
        </Link>
      </div>
      <Table reloading={loading}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Description</th>
            <th>Version</th>
            <th>Status</th>
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
                  <td>{policy.policyCategoryId}</td>
                  <td>{policy.description}</td>
                  <td>-</td>
                  <td>-</td>
                </tr>
              );
            })}
        </tbody>
      </Table>
    </div>
  );
};

export default Policies;
