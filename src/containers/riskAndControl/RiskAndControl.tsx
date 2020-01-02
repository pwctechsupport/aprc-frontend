import { capitalCase } from "capital-case";
import get from "lodash/get";
import React, { useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { Badge, Table } from "reactstrap";
import { oc } from "ts-optchain";
import { useBusinessProcessQuery } from "../../generated/graphql";
import Collapsible, {
  UncontrolledCollapsible
} from "../../shared/components/Collapsible";
import EmptyAttribute from "../../shared/components/EmptyAttribute";
import LoadingSpinner from "../../shared/components/LoadingSpinner";
import ResourceBar from "../../shared/components/ResourceBar";
import HeaderWithBackButton from "../../shared/components/HeaderWithBack";
import { FaEyeSlash, FaEye } from "react-icons/fa";
import Button from "../../shared/components/Button";

const RiskAndControls = ({ match, history }: RouteComponentProps) => {
  const initialCollapse = ["Resources", "Risks", "Controls", "Sub-Policies"];
  const [collapse, setCollapse] = useState(initialCollapse);
  const toggleCollapse = (name: string) =>
    setCollapse(p => {
      if (p.includes(name)) {
        return p.filter(item => item !== name);
      }
      return p.concat(name);
    });
  const openAllCollapse = () => setCollapse(initialCollapse);
  const closeAllCollapse = () => setCollapse([]);

  const id = get(match, "params.id", "");
  const { data, loading } = useBusinessProcessQuery({
    variables: { id },
    fetchPolicy: "network-only"
  });

  const name = oc(data).businessProcess.name("");
  const risks = oc(data).businessProcess.risks([]);
  const resources = oc(data).businessProcess.resources([]);

  if (loading) return <LoadingSpinner size={30} centered />;

  const renderActions = () => {
    return (
      <Button
        className="ml-3"
        color="transparent"
        onClick={() => {
          collapse.length === initialCollapse.length
            ? closeAllCollapse()
            : openAllCollapse();
        }}
      >
        {collapse.length === initialCollapse.length ? (
          <FaEyeSlash size={20} />
        ) : (
          <FaEye size={20} />
        )}
      </Button>
    );
  };

  return (
    <div>
      <div className="d-flex justify-content-between">
        <HeaderWithBackButton heading={name} />
        {renderActions()}
      </div>
      <Collapsible
        title="Risks"
        show={collapse.includes("Risks")}
        onClick={toggleCollapse}
      >
        {risks.length ? (
          <ul>
            {risks.map(risk => (
              <li>
                <div className="mb-3 d-flex">
                  <h5>
                    {risk.name}{" "}
                    <Badge color="danger mx-3">
                      {capitalCase(risk.levelOfRisk || "")}
                    </Badge>
                    <Badge color="danger">
                      {capitalCase(risk.typeOfRisk || "")}
                    </Badge>
                  </h5>
                </div>
                {risk.controls.length ? (
                  risk.controls.map(control => (
                    <Table>
                      <thead>
                        <tr>
                          <th>Freq</th>
                          <th>Type of Control</th>
                          <th>Nature</th>
                          <th>IPO</th>
                          <th>Assertion</th>
                          <th>Control Owner</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr key={control.id}>
                          <td>{capitalCase(control.frequency || "")}</td>
                          <td>{capitalCase(control.typeOfControl || "")}</td>
                          <td>{capitalCase(control.nature || "")}</td>
                          {/* <td>{capitalCase(control.ipo || "")}</td> */}
                          {/* <td>{capitalCase(control.assertion || "")}</td> */}
                          <td>{control.controlOwner}</td>
                        </tr>
                      </tbody>
                    </Table>
                  ))
                ) : (
                  <EmptyAttribute />
                )}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyAttribute />
        )}
      </Collapsible>
      <Collapsible
        title="Resources"
        show={collapse.includes("Resources")}
        onClick={toggleCollapse}
      >
        {resources.length ? (
          resources.map(resource => {
            return <ResourceBar key={resource.id} {...resource} />;
          })
        ) : (
          <EmptyAttribute />
        )}
      </Collapsible>
    </div>
  );
};

export default RiskAndControls;
