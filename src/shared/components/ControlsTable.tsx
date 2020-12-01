import React, { Fragment, useState, useEffect } from "react";
// import { FaPencilAlt } from "react-icons/fa";
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
import useAccessRights from "../hooks/useAccessRights";
import { PWCLink } from "./PoliciesTable";
import { capitalCase } from "capital-case";

interface ControlsTableProps {
  // controls: Control[];
  // editControl?: Function;
  data?: PolicyQuery;
  setControlId?: any;
}

export default function ControlsTable({
  // controls,
  // editControl,
  data,
  setControlId,
}: ControlsTableProps) {
  const [isAdmin, isAdminReviewer, isAdminPreparer] = useAccessRights([
    "admin",
    "admin_reviewer",
    "admin_preparer",
  ]);
  const policyId = data?.policy?.id;
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
          c.children.map((d: any) => d.children.map((e: any) => e.controls))
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
  const newData = [
    ...controlsWithoutChildren.flat(10),
    ...controlFirstChild.flat(10),
    ...controlSecondChild.flat(10),
    ...controlThirdChild.flat(10),
    ...controlFourthChild.flat(10),
    ...controlFifthChild.flat(10),
  ];
  const [newDataControls, setNewDataControls] = useState(newData);
  useEffect(() => {
    if (
      !(isAdmin || isAdminReviewer || isAdminPreparer) &&
      newData === newDataControls
    ) {
      setNewDataControls(newData.filter((a) => a.status === "release"));
    }
  }, [isAdmin, isAdminReviewer, isAdminPreparer, newData, newDataControls]);

  return (
    <Table responsive>
      <thead>
        <tr>
          <th style={{ width: "14.28%" }}>Description</th>
          <th style={{ width: "14.28%" }}>Frequency</th>
          <th style={{ width: "14.28%" }}>Type of Control</th>
          <th style={{ width: "14.28%" }}>Nature</th>
          <th style={{ width: "14.28%" }}>Assertion</th>
          <th style={{ width: "14.28%" }}>IPO</th>
          <th style={{ width: "14.28%" }}>Control Owner</th>
          {/* {editControl && <th />} */}
        </tr>
      </thead>
      <tbody>
        {dataModifier(newDataControls).length ? (
          <Fragment>
            {dataModifier(newDataControls)?.map((control: any) => (
              <tr key={control.id}>
                <td>
                  <PWCLink
                    to={`/policy/${policyId}/details/control/${control.id}`}
                    onClick={() => {
                      setControlId(control.id);
                    }}
                  >
                    {control.description}
                  </PWCLink>
                </td>
                <td>{control.frequency || ""}</td>
                <td>{control.typeOfControl || ""}</td>
                <td>{control.nature || ""}</td>
                <td>{control.assertion.map((x: any) => capitalCase(x)).join(", ")}</td>
                <td>{control.ipo.join(", ") || ""}</td>
                <td>{control.controlOwner?.join(", ")}</td>
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
