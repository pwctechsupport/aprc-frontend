import startCase from "lodash/startCase";
import React from "react";
import { FaPencilAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import {
  Assertion,
  Control,
  Frequency,
  Ipo,
  Nature,
  Status,
  TypeOfControl
} from "../../generated/graphql";
import Button from "./Button";
import EmptyAttribute from "./EmptyAttribute";
import Table from "./Table";

interface ControlsTableProps {
  controls: Control[];
  editControl?: Function;
}

export default function ControlsTable({
  controls,
  editControl
}: ControlsTableProps) {
  return (
    <Table responsive>
      <thead>
        <tr>
          <th>Description</th>
          <th>Freq</th>
          <th>Type of Control</th>
          <th>Nature</th>
          <th>Assertion</th>
          <th>IPO</th>
          <th>Control Owner</th>
          {editControl && <th />}
        </tr>
      </thead>
      <tbody>
        {controls?.length ? (
          controls?.map(control => (
            <tr key={control.id}>
              <td>
                <Link to={`/control/${control.id}`}>{control.description}</Link>
              </td>
              <td>{startCase(control.frequency || "")}</td>
              <td>{startCase(control.typeOfControl || "")}</td>
              <td>{startCase(control.nature || "")}</td>
              <td>{control.assertion?.map(startCase).join(", ")}</td>
              <td>{control.ipo?.map(startCase).join(", ")}</td>
              <td>{control.controlOwner}</td>
              {editControl && (
                <td>
                  <Button
                    onClick={() =>
                      editControl?.({
                        id: control.id,
                        assertion: control.assertion as Assertion[],
                        controlOwner: control.controlOwner || "",
                        description: control.description || "",
                        status: control.status as Status,
                        typeOfControl: control.typeOfControl as TypeOfControl,
                        nature: control.nature as Nature,
                        ipo: control.ipo as Ipo[],
                        businessProcessIds:
                          control?.businessProcesses?.map(({ id }) => id) || [],
                        frequency: control.frequency as Frequency,
                        keyControl: control.keyControl || false,
                        riskIds: control?.risks?.map(({ id }) => id) || [],
                        activityControls: control.activityControls
                      })
                    }
                    color=""
                  >
                    <FaPencilAlt />
                  </Button>
                </td>
              )}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={7}>
              <EmptyAttribute />
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
}
