import startCase from "lodash/startCase";
import React from "react";
  // { useState, useEffect } 
import EmptyAttribute from "./EmptyAttribute";
import { oc } from "ts-optchain";
// import useAccessRights from "../hooks/useAccessRights";
import { PWCLink } from "./PoliciesTable";
import { Badge } from "./Badge";
import _, { isEmpty } from "lodash";

interface RisksListProps {
  data?: any;
  setRiskId?: any;
}

export default function RisksList({
  setRiskId,
  data,
}:
RisksListProps) {
  // const [isAdmin, isAdminReviewer, isAdminPreparer, isUser] = useAccessRights([
  //   "admin",
  //   "admin_reviewer",
  //   "admin_preparer",
  //   "user",
  // ]);
  const policyId = data?.policy?.id;
  const descendantsRisks = data?.policy?.descendantsRisks
  const hasChildren = isEmpty(data?.policy?.children)
  const risksWithoutChildren = oc(data).policy.risks([]);
  const riskFirstChild = data?.policy?.children?.map((a: any) => a.risks) || [];
  const riskSecondChild =
    data?.policy?.children?.map((a: any) =>
      a.children.map((b: any) => b.risks)
    ) || [];
  const riskThirdChild =
    data?.policy?.children?.map((a: any) =>
      a.children?.map((b: any) => b.children.map((c: any) => c.risks))
    ) || [];
  const riskFourthChild =
    data?.policy?.children?.map((a: any) =>
      a.children?.map((b: any) =>
        b.children?.map((c: any) => c.children.map((d: any) => d.risks))
      )
    ) || [];
  const riskFifthChild =
    data?.policy?.children?.map((a: any) =>
      a.children?.map((b: any) =>
        b.children?.map((c: any) =>
          c.children.map((d: any) => d.children.map((e: any) => e.risks))
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
    ...risksWithoutChildren.flat(10),
    ...riskFirstChild.flat(10),
    ...riskSecondChild.flat(10),
    ...riskThirdChild.flat(10),
    ...riskFourthChild.flat(10),
    ...riskFifthChild.flat(10),
  ];
  // const [newDataRisks, setNewDataRisks] = useState(newData);

  // const subPolicyRisksData = _(newData).keyBy('id').merge(_.keyBy(descendantsRisks, 'id')).values().value()

  // useEffect(() => {
  //   if (
  //     isUser && newData === newDataRisks
  //   ) {
  //     setNewDataRisks(newData.filter((a) => a.status === "release"));
  //   }
  // }, [isAdmin, isAdminReviewer, isAdminPreparer, isUser, newData, newDataRisks]);

  return dataModifier(newData).length ? (
    <ul>
      {!hasChildren ? (
        <ul>
          {dataModifier(descendantsRisks).map((risk: any) => (
            <li key={risk.id}>
              <div className="mb-3 d-flex justify-content-between">
                <PWCLink
                  className="wrapped"
                  to={`/policy/${policyId}/details/risk/${risk.id}`}
                  onClick={() => setRiskId(risk.id)}
                  style={{ fontSize: "14px" }}
                >
                  {risk.name}
                  <Badge color="secondary mx-3">
                    {startCase(risk.levelOfRisk || "")}
                  </Badge>
                  <Badge color="secondary">
                    {startCase(risk.typeOfRisk || "")}
                  </Badge>
                </PWCLink>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <ul>
          {/* {isUser ? (
            <ul>
              {dataModifier(newDataRisks).map((risk: any) => (
                <li key={risk.id}>
                  <div className="mb-3 d-flex justify-content-between">
                    <PWCLink
                      className="wrapped"
                      to={`/policy/${policyId}/details/risk/${risk.id}`}
                      onClick={() => setRiskId(risk.id)}
                      style={{ fontSize: "14px" }}
                    >
                      {risk.name}
                      <Badge color="secondary mx-3">
                        {startCase(risk.levelOfRisk || "")}
                      </Badge>
                      <Badge color="secondary">
                        {startCase(risk.typeOfRisk || "")}
                      </Badge>
                    </PWCLink>
                  </div>
                </li>
              ))}
            </ul>
          ) : ( */}
            {dataModifier(newData).map((risk: any) => {
              return (
                <li key={risk.id}>
                  <div className="mb-3 d-flex justify-content-between">
                    <PWCLink
                      className="wrapped"
                      to={`/policy/${policyId}/details/risk/${risk.id}`}
                      onClick={() => setRiskId(risk.id)}
                      style={{ fontSize: "14px" }}
                    >
                      {risk.name}
                      <Badge color="secondary mx-3">
                        {startCase(risk.levelOfRisk || "")}
                      </Badge>
                      <Badge color="secondary">
                        {startCase(risk.typeOfRisk || "")}
                      </Badge>
                    </PWCLink>
                  </div>
                </li>
              )
            })}
          {/* )} */}
        </ul>
      )}
    </ul>
  ) : (
    <EmptyAttribute />
  );
}

/* {editRisk && (
      <Button
        onClick={() =>
          editRisk({
            id: risk.id,
            name: risk.name || "",
            businessProcessIds:
              risk.businessProcesses?.map(toLabelValue) || [],
            levelOfRisk: risk.levelOfRisk as LevelOfRisk,
            typeOfRisk: risk.typeOfRisk as TypeOfRisk,
          })
        }
        color=""
      >
        <FaPencilAlt />
      </Button>
    )} */
/* 
    {withRelatedControls && risk.controls?.length ? (
      <>
        <h6>Control</h6>
        <ControlsTable
          controls={risk.controls}
          editControl={editControl}
        />
      </>
    ) : null} */