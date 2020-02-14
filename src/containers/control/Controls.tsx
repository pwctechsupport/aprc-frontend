import { capitalCase } from "capital-case";
import React from "react";
import Helmet from "react-helmet";
import { FaPlus, FaTrash } from "react-icons/fa";
import { Link, RouteComponentProps } from "react-router-dom";
import { toast } from "react-toastify";
import { oc } from "ts-optchain";
import {
  useControlsQuery,
  useDestroyControlMutation
} from "../../generated/graphql";
import BreadCrumb from "../../shared/components/BreadCrumb";
import Button from "../../shared/components/Button";
import DialogButton from "../../shared/components/DialogButton";
import Table from "../../shared/components/Table";
import Tooltip from "../../shared/components/Tooltip";

const Controls = ({ history }: RouteComponentProps) => {
  const { loading, data } = useControlsQuery();
  const controls = oc(data).controls.collection([]);

  const [destroy, destroyM] = useDestroyControlMutation({
    onCompleted: () => toast.success("Delete Success"),
    onError: () => toast.error("Delete Failed"),
    refetchQueries: ["controls"]
  });
  const handleDelete = (id: string) => {
    destroy({ variables: { input: { id } } });
  };
  return (
    <div>
      <Helmet>
        <title>Controls - PricewaterhouseCoopers</title>
      </Helmet>
      <div className="w-100">
        <BreadCrumb crumbs={[["/control", "Controls"]]} />
        <div className="d-flex justify-content-between align-items-center mb-1">
          <h4>Controls</h4>
          <Tooltip description="Add Control">
            <Button
              tag={Link}
              to="/control/create"
              className="soft orange"
              color=""
            >
              <FaPlus />
            </Button>
          </Tooltip>
        </div>
        <div className="table-responsive">
          <Table reloading={loading}>
            <thead>
              <tr>
                <th>Id</th>
                <th>Description</th>
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
                  <tr
                    key={control.id}
                    onClick={() => history.push(`/control/${control.id}`)}
                  >
                    <td>{control.id}</td>
                    <td style={{ width: 100 }}>{control.description}</td>
                    <td>{capitalCase(control.frequency || "")}</td>
                    <td>{capitalCase(control.typeOfControl || "")}</td>
                    <td>
                      {oc(control)
                        .risks([])
                        .map(risk => risk.name)
                        .join(", ")}
                    </td>
                    <td>{capitalCase(control.nature || "")}</td>
                    <td>{control.controlOwner}</td>
                    <td className="action">
                      <DialogButton
                        onConfirm={() => handleDelete(control.id)}
                        loading={destroyM.loading}
                        message={`Delete "${control.description}"?`}
                      >
                        <FaTrash className="clickable" />
                      </DialogButton>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Controls;
