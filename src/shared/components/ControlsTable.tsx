import startCase from "lodash/startCase";
import React, { Fragment } from "react";
// import { FaPencilAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import {
  // Assertion,
  // Control,
  // Frequency,
  // Ipo,
  // Nature,
  // Status,
  // TypeOfControl,
  PolicyQuery,
} from "../../generated/graphql";
// import Button from "./Button";
import EmptyAttribute from "./EmptyAttribute";
import Table from "./Table";
import { oc } from "ts-optchain";

interface ControlsTableProps {
  // controls: Control[];
  // editControl?: Function;
  data?: PolicyQuery;
}

export default function ControlsTable({
  // controls,
  // editControl,
  data,
}: ControlsTableProps) {
  const controlsWithoutChildren = oc(data).policy.controls([]);
  const controlFirstChild =
    data?.policy?.children?.map((a: any) => a.controls) || [];
  const controlSecondChild =
    data?.policy?.children?.map((a: any) =>
      a.children.map((b: any) => b.controls)
    ) || [];
  const controlThirdChild =
    data?.policy?.children?.map((a: any) =>
      a.children?.map((b: any) => b.children.map((c: any) => c.controls))
    ) || [];
  const controlFourthChild =
    data?.policy?.children?.map((a: any) =>
      a.children?.map((b: any) =>
        b.children?.map((c: any) => c.children.map((d: any) => d.controls))
      )
    ) || [];
  const controlFifthChild =
    data?.policy?.children?.map((a: any) =>
      a.children?.map((b: any) =>
        b.children?.map((c: any) =>
          c.children?.map((d: any) => d.map((e: any) => e.controls))
        )
      )
    ) || [];
  const dataModifier = (a: any) => {
    for (let i = 0; i < a.length; ++i) {
      for (let j = i + 1; j < a.length; ++j) {
        if (a[i] === a[j]) a.splice(j--, 1);
      }
    }

    return a;
  };
  const newDataControls = [
    ...controlsWithoutChildren.flat(10),
    ...controlFirstChild.flat(10),
    ...controlSecondChild.flat(10),
    ...controlThirdChild.flat(10),
    ...controlFourthChild.flat(10),
    ...controlFifthChild.flat(10),
  ];
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
          {/* {editControl && <th />} */}
        </tr>
      </thead>
      <tbody>
        {dataModifier(newDataControls).length ? (
          <Fragment>
            {dataModifier(newDataControls)?.map((control: any) => (
              <tr key={control.id}>
                <td>
                  <Link to={`/control/${control.id}`}>
                    {control.description}
                  </Link>
                </td>
                <td>{startCase(control.frequency || "")}</td>
                <td>{startCase(control.typeOfControl || "")}</td>
                <td>{startCase(control.nature || "")}</td>
                <td>{assertionAndIpoModifier(control.assertion)}</td>
                <td>{assertionAndIpoModifier(control.ipo)}</td>
                <td>{control.controlOwner}</td>
              </tr>
            ))}
          </Fragment>
        ) : (
          <tr>
            <td colSpan={7}>
              <EmptyAttribute />
            </td>
          </tr>
        )}
      </tbody>
      {/* {editControl && (
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
                        activityControls: control.activityControls,
                      })
                    }
                    color=""
                  >
                    <FaPencilAlt />
                  </Button>
                </td>
              )} */}
    </Table>
  );
}
