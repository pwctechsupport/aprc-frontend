import React, { Fragment } from "react";
import {
  PolicyQuery,
} from "../../generated/graphql";
import EmptyAttribute from "./EmptyAttribute";
import Table from "./Table";
import { oc } from "ts-optchain";
// import useAccessRights from "../hooks/useAccessRights";
import { PWCLink } from "./PoliciesTable";
import { capitalCase } from "capital-case";
import _, { isEmpty } from "lodash";

interface ControlsTableProps {
  data?: PolicyQuery;
  setControlId?: any;
}

export default function ControlsTable({
  data,
  setControlId,
}: ControlsTableProps) {
  // const [isAdmin, isAdminReviewer, isAdminPreparer, isUser] = useAccessRights([
  //   "admin",
  //   "admin_reviewer",
  //   "admin_preparer",
  //   "user",
  // ]);
  const policyId = data?.policy?.id;
  const descendantsControls = data?.policy?.descendantsControls
  const hasChildren = isEmpty(data?.policy?.children)
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
  // const [newDataControls, setNewDataControls] = useState(newData);

  // const subPolicyControlsData = _(newData).keyBy('id').merge(_.keyBy(descendantsControls, 'id')).values().value()

  // useEffect(() => {
  //   if (
  //     isUser && newData === newDataControls
  //   ) {
  //     setNewDataControls(newData.filter((a) => a.status === "release"));
  //   }
  // }, [isAdmin, isAdminReviewer, isAdminPreparer, isUser, newData, newDataControls]);

  return (
    <Table responsive>
      <thead>
        <tr>
          <th style={{ width: "14.28%" }}>Description</th>
          <th style={{ width: "14.28%" }}>Frequency</th>
          <th style={{ width: "14.28%" }}>Type of control</th>
          <th style={{ width: "14.28%" }}>Nature</th>
          <th style={{ width: "14.28%" }}>Assertion</th>
          <th style={{ width: "14.28%" }}>IPO</th>
          <th style={{ width: "14.28%" }}>Control owner</th>
          {/* {editControl && <th />} */}
        </tr>
      </thead>
      <tbody>
        {dataModifier(newData).length ? (
          <Fragment>
            {!hasChildren ? (
              <>
                {dataModifier(descendantsControls).map((control: any) => (
                  <tr key={control.id}>
                    <td>
                      <PWCLink
                        className="wrapped"
                        to={`/policy/${policyId}/details/control/${control.id}`}
                        onClick={() => {
                          setControlId(control.id);
                        }}
                      >
                        {control.description}
                      </PWCLink>
                    </td>
                    <td>{capitalCase(control.frequency) || ""}</td>
                    <td>{capitalCase(control.typeOfControl) || ""}</td>
                    <td>{capitalCase(control.nature) || ""}</td>
                    <td>{control.assertion.map((x: any) => capitalCase(x)).join(", ")}</td>
                    <td>{control.ipo.map((x: any) => capitalCase(x)).join(", ")}</td>
                    <td>{control.controlOwner?.join(", ")}</td>
                  </tr>
                ))}
              </>
            ) : (
              <>
                {/* {isUser ? (
                  <Fragment>
                    {dataModifier(newDataControls)?.map((control: any) => (
                      <tr key={control.id}>
                        <td>
                          <PWCLink
                            className="wrapped"
                            to={`/policy/${policyId}/details/control/${control.id}`}
                            onClick={() => {
                              setControlId(control.id);
                            }}
                          >
                            {control.description}
                          </PWCLink>
                        </td>
                        <td>{capitalCase(control.frequency) || ""}</td>
                        <td>{capitalCase(control.typeOfControl) || ""}</td>
                        <td>{capitalCase(control.nature) || ""}</td>
                        <td>{control.assertion.map((x: any) => capitalCase(x)).join(", ")}</td>
                        <td>{control.ipo.map((x: any) => capitalCase(x)).join(", ")}</td>
                        <td>{control.controlOwner?.join(", ")}</td>
                      </tr>
                    ))}
                  </Fragment>
                ) : ( */}
                  {dataModifier(newData)?.map((control: any) => (
                    <tr key={control.id}>
                      <td>
                        <PWCLink
                          className="wrapped"
                          to={`/policy/${policyId}/details/control/${control.id}`}
                          onClick={() => {
                            setControlId(control.id);
                          }}
                        >
                          {control.description}
                        </PWCLink>
                      </td>
                      <td>{capitalCase(control.frequency) || ""}</td>
                      <td>{capitalCase(control.typeOfControl) || ""}</td>
                      <td>{capitalCase(control.nature) || ""}</td>
                      <td>{control.assertion.map((x: any) => capitalCase(x)).join(", ")}</td>
                      <td>{control.ipo.map((x: any) => capitalCase(x)).join(", ")}</td>
                      <td>{control.controlOwner?.join(", ")}</td>
                    </tr>
                  ))}
                {/* )} */}
              </>
            )}
          </Fragment>
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
