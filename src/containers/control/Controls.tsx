import React from "react";
import Table from "../../shared/components/Table";
import {
  useControlsQuery,
  useDestroyControlMutation
} from "../../generated/graphql";
import { oc } from "ts-optchain";
import Button from "../../shared/components/Button";
import { Link } from "react-router-dom";
import { FaTrash } from "react-icons/fa";

const Controls = () => {
  const { loading, data } = useControlsQuery({ variables: { filter: {} } });
  const controls = oc(data).controls.collection([]);

  const [destroy] = useDestroyControlMutation();
  const handleDelete = (id: string) => {
    destroy({ variables: { input: { id } } });
  };
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
                <td>
                  <Link to={`/control/${control.id}`}>{control.id}</Link>
                </td>
                <td>{control.description}</td>
                <td>{control.frequency}</td>
                <td>{control.typeOfControl}</td>
                <td>
                  {oc(control)
                    .risks([])
                    .map(risk => risk.name)
                    .join(", ")}
                </td>
                <td>{control.nature}</td>
                <td>{control.controlOwner}</td>
                <td>
                  <Button
                    onClick={() => handleDelete(control.id)}
                    color="transparent"
                  >
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};

export default Controls;
