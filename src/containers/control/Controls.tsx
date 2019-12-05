import React from "react";
import Table from "../../shared/components/Table";
import { useControlsQuery } from "../../generated/graphql";
import { oc } from "ts-optchain";
import Button from "../../shared/components/Button";
import { Link } from "react-router-dom";

const Controls = () => {
  const { loading, data } = useControlsQuery({ variables: { filter: {} } });
  const controls = oc(data).controls.collection([]);
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center">
        <h1>Controls</h1>
        <Link to="/control/create">
          <Button className="pwc">+ Add Control</Button>
        </Link>
      </div>
      <Table reloading={loading}>
        <thead>
          <tr>
            <th>Id</th>
            <th>Title</th>
            <th>Freq</th>
            <th>Type</th>
            <th>Ass. Risk</th>
            <th>Nature</th>
            <th>Owner</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {controls.map(control => {
            return (
              <tr key={control.id}>
                <td>{control.id}</td>
                <td>{control.frequency}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};

export default Controls;
