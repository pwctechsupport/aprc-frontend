import startCase from "lodash/startCase";
import React from "react";
import { FaPencilAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import { Badge } from "reactstrap";
import { LevelOfRisk, Risk, TypeOfRisk } from "../../generated/graphql";
import { toLabelValue } from "../formatter";
import getRiskColor from "../utils/getRiskColor";
import Button from "./Button";
import ControlsTable from "./ControlsTable";
import EmptyAttribute from "./EmptyAttribute";

interface RisksListProps {
  risks: Risk[];
  editRisk?: Function;
  editControl?: Function;
  withRelatedControls?: boolean;
}

export default function RisksList({
  risks,
  editRisk,
  editControl,
  withRelatedControls
}: RisksListProps) {
  return risks.length ? (
    <ul>
      {risks.map(risk => (
        <li key={risk.id}>
          <div className="mb-3 d-flex justify-content-between">
            <h6>
              <Link to={`/risk/${risk.id}`}>{risk.name}</Link>
              <Badge color={`${getRiskColor(risk.levelOfRisk)} mx-3`}>
                {startCase(risk.levelOfRisk || "")}
              </Badge>
              <Badge color="secondary">
                {startCase(risk.typeOfRisk || "")}
              </Badge>
            </h6>
            {editRisk && (
              <Button
                onClick={() =>
                  editRisk({
                    id: risk.id,
                    name: risk.name || "",
                    businessProcessIds:
                      risk.businessProcesses?.map(toLabelValue) || [],
                    levelOfRisk: risk.levelOfRisk as LevelOfRisk,
                    typeOfRisk: risk.typeOfRisk as TypeOfRisk
                  })
                }
                color=""
              >
                <FaPencilAlt />
              </Button>
            )}
          </div>

          {withRelatedControls && risk.controls?.length ? (
            <>
              <h6>Control</h6>
              <ControlsTable
                controls={risk.controls}
                editControl={editControl}
              />
            </>
          ) : null}
        </li>
      ))}
    </ul>
  ) : (
    <EmptyAttribute />
  );
}
