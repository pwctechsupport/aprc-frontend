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
  const assertionAndIpoModifier = (data: any) => {
    let finalData: any = data;
    const existence_and_occurence = finalData.findIndex(
      (a: any) => a === "existence_and_occurence"
    );
    const cut_over = finalData.findIndex((a: any) => a === "cut_over");
    const rights_and_obligation = finalData.findIndex(
      (a: any) => a === "rights_and_obligation"
    );
    const presentation_and_disclosure = finalData.findIndex(
      (a: any) => a === "presentation_and_disclosure"
    );
    const accuracy = finalData.findIndex((a: any) => a === "accuracy");
    const completeness = finalData.findIndex((a: any) => a === "completeness");
    const validation = finalData.findIndex((a: any) => a === "validation");
    const restriction = finalData.findIndex((a: any) => a === "restriction");

    if (existence_and_occurence !== -1) {
      finalData[existence_and_occurence] = "E/O ";
    }
    if (cut_over !== -1) {
      finalData[cut_over] = "CO";
    }
    if (rights_and_obligation !== -1) {
      finalData[rights_and_obligation] = "R&O";
    }
    if (presentation_and_disclosure !== -1) {
      finalData[presentation_and_disclosure] = "P&D";
    }
    if (accuracy !== -1) {
      finalData[accuracy] = "A";
    }
    if (completeness !== -1) {
      finalData[completeness] = "C";
    }
    if (validation !== -1) {
      finalData[validation] = "V";
    }
    if (restriction !== -1) {
      finalData[restriction] = "R";
    }
    return finalData.join(", ");
  };
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
              <td>{assertionAndIpoModifier(control.assertion)}</td>
              <td>{assertionAndIpoModifier(control.ipo)}</td>
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
