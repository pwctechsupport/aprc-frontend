import startCase from "lodash/startCase";
import React, { useState, useEffect } from "react";
// import { FaPencilAlt } from "react-icons/fa";
import { Badge } from "reactstrap";
import {
  // LevelOfRisk,
  // Risk,
  // TypeOfRisk,
  // Policy,
  PolicyQuery,
} from "../../generated/graphql";
// import { toLabelValue } from "../formatter";
import getRiskColor from "../utils/getRiskColor";
// import Button from "./Button";
// import ControlsTable from "./ControlsTable";
import EmptyAttribute from "./EmptyAttribute";
import { oc } from "ts-optchain";
import useAccessRights from "../hooks/useAccessRights";
import { PWCLink } from "./PoliciesTable";

interface RisksListProps {
  // risks: Risk[];
  // editRisk?: Function;
  // editControl?: Function;
  data?: PolicyQuery;
  setRiskId?: any;
  // withRelatedControls?: boolean;
}

export default function RisksList({
  // risks,
  // editRisk,
  setRiskId,
  // editControl,
  data,
}: // withRelatedControls,
RisksListProps) {
  const [isAdmin, isAdminReviewer, isAdminPreparer] = useAccessRights([
    "admin",
    "admin_reviewer",
    "admin_preparer",
  ]);
  const policyId = data?.policy?.id;
  const risksWithoutChildren = oc(data).policy.risks([]);
  const riskFirstChild = data?.policy?.children?.map((a) => a.risks) || [];
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
  const [newDataRisks, setNewDataRisks] = useState(newData);

  useEffect(() => {
    if (
      !(isAdmin || isAdminReviewer || isAdminPreparer) &&
      newData === newDataRisks
    ) {
      setNewDataRisks(newData.filter((a) => a.status === "release"));
    }
  }, [isAdmin, isAdminReviewer, isAdminPreparer, newData, newDataRisks]);
  return dataModifier(newDataRisks).length ? (
    <ul>
      {dataModifier(newDataRisks).map((risk: any) => (
        <li key={risk.id}>
          <div className="mb-3 d-flex justify-content-between">
            <PWCLink
              to={`/policy/${policyId}/details/risk/${risk.id}`}
              onClick={() => setRiskId(risk.id)}
              style={{ fontSize: "14px" }}
            >
              {risk.name}
              <Badge color="secondary mx-3" style={{fontSize: '13px'}}>
                {startCase(risk.levelOfRisk || "")}
              </Badge>
              <Badge color="secondary" style={{fontSize: '13px'}}>
                {startCase(risk.typeOfRisk || "")}
              </Badge>
            </PWCLink>
          </div>
        </li>
      ))}
      {/* {editRisk && (
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
            )} */}
      {/* 
          {withRelatedControls && risk.controls?.length ? (
            <>
              <h6>Control</h6>
              <ControlsTable
                controls={risk.controls}
                editControl={editControl}
              />
            </>
          ) : null} */}
    </ul>
  ) : (
    <EmptyAttribute />
  );
}
