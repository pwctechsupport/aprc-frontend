import React from "react";
import PolicyChart from "./components/PolicyChart";
import { usePolicyDashboardQuery } from "../../generated/graphql";
import { oc } from "ts-optchain";
import Table from "../../shared/components/Table";
import Helmet from "react-helmet";

const PolicyDashboard = () => {
  const { data } = usePolicyDashboardQuery();
  const chartData = [
    {
      label: "Policy",
      prepared: oc(data).draftPolicies.metadata.totalCount(0),
      reviewed: oc(data).releasedPolicies.metadata.totalCount(0)
    },
    {
      label: "Risk",
      prepared: oc(data).draftRisks.metadata.totalCount(0),
      reviewed: oc(data).releasedRisks.metadata.totalCount(0)
    },
    {
      label: "Control",
      prepared: oc(data).draftControls.metadata.totalCount(0),
      reviewed: oc(data).releasedControls.metadata.totalCount(0)
    }
  ];
  const tableData = [
    {
      label: "Prepared",
      policy: oc(data).draftPolicies.metadata.totalCount(0),
      risk: oc(data).draftRisks.metadata.totalCount(0),
      control: oc(data).draftControls.metadata.totalCount(0),
      sum() {
        return this.policy + this.risk + this.control;
      }
    },
    {
      label: "Reviewed",
      policy: oc(data).releasedPolicies.metadata.totalCount(0),
      risk: oc(data).releasedRisks.metadata.totalCount(0),
      control: oc(data).releasedControls.metadata.totalCount(0),
      sum() {
        return this.policy + this.risk + this.control;
      }
    }
  ];
  return (
    <div>
      <Helmet>
        <title>Policy - Dashboard - PricewaterhouseCoopers</title>
      </Helmet>
      <h1>Dashboard</h1>
      <PolicyChart data={chartData} />
      <Table className="mt-5">
        <thead>
          <tr>
            <th>Task Manager</th>
            <th>Policies</th>
            <th>Risks</th>
            <th>Controls</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((item, index) => {
            return (
              <tr key={index}>
                <td>{item.label}</td>
                <td>{item.policy}</td>
                <td>{item.risk}</td>
                <td>{item.control}</td>
                <td>{item.sum()}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};

export default PolicyDashboard;
